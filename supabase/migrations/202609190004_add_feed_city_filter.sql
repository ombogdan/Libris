drop function if exists public.search_book_listings(
  text, text, boolean, integer, integer, text,
  double precision, double precision, double precision,
  text, integer, integer
);

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
