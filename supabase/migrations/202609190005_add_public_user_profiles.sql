create or replace function public.get_public_user_profile(p_user_id uuid)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  city text,
  created_at timestamptz,
  listings_count integer,
  rating_average double precision,
  review_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.id,
    profile.display_name,
    profile.avatar_url,
    profile.city,
    profile.created_at,
    count(listing.id) filter (
      where listing.status = 'active' and not listing.is_deleted
    )::integer,
    profile.rating_average,
    profile.review_count
  from public.profiles as profile
  left join public.book_listings as listing on listing.seller_id = profile.id
  where profile.id = p_user_id
  group by profile.id;
$$;

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
  order by listing.created_at desc;
$$;

revoke all on function public.get_public_user_profile(uuid) from public;
revoke all on function public.get_public_user_listings(uuid) from public;
grant execute on function public.get_public_user_profile(uuid) to anon, authenticated;
grant execute on function public.get_public_user_listings(uuid) to anon, authenticated;

grant select on public.profile_review_summaries to anon;
grant select on public.user_review_details to anon;
