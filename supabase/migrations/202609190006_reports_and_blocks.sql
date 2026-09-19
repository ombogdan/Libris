create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

alter table public.user_blocks enable row level security;

drop policy if exists "Users can read their own blocks" on public.user_blocks;
create policy "Users can read their own blocks"
on public.user_blocks for select
to authenticated
using (blocker_id = (select auth.uid()));

revoke all on public.user_blocks from public, anon, authenticated;
grant select on public.user_blocks to authenticated;

create index if not exists user_blocks_blocked_id_idx
on public.user_blocks (blocked_id);

drop view if exists public.blocked_user_profiles;
create view public.blocked_user_profiles
with (security_invoker = true, security_barrier = true)
as
select
  block.blocked_id,
  profile.display_name,
  profile.avatar_url,
  block.created_at as blocked_at
from public.user_blocks as block
join public.profiles as profile on profile.id = block.blocked_id
where block.blocker_id = auth.uid();

revoke all on public.blocked_user_profiles from public, anon;
grant select on public.blocked_user_profiles to authenticated;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.book_listings(id) on delete set null,
  listing_title text,
  reason text not null check (
    reason in ('spam', 'scam', 'inappropriate', 'fake_listing', 'harassment', 'other')
  ),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  constraint reports_target_check check (
    reported_user_id is not null or listing_id is not null
  )
);

alter table public.reports enable row level security;

drop policy if exists "Users can read their own reports" on public.reports;
create policy "Users can read their own reports"
on public.reports for select
to authenticated
using (reporter_id = (select auth.uid()));

revoke all on public.reports from public, anon, authenticated;
grant select on public.reports to authenticated;

create index if not exists reports_reported_user_id_idx
on public.reports (reported_user_id);

create or replace function public.has_blocked(p_blocker uuid, p_blocked uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.user_blocks
    where blocker_id = p_blocker and blocked_id = p_blocked
  );
$$;

revoke all on function public.has_blocked(uuid, uuid) from public;
grant execute on function public.has_blocked(uuid, uuid) to authenticated;

create or replace function public.block_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_user_id = current_user_id then
    raise exception 'Cannot block yourself' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  insert into public.user_blocks (blocker_id, blocked_id)
  values (current_user_id, p_user_id)
  on conflict (blocker_id, blocked_id) do nothing;
end;
$$;

revoke all on function public.block_user(uuid) from public, anon;
grant execute on function public.block_user(uuid) to authenticated;

create or replace function public.unblock_user(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.user_blocks
  where blocker_id = auth.uid() and blocked_id = p_user_id;
$$;

revoke all on function public.unblock_user(uuid) from public, anon;
grant execute on function public.unblock_user(uuid) to authenticated;

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

    target_listing_title := listing_record.title;
    target_user_id := coalesce(target_user_id, listing_record.seller_id);
  end if;

  if target_user_id = current_user_id then
    raise exception 'Cannot report yourself' using errcode = '22023';
  end if;

  insert into public.reports (
    reporter_id,
    reported_user_id,
    listing_id,
    listing_title,
    reason,
    comment
  )
  values (
    current_user_id,
    target_user_id,
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

drop policy if exists "Authenticated users can view available listings"
on public.book_listings;
create policy "Authenticated users can view available listings"
on public.book_listings for select
to authenticated
using (
  not is_deleted
  and (
    status = 'active'
    or seller_id = (select auth.uid())
  )
  and not public.has_blocked((select auth.uid()), seller_id)
);

drop policy if exists "Participants can send messages"
on public.chat_messages;
create policy "Participants can send messages"
on public.chat_messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.chat_conversations as conversation
    where
      conversation.id = conversation_id
      and conversation.archive_reason is distinct from 'deleted'
      and (
        conversation.buyer_id = (select auth.uid())
        or conversation.seller_id = (select auth.uid())
      )
      and not public.has_blocked(conversation.buyer_id, conversation.seller_id)
      and not public.has_blocked(conversation.seller_id, conversation.buyer_id)
  )
);

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
from public;
grant execute on function public.get_or_create_listing_conversation(uuid)
to authenticated;

