create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  email text,
  platform text not null check (platform in ('ios', 'android', 'web', 'other')),
  topic text not null check (
    topic in ('account', 'listing', 'safety', 'privacy', 'deletion', 'bug', 'other')
  ),
  device text,
  os_version text,
  message text not null check (
    char_length(btrim(message)) between 10 and 2000
  ),
  locale text not null default 'en' check (locale in ('uk', 'en')),
  user_agent text,
  source_url text,
  status text not null default 'new' check (
    status in ('new', 'in_progress', 'resolved', 'closed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_requests_email_length check (
    email is null or char_length(email) <= 254
  ),
  constraint support_requests_device_length check (
    device is null or char_length(device) <= 120
  ),
  constraint support_requests_os_version_length check (
    os_version is null or char_length(os_version) <= 80
  ),
  constraint support_requests_user_agent_length check (
    user_agent is null or char_length(user_agent) <= 500
  ),
  constraint support_requests_source_url_length check (
    source_url is null or char_length(source_url) <= 1000
  )
);

alter table public.support_requests enable row level security;

revoke all on table public.support_requests from public, anon, authenticated;
grant insert, select, update on table public.support_requests to service_role;

create index if not exists support_requests_status_created_at_idx
on public.support_requests (status, created_at desc);

create or replace function public.get_public_book_listing(p_listing_id uuid)
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
    listing.created_at,
    seller.display_name,
    seller.avatar_url,
    (
      select count(*)::integer
      from public.book_listings as other
      where other.seller_id = listing.seller_id
        and other.status = 'active'
        and not other.is_deleted
    ),
    seller.rating_average,
    seller.review_count,
    null::double precision
  from public.book_listings as listing
  join public.profiles as seller on seller.id = listing.seller_id
  where
    listing.id = p_listing_id
    and listing.status = 'active'
    and not listing.is_deleted
    and (
      auth.uid() is null
      or (
        not public.has_blocked(auth.uid(), listing.seller_id)
        and not public.has_blocked(listing.seller_id, auth.uid())
      )
    );
$$;

revoke all on function public.get_public_book_listing(uuid) from public;
grant execute on function public.get_public_book_listing(uuid)
to anon, authenticated, service_role;

grant execute on function public.get_public_user_profile(uuid) to service_role;
grant execute on function public.get_public_user_listings(uuid) to service_role;
