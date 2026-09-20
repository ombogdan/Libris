create or replace function public.get_welcome_stats()
returns table (
  listing_count bigint,
  popular_cities text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      select count(*)
      from public.book_listings as listing
      where listing.status = 'active'
        and not listing.is_deleted
    ) as listing_count,
    coalesce(
      (
        select array_agg(
          ranked.city
          order by ranked.listing_count desc, ranked.city asc
        )
        from (
          select
            min(btrim(listing.city)) as city,
            count(*) as listing_count
          from public.book_listings as listing
          where listing.status = 'active'
            and not listing.is_deleted
            and nullif(btrim(listing.city), '') is not null
          group by lower(btrim(listing.city))
          order by listing_count desc, city asc
          limit 3
        ) as ranked
      ),
      array[]::text[]
    ) as popular_cities;
$$;

revoke all on function public.get_welcome_stats() from public;
grant execute on function public.get_welcome_stats() to anon, authenticated;