drop view if exists public.chat_conversation_summaries;
create view public.chat_conversation_summaries
with (security_invoker = true, security_barrier = true)
as
select
  conversation.id as conversation_id,
  conversation.listing_id,
  conversation.listing_title,
  conversation.listing_price,
  conversation.listing_cover_url,
  conversation.buyer_id,
  conversation.seller_id,
  other_profile.id as other_user_id,
  other_profile.display_name as other_user_display_name,
  other_profile.avatar_url as other_user_avatar_url,
  conversation.last_message_text,
  conversation.last_message_sender_id,
  conversation.last_message_at,
  case
    when conversation.buyer_id = auth.uid()
      then conversation.buyer_unread_count
    else conversation.seller_unread_count
  end as unread_count,
  case
    when conversation.archived_at is not null then 'archive'
    when conversation.buyer_id = auth.uid() then 'buying'
    else 'selling'
  end as section,
  conversation.archived_at,
  conversation.archive_reason,
  (
    conversation.review_enabled
    and conversation.archive_reason = 'sold'
    and conversation.last_message_at is not null
    and my_review.id is null
  ) as can_review,
  my_review.rating as my_review_rating,
  conversation.created_at,
  conversation.updated_at
from public.chat_conversations as conversation
cross join lateral public.get_chat_other_participant_profile(
  conversation.id
) as other_profile
left join public.reviews as my_review
  on my_review.conversation_id = conversation.id
  and my_review.reviewer_id = auth.uid()
where
  auth.uid() in (conversation.buyer_id, conversation.seller_id)
  and (
    conversation.archived_at is not null
    or conversation.last_message_at is not null
  )
  and not public.has_blocked(auth.uid(), other_profile.id);

revoke all on public.chat_conversation_summaries from public, anon;
grant select on public.chat_conversation_summaries to authenticated;

drop view if exists public.listing_seller_profiles;
create view public.listing_seller_profiles
with (security_barrier = true)
as
select
  profile.id,
  profile.display_name,
  profile.avatar_url,
  count(listing.id) filter (
    where listing.status = 'active' and not listing.is_deleted
  )::integer as listings_count,
  profile.rating_average,
  profile.review_count
from public.profiles as profile
join public.book_listings as listing on listing.seller_id = profile.id
where
  not listing.is_deleted
  and (
    listing.status = 'active'
    or listing.seller_id = (select auth.uid())
  )
  and not public.has_blocked((select auth.uid()), profile.id)
group by
  profile.id,
  profile.display_name,
  profile.avatar_url,
  profile.rating_average,
  profile.review_count;

revoke all on public.listing_seller_profiles from public, anon;
grant select on public.listing_seller_profiles to authenticated;

