-- Notification preferences, read by whatever sends notifications.
alter table public.profiles
add column if not exists notify_messages boolean not null default true,
add column if not exists notify_reviews boolean not null default true;

-- Column-level grants: authenticated users may only update the columns listed
-- in the lifecycle migration, so the new preferences must be granted here.
grant update (notify_messages, notify_reviews)
on public.profiles to authenticated;

-- Account deletion removes the auth user and everything cascades from it.
-- Reports about the deleted user used to be detached with `on delete set null`,
-- which violates reports_target_check for reports that only name a user and
-- made the whole deletion fail. Those reports go away with the account.
alter table public.reports
drop constraint if exists reports_reported_user_id_fkey;
alter table public.reports
add constraint reports_reported_user_id_fkey
foreign key (reported_user_id) references public.profiles(id)
on delete cascade;

-- The blocked-users list joins profiles, whose row-level security only shows
-- the caller's own profile. As a security_invoker view it therefore returned
-- nothing. Like listing_seller_profiles it runs as its owner and filters on the
-- caller itself.
drop view if exists public.blocked_user_profiles;
create view public.blocked_user_profiles
with (security_barrier = true)
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
