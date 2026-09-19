alter table public.profiles
add column if not exists review_count integer not null default 0
  check (review_count >= 0),
add column if not exists rating_average double precision not null default 0
  check (rating_average between 0 and 5);

revoke update on public.profiles from authenticated;
grant update (
  display_name,
  phone,
  email,
  avatar_url,
  city,
  latitude,
  longitude,
  onboarding_completed,
  updated_at
) on public.profiles to authenticated;

alter table public.book_listings
add column if not exists is_deleted boolean not null default false,
add column if not exists deleted_at timestamptz,
add column if not exists sold_at timestamptz,
add column if not exists sold_conversation_id uuid;

alter table public.book_listings
drop constraint if exists book_listings_delete_state_check;
alter table public.book_listings
add constraint book_listings_delete_state_check check (
  (is_deleted and deleted_at is not null)
  or (not is_deleted and deleted_at is null)
);

alter table public.book_listings
drop constraint if exists book_listings_sold_conversation_fkey;
alter table public.book_listings
add constraint book_listings_sold_conversation_fkey
foreign key (sold_conversation_id)
references public.chat_conversations(id)
on delete set null;

update public.book_listings
set sold_at = coalesce(sold_at, updated_at, created_at)
where status = 'sold' and sold_at is null;

create index if not exists book_listings_deleted_at_idx
on public.book_listings (deleted_at)
where is_deleted;

drop policy if exists "Authenticated users can view active listings"
on public.book_listings;
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
);

drop policy if exists "Users can create their own listings"
on public.book_listings;
create policy "Users can create their own listings"
on public.book_listings for insert
to authenticated
with check (
  seller_id = (select auth.uid())
  and seller_name = (
    select profile.display_name
    from public.profiles as profile
    where profile.id = (select auth.uid())
  )
  and status = 'active'
  and not is_deleted
  and deleted_at is null
);

drop policy if exists "Users can update their own listings"
on public.book_listings;
drop policy if exists "Users can update their available listings"
on public.book_listings;
create policy "Users can update their available listings"
on public.book_listings for update
to authenticated
using (
  seller_id = (select auth.uid())
  and not is_deleted
)
with check (
  seller_id = (select auth.uid())
  and not is_deleted
);

drop policy if exists "Users can delete their own listings"
on public.book_listings;
revoke delete on public.book_listings from authenticated;
revoke update on public.book_listings from authenticated;
grant update (
  title,
  author,
  price,
  category,
  condition,
  description,
  city,
  latitude,
  longitude,
  cover_url,
  image_urls,
  updated_at
) on public.book_listings to authenticated;

drop policy if exists "Users can add their own favorites"
on public.book_favorites;
drop policy if exists "Users can add available favorites"
on public.book_favorites;
create policy "Users can add available favorites"
on public.book_favorites for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.book_listings as listing
    where
      listing.id = listing_id
      and listing.status = 'active'
      and not listing.is_deleted
  )
);

