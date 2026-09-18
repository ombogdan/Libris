create table if not exists public.book_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.book_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.book_favorites enable row level security;

drop policy if exists "Users can read their own favorites"
on public.book_favorites;
create policy "Users can read their own favorites"
on public.book_favorites for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can add their own favorites"
on public.book_favorites;
create policy "Users can add their own favorites"
on public.book_favorites for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can remove their own favorites"
on public.book_favorites;
create policy "Users can remove their own favorites"
on public.book_favorites for delete
to authenticated
using (user_id = (select auth.uid()));

create index if not exists book_favorites_listing_id_idx
on public.book_favorites (listing_id);

create index if not exists book_favorites_user_created_at_idx
on public.book_favorites (user_id, created_at desc);