create or replace function public.get_public_user_listings(p_user_id uuid)
returns table (
  id uuid,
  seller_id uuid,
  title text,
  author text,
  price integer,
  category text,
  condition text,
  description text,
  city text,
  latitude double precision,
  longitude double precision,
  cover_url text,
  image_urls text[],
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    listing.id,
    listing.seller_id,
    listing.title,
    listing.author,
    listing.price,
    listing.category,
    listing.condition,
    listing.description,
    listing.city,
    listing.latitude,
    listing.longitude,
    listing.cover_url,
    listing.image_urls,
    listing.created_at
  from public.book_listings as listing
  where
    listing.seller_id = p_user_id
    and listing.status = 'active'
    and not listing.is_deleted
    and (auth.uid() is null or not public.has_blocked(auth.uid(), listing.seller_id))
  order by listing.created_at desc;
$$;

create or replace function public.search_book_listings(
  p_query text default null,
  p_city text default null,
  p_category text default null,
  p_free_only boolean default false,
  p_min_price integer default null,
  p_max_price integer default null,
  p_condition text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_radius_km double precision default null,
  p_sort text default 'recent',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  seller_id uuid,
  title text,
  author text,
  price integer,
  category text,
  condition text,
  description text,
  city text,
  latitude double precision,
  longitude double precision,
  cover_url text,
  image_urls text[],
  created_at timestamptz,
  seller_display_name text,
  seller_avatar_url text,
  seller_listings_count integer,
  seller_rating_average double precision,
  seller_review_count integer,
  distance_km double precision
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_limit integer := greatest(1, least(coalesce(p_limit, 20), 50));
  normalized_offset integer := greatest(0, coalesce(p_offset, 0));
  normalized_query text := nullif(btrim(coalesce(p_query, '')), '');
  has_origin boolean := p_latitude is not null and p_longitude is not null;
begin
  return query
  with scored as (
    select
      listing.id,
      listing.seller_id,
      listing.title,
      listing.author,
      listing.price,
      listing.category,
      listing.condition,
      listing.description,
      listing.city,
      listing.latitude,
      listing.longitude,
      listing.cover_url,
      listing.image_urls,
      listing.created_at,
      case
        when has_origin
          and listing.latitude is not null
          and listing.longitude is not null
        then 6371 * acos(least(1.0, greatest(-1.0,
          cos(radians(p_latitude)) * cos(radians(listing.latitude))
            * cos(radians(listing.longitude) - radians(p_longitude))
            + sin(radians(p_latitude)) * sin(radians(listing.latitude))
        )))
        else null
      end as distance_km
    from public.book_listings as listing
    where
      not listing.is_deleted
      and listing.status = 'active'
      and (
        current_user_id is null
        or not public.has_blocked(current_user_id, listing.seller_id)
      )
      and (
        p_city is null
        or lower(btrim(listing.city)) = lower(btrim(p_city))
      )
      and (p_category is null or listing.category = p_category)
      and (not coalesce(p_free_only, false) or listing.price = 0)
      and (p_min_price is null or listing.price >= p_min_price)
      and (p_max_price is null or listing.price <= p_max_price)
      and (p_condition is null or listing.condition = p_condition)
      and (
        normalized_query is null
        or listing.title ilike '%' || normalized_query || '%'
        or listing.author ilike '%' || normalized_query || '%'
        or listing.city ilike '%' || normalized_query || '%'
      )
  )
  select
    scored.id,
    scored.seller_id,
    scored.title,
    scored.author,
    scored.price,
    scored.category,
    scored.condition,
    scored.description,
    scored.city,
    scored.latitude,
    scored.longitude,
    scored.cover_url,
    scored.image_urls,
    scored.created_at,
    seller.display_name as seller_display_name,
    seller.avatar_url as seller_avatar_url,
    (
      select count(*)::integer
      from public.book_listings as other
      where other.seller_id = scored.seller_id
        and other.status = 'active'
        and not other.is_deleted
    ) as seller_listings_count,
    seller.rating_average as seller_rating_average,
    seller.review_count as seller_review_count,
    scored.distance_km
  from scored
  join public.profiles as seller on seller.id = scored.seller_id
  where
    p_radius_km is null
    or scored.distance_km is null
    or scored.distance_km <= p_radius_km
  order by
    case when p_sort = 'price_asc' then scored.price end asc nulls last,
    case when p_sort = 'price_desc' then scored.price end desc nulls last,
    case when p_sort = 'distance' then scored.distance_km end asc nulls last,
    scored.created_at desc
  limit normalized_limit
  offset normalized_offset;
end;
$$;

revoke all on function public.search_book_listings(
  text, text, text, boolean, integer, integer, text,
  double precision, double precision, double precision,
  text, integer, integer
) from public, anon;
grant execute on function public.search_book_listings(
  text, text, text, boolean, integer, integer, text,
  double precision, double precision, double precision,
  text, integer, integer
) to anon, authenticated;