create table if not exists public.book_listing_images (
  listing_id uuid not null
    references public.book_listings(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  position smallint not null default 0 check (position between 0 and 4),
  created_at timestamptz not null default now(),
  primary key (listing_id, storage_path),
  unique (storage_path)
);

alter table public.book_listing_images enable row level security;

drop policy if exists "Owners can read listing image records"
on public.book_listing_images;
create policy "Owners can read listing image records"
on public.book_listing_images for select
to authenticated
using (
  exists (
    select 1
    from public.book_listings as listing
    where
      listing.id = listing_id
      and listing.seller_id = (select auth.uid())
      and not listing.is_deleted
  )
);

drop policy if exists "Owners can add listing image records"
on public.book_listing_images;
create policy "Owners can add listing image records"
on public.book_listing_images for insert
to authenticated
with check (
  split_part(storage_path, '/', 1) = (select auth.uid())::text
  and split_part(storage_path, '/', 2) = listing_id::text
  and exists (
    select 1
    from public.book_listings as listing
    where
      listing.id = listing_id
      and listing.seller_id = (select auth.uid())
      and not listing.is_deleted
  )
);

drop policy if exists "Owners can remove listing image records"
on public.book_listing_images;
create policy "Owners can remove listing image records"
on public.book_listing_images for delete
to authenticated
using (
  exists (
    select 1
    from public.book_listings as listing
    where
      listing.id = listing_id
      and listing.seller_id = (select auth.uid())
      and not listing.is_deleted
  )
);

revoke all on public.book_listing_images from public, anon;
grant select, insert, delete on public.book_listing_images to authenticated;

insert into public.book_listing_images (
  listing_id,
  storage_path,
  public_url,
  position
)
select
  listing.id,
  parsed.storage_path,
  image.public_url,
  least(image.position - 1, 4)::smallint
from public.book_listings as listing
cross join lateral unnest(listing.image_urls)
  with ordinality as image(public_url, position)
cross join lateral (
  select split_part(
    split_part(
      image.public_url,
      '/storage/v1/object/public/book-images/',
      2
    ),
    '?',
    1
  ) as storage_path
) as parsed
join storage.objects as object
  on object.bucket_id = 'book-images'
  and object.name = parsed.storage_path
where
  parsed.storage_path <> ''
  and split_part(parsed.storage_path, '/', 1) = listing.seller_id::text
  and split_part(parsed.storage_path, '/', 2) = listing.id::text
on conflict (listing_id, storage_path) do nothing;

alter table public.chat_conversations
add column if not exists archived_at timestamptz,
add column if not exists archive_reason text,
add column if not exists review_enabled boolean not null default false;

alter table public.chat_conversations
drop constraint if exists chat_conversations_archive_reason_check;
alter table public.chat_conversations
add constraint chat_conversations_archive_reason_check check (
  archive_reason is null
  or archive_reason in ('sold', 'deleted', 'hidden')
);

alter table public.chat_conversations
drop constraint if exists chat_conversations_archive_pair_check;
alter table public.chat_conversations
add constraint chat_conversations_archive_pair_check check (
  (archived_at is null) = (archive_reason is null)
);

update public.chat_conversations as conversation
set
  listing_title = listing.title,
  listing_price = listing.price,
  listing_cover_url = coalesce(listing.cover_url, listing.image_urls[1]),
  archived_at = case
    when listing.is_deleted
      then coalesce(listing.deleted_at, listing.updated_at, now())
    when listing.status <> 'active'
      then coalesce(listing.sold_at, listing.updated_at, now())
    else null
  end,
  archive_reason = case
    when listing.is_deleted then 'deleted'
    when listing.status = 'sold' then 'sold'
    when listing.status = 'hidden' then 'hidden'
    else null
  end,
  review_enabled = (
    listing.status = 'sold'
    and not listing.is_deleted
    and listing.sold_conversation_id = conversation.id
  )
from public.book_listings as listing
where conversation.listing_id = listing.id;

create index if not exists chat_conversations_archive_activity_idx
on public.chat_conversations (
  archived_at,
  last_message_at desc nulls last,
  created_at desc
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid
    references public.chat_conversations(id) on delete set null,
  listing_id uuid
    references public.book_listings(id) on delete set null,
  listing_title text not null,
  reviewer_id uuid not null
    references public.profiles(id) on delete cascade,
  reviewee_id uuid not null
    references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_distinct_participants check (reviewer_id <> reviewee_id),
  constraint reviews_conversation_reviewer_key
    unique (conversation_id, reviewer_id)
);

alter table public.reviews enable row level security;

drop policy if exists "Authenticated users can read reviews"
on public.reviews;
drop policy if exists "Participants can read related reviews"
on public.reviews;
create policy "Participants can read related reviews"
on public.reviews for select
to authenticated
using ((select auth.uid()) in (reviewer_id, reviewee_id));

revoke all on public.reviews from public, anon, authenticated;
grant select on public.reviews to authenticated;

create index if not exists reviews_reviewee_created_at_idx
on public.reviews (reviewee_id, created_at desc);

create or replace function public.recompute_profile_review_summary(
  p_profile_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set
    review_count = summary.review_count,
    rating_average = summary.rating_average
  from (
    select
      count(*)::integer as review_count,
      coalesce(round(avg(rating)::numeric, 2), 0)::double precision
        as rating_average
    from public.reviews
    where reviewee_id = p_profile_id
  ) as summary
  where id = p_profile_id;
$$;

revoke all on function public.recompute_profile_review_summary(uuid)
from public;

create or replace function public.on_review_summary_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_profile_review_summary(old.reviewee_id);
    return old;
  end if;

  perform public.recompute_profile_review_summary(new.reviewee_id);
  if tg_op = 'UPDATE' and old.reviewee_id is distinct from new.reviewee_id then
    perform public.recompute_profile_review_summary(old.reviewee_id);
  end if;
  return new;
end;
$$;

revoke all on function public.on_review_summary_changed() from public;

drop trigger if exists on_review_summary_changed on public.reviews;
create trigger on_review_summary_changed
  after insert or update or delete on public.reviews
  for each row execute procedure public.on_review_summary_changed();

create or replace function public.sync_listing_chat_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_conversations as conversation
  set
    listing_title = new.title,
    listing_price = new.price,
    listing_cover_url = coalesce(new.cover_url, new.image_urls[1]),
    archived_at = case
      when new.is_deleted then coalesce(new.deleted_at, now())
      when new.status <> 'active' then coalesce(new.sold_at, now())
      else null
    end,
    archive_reason = case
      when new.is_deleted then 'deleted'
      when new.status = 'sold' then 'sold'
      when new.status = 'hidden' then 'hidden'
      else null
    end,
    review_enabled = (
      new.status = 'sold'
      and not new.is_deleted
      and new.sold_conversation_id = conversation.id
    )
  where conversation.listing_id = new.id;

  return new;
end;
$$;

revoke all on function public.sync_listing_chat_state() from public;

drop trigger if exists on_listing_chat_state_changed
on public.book_listings;
create trigger on_listing_chat_state_changed
  after update of
    title,
    price,
    cover_url,
    image_urls,
    status,
    is_deleted,
    deleted_at,
    sold_at,
    sold_conversation_id
  on public.book_listings
  for each row execute procedure public.sync_listing_chat_state();

create table if not exists public.listing_purge_jobs (
  listing_id uuid primary key
    references public.book_listings(id) on delete cascade,
  run_after timestamptz not null,
  storage_paths text[] not null default '{}',
  claimed_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now()
);

alter table public.listing_purge_jobs enable row level security;
revoke all on public.listing_purge_jobs from public, anon, authenticated;
revoke all on public.listing_purge_jobs from service_role;

create or replace function public.soft_delete_book_listing(
  p_listing_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  listing_record public.book_listings%rowtype;
  deletion_time timestamptz := now();
  image_paths text[];
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into listing_record
  from public.book_listings
  where id = p_listing_id
  for update;

  if not found or listing_record.seller_id <> current_user_id then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  if listing_record.is_deleted then
    return;
  end if;

  select coalesce(array_agg(storage_path order by position), '{}')
  into image_paths
  from public.book_listing_images
  where listing_id = p_listing_id;

  update public.book_listings
  set
    is_deleted = true,
    deleted_at = deletion_time,
    status = 'hidden',
    updated_at = deletion_time
  where id = p_listing_id;

  delete from public.book_favorites where listing_id = p_listing_id;

  insert into public.listing_purge_jobs (
    listing_id,
    run_after,
    storage_paths
  )
  values (
    p_listing_id,
    deletion_time + interval '3 months',
    image_paths
  )
  on conflict (listing_id) do update
  set
    run_after = excluded.run_after,
    storage_paths = excluded.storage_paths,
    claimed_at = null,
    last_error = null;
end;
$$;

revoke all on function public.soft_delete_book_listing(uuid)
from public, anon;
grant execute on function public.soft_delete_book_listing(uuid)
to authenticated;

create or replace function public.mark_book_listing_sold(
  p_listing_id uuid,
  p_conversation_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  listing_record public.book_listings%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into listing_record
  from public.book_listings
  where id = p_listing_id
  for update;

  if not found
    or listing_record.seller_id <> current_user_id
    or listing_record.is_deleted
    or listing_record.status <> 'active' then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  if p_conversation_id is not null and not exists (
    select 1
    from public.chat_conversations as conversation
    where
      conversation.id = p_conversation_id
      and conversation.listing_id = p_listing_id
      and conversation.seller_id = current_user_id
      and conversation.last_message_at is not null
  ) then
    raise exception 'Buyer conversation not found' using errcode = '22023';
  end if;

  update public.book_listings
  set
    status = 'sold',
    sold_at = now(),
    sold_conversation_id = p_conversation_id,
    updated_at = now()
  where id = p_listing_id;
end;
$$;

revoke all on function public.mark_book_listing_sold(uuid, uuid)
from public, anon;
grant execute on function public.mark_book_listing_sold(uuid, uuid)
to authenticated;

create or replace function public.reactivate_book_listing(
  p_listing_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  listing_record public.book_listings%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into listing_record
  from public.book_listings
  where id = p_listing_id
  for update;

  if not found
    or listing_record.seller_id <> current_user_id
    or listing_record.is_deleted then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.reviews where listing_id = p_listing_id
  ) then
    raise exception 'A reviewed sale cannot be reactivated'
      using errcode = '23514';
  end if;

  update public.book_listings
  set
    status = 'active',
    sold_at = null,
    sold_conversation_id = null,
    updated_at = now()
  where id = p_listing_id;
end;
$$;

revoke all on function public.reactivate_book_listing(uuid)
from public, anon;
grant execute on function public.reactivate_book_listing(uuid)
to authenticated;

create or replace function public.submit_conversation_review(
  p_conversation_id uuid,
  p_rating smallint,
  p_comment text default ''
)
returns public.reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  conversation_record public.chat_conversations%rowtype;
  review_record public.reviews%rowtype;
  target_user_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_rating not between 1 and 5
    or char_length(btrim(coalesce(p_comment, ''))) > 1000 then
    raise exception 'Invalid review' using errcode = '22023';
  end if;

  select *
  into conversation_record
  from public.chat_conversations
  where
    id = p_conversation_id
    and current_user_id in (buyer_id, seller_id)
  for update;

  if not found then
    raise exception 'Conversation not found' using errcode = 'P0002';
  end if;
  if not conversation_record.review_enabled
    or conversation_record.archive_reason <> 'sold'
    or conversation_record.last_message_at is null then
    raise exception 'Review is not available for this conversation'
      using errcode = '42501';
  end if;

  target_user_id := case
    when current_user_id = conversation_record.buyer_id
      then conversation_record.seller_id
    else conversation_record.buyer_id
  end;

  insert into public.reviews (
    conversation_id,
    listing_id,
    listing_title,
    reviewer_id,
    reviewee_id,
    rating,
    comment
  )
  values (
    conversation_record.id,
    conversation_record.listing_id,
    conversation_record.listing_title,
    current_user_id,
    target_user_id,
    p_rating,
    btrim(coalesce(p_comment, ''))
  )
  returning * into review_record;

  return review_record;
end;
$$;

revoke all on function public.submit_conversation_review(uuid, smallint, text)
from public, anon;
grant execute on function public.submit_conversation_review(uuid, smallint, text)
to authenticated;

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
  );

revoke all on public.chat_conversation_summaries from public, anon;
grant select on public.chat_conversation_summaries to authenticated;

drop view if exists public.profile_review_summaries;
create view public.profile_review_summaries
with (security_barrier = true)
as
select
  profile.id as user_id,
  profile.rating_average,
  profile.review_count
from public.profiles as profile;

revoke all on public.profile_review_summaries from public, anon;
grant select on public.profile_review_summaries to authenticated;

drop view if exists public.user_review_details;
create view public.user_review_details
with (security_barrier = true)
as
select
  review.id,
  review.listing_title,
  review.reviewer_id,
  reviewer.display_name as reviewer_name,
  reviewer.avatar_url as reviewer_avatar_url,
  review.reviewee_id,
  review.rating,
  review.comment,
  review.created_at,
  review.updated_at
from public.reviews as review
join public.profiles as reviewer on reviewer.id = review.reviewer_id;

revoke all on public.user_review_details from public, anon;
grant select on public.user_review_details to authenticated;

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
group by
  profile.id,
  profile.display_name,
  profile.avatar_url,
  profile.rating_average,
  profile.review_count;

revoke all on public.listing_seller_profiles from public, anon;
grant select on public.listing_seller_profiles to authenticated;

create or replace function public.claim_listing_purge_batch(
  p_limit integer default 25
)
returns table (listing_id uuid, storage_paths text[])
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with due_jobs as (
    select job.listing_id
    from public.listing_purge_jobs as job
    where
      job.run_after <= now()
      and (
        job.claimed_at is null
        or job.claimed_at < now() - interval '30 minutes'
      )
    order by job.run_after
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  )
  update public.listing_purge_jobs as job
  set
    claimed_at = now(),
    attempts = job.attempts + 1,
    last_error = null
  from due_jobs
  where job.listing_id = due_jobs.listing_id
  returning job.listing_id, job.storage_paths;
end;
$$;

revoke all on function public.claim_listing_purge_batch(integer)
from public, anon, authenticated;
grant execute on function public.claim_listing_purge_batch(integer)
to service_role;

create or replace function public.record_listing_purge_failure(
  p_listing_id uuid,
  p_error text
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.listing_purge_jobs
  set
    claimed_at = null,
    last_error = left(p_error, 1000)
  where listing_id = p_listing_id;
$$;

revoke all on function public.record_listing_purge_failure(uuid, text)
from public, anon, authenticated;
grant execute on function public.record_listing_purge_failure(uuid, text)
to service_role;

create or replace function public.finalize_listing_purge(
  p_listing_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.book_listings
    where
      id = p_listing_id
      and is_deleted
      and deleted_at <= now() - interval '3 months'
  ) then
    return false;
  end if;

  delete from public.chat_conversations where listing_id = p_listing_id;
  delete from public.book_listings where id = p_listing_id;
  return true;
end;
$$;

revoke all on function public.finalize_listing_purge(uuid)
from public, anon, authenticated;
grant execute on function public.finalize_listing_purge(uuid)
to service_role;
