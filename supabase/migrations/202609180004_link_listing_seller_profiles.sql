create or replace function public.sync_listing_seller_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.display_name is distinct from old.display_name then
    update public.book_listings
    set
      seller_name = new.display_name,
      updated_at = now()
    where seller_id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_listing_seller_name() from public;

drop trigger if exists on_profile_display_name_updated on public.profiles;
create trigger on_profile_display_name_updated
  after update of display_name on public.profiles
  for each row execute procedure public.sync_listing_seller_name();

update public.book_listings as listing
set seller_name = profile.display_name
from public.profiles as profile
where
  listing.seller_id = profile.id
  and listing.seller_name is distinct from profile.display_name;

create or replace view public.listing_seller_profiles
with (security_barrier = true)
as
select
  profile.id,
  profile.display_name,
  profile.avatar_url,
  count(listing.id) filter (where listing.status = 'active')::integer
    as listings_count
from public.profiles as profile
join public.book_listings as listing on listing.seller_id = profile.id
where listing.status = 'active' or listing.seller_id = (select auth.uid())
group by profile.id, profile.display_name, profile.avatar_url;

revoke all on public.listing_seller_profiles from public;
revoke all on public.listing_seller_profiles from anon;
grant select on public.listing_seller_profiles to authenticated;
