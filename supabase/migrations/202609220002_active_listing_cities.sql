-- Backs the feed's location-filter suggestions. search_book_listings
-- matches p_city as an exact (case/whitespace-insensitive) string against
-- book_listings.city, so a free-typed city with no matching suggestion can
-- silently return zero results — this gives the picker real values to
-- suggest instead of guessing spelling blind.

create or replace function public.get_active_listing_cities()
returns table (city text, listing_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select listing.city, count(*)::integer as listing_count
  from public.book_listings as listing
  where listing.status = 'active' and not listing.is_deleted
  group by listing.city
  order by listing_count desc, listing.city asc
  limit 200;
$$;

revoke all on function public.get_active_listing_cities() from public;
grant execute on function public.get_active_listing_cities()
to anon, authenticated;
