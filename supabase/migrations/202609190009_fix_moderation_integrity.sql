-- Keep moderation evidence after either account or the listing is deleted.
alter table public.reports
add column if not exists reporter_snapshot_id uuid,
add column if not exists reported_user_snapshot_id uuid,
add column if not exists reported_user_name text,
add column if not exists listing_snapshot_id uuid;

update public.reports as report
set
  reporter_snapshot_id = coalesce(
    report.reporter_snapshot_id,
    report.reporter_id
  ),
  reported_user_snapshot_id = coalesce(
    report.reported_user_snapshot_id,
    report.reported_user_id
  ),
  listing_snapshot_id = coalesce(
    report.listing_snapshot_id,
    report.listing_id
  );

update public.reports as report
set reported_user_name = profile.display_name
from public.profiles as profile
where
  report.reported_user_name is null
  and profile.id = report.reported_user_id;

alter table public.reports
alter column reporter_id drop not null;

alter table public.reports
drop constraint if exists reports_reporter_id_fkey;
alter table public.reports
add constraint reports_reporter_id_fkey
foreign key (reporter_id) references public.profiles(id)
on delete set null;

alter table public.reports
drop constraint if exists reports_reported_user_id_fkey;
alter table public.reports
add constraint reports_reported_user_id_fkey
foreign key (reported_user_id) references public.profiles(id)
on delete set null;

alter table public.reports
drop constraint if exists reports_target_check;
alter table public.reports
add constraint reports_target_check check (
  reported_user_snapshot_id is not null
  or listing_snapshot_id is not null
);

alter table public.reports
drop constraint if exists reports_reporter_snapshot_check;
alter table public.reports
add constraint reports_reporter_snapshot_check check (
  reporter_snapshot_id is not null
);

create index if not exists reports_reporter_snapshot_id_idx
on public.reports (reporter_snapshot_id);

create index if not exists reports_reported_user_snapshot_id_idx
on public.reports (reported_user_snapshot_id);

create or replace function public.report_content(
  p_reason text,
  p_reported_user_id uuid default null,
  p_listing_id uuid default null,
  p_comment text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  listing_record public.book_listings%rowtype;
  target_user_id uuid := p_reported_user_id;
  target_user_name text;
  target_listing_title text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_reason not in (
    'spam', 'scam', 'inappropriate', 'fake_listing', 'harassment', 'other'
  ) then
    raise exception 'Invalid reason' using errcode = '22023';
  end if;
  if p_reported_user_id is null and p_listing_id is null then
    raise exception 'Nothing to report' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_comment, ''))) > 1000 then
    raise exception 'Comment is too long' using errcode = '22023';
  end if;

  if p_listing_id is not null then
    select * into listing_record
    from public.book_listings
    where id = p_listing_id;

    if not found then
      raise exception 'Listing not found' using errcode = 'P0002';
    end if;

    if p_reported_user_id is not null
      and p_reported_user_id <> listing_record.seller_id then
      raise exception 'Reported user does not own this listing'
        using errcode = '22023';
    end if;

    target_listing_title := listing_record.title;
    target_user_id := listing_record.seller_id;
  end if;

  if target_user_id = current_user_id then
    raise exception 'Cannot report yourself' using errcode = '22023';
  end if;

  select profile.display_name into target_user_name
  from public.profiles as profile
  where profile.id = target_user_id;

  if not found then
    raise exception 'Reported user not found' using errcode = 'P0002';
  end if;

  insert into public.reports (
    reporter_id,
    reporter_snapshot_id,
    reported_user_id,
    reported_user_snapshot_id,
    reported_user_name,
    listing_id,
    listing_snapshot_id,
    listing_title,
    reason,
    comment
  )
  values (
    current_user_id,
    current_user_id,
    target_user_id,
    target_user_id,
    target_user_name,
    p_listing_id,
    p_listing_id,
    target_listing_title,
    p_reason,
    btrim(coalesce(p_comment, ''))
  );
end;
$$;

revoke all on function public.report_content(text, uuid, uuid, text)
from public, anon;
grant execute on function public.report_content(text, uuid, uuid, text)
to authenticated;

-- Existing conversations must honor a later block before being returned.
create or replace function public.get_or_create_listing_conversation(
  p_listing_id uuid
)
returns setof public.chat_conversations
language plpgsql
security definer
set search_path = ''
rows 1
as $$
declare
  current_user_id uuid := auth.uid();
  listing_record public.book_listings%rowtype;
  conversation_record public.chat_conversations%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select conversation.*
  into conversation_record
  from public.chat_conversations as conversation
  where
    conversation.listing_id = p_listing_id
    and conversation.buyer_id = current_user_id;

  if found then
    if public.has_blocked(current_user_id, conversation_record.seller_id)
      or public.has_blocked(conversation_record.seller_id, current_user_id) then
      raise exception 'Cannot message this seller' using errcode = '42501';
    end if;

    return next conversation_record;
    return;
  end if;

  select listing.*
  into listing_record
  from public.book_listings as listing
  where
    listing.id = p_listing_id
    and listing.status = 'active'
    and not listing.is_deleted;

  if not found then
    raise exception 'Active listing not found' using errcode = 'P0002';
  end if;
  if listing_record.seller_id = current_user_id then
    raise exception 'A seller cannot start a conversation with themselves'
      using errcode = '22023';
  end if;
  if public.has_blocked(current_user_id, listing_record.seller_id)
    or public.has_blocked(listing_record.seller_id, current_user_id) then
    raise exception 'Cannot message this seller' using errcode = '42501';
  end if;

  insert into public.chat_conversations (
    listing_id,
    buyer_id,
    seller_id,
    listing_title,
    listing_price,
    listing_cover_url
  )
  values (
    listing_record.id,
    current_user_id,
    listing_record.seller_id,
    listing_record.title,
    listing_record.price,
    coalesce(listing_record.cover_url, listing_record.image_urls[1])
  )
  on conflict (listing_id, buyer_id) do update
  set
    listing_title = excluded.listing_title,
    listing_price = excluded.listing_price,
    listing_cover_url = excluded.listing_cover_url
  returning * into conversation_record;

  return next conversation_record;
end;
$$;

revoke all on function public.get_or_create_listing_conversation(uuid)
from public, anon;
grant execute on function public.get_or_create_listing_conversation(uuid)
to authenticated;
