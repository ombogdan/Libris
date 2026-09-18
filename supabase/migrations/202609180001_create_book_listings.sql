create table if not exists public.book_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  seller_name text not null,
  title text not null,
  author text not null,
  price integer not null default 0 check (price >= 0),
  category text not null default 'Інше',
  condition text not null check (condition in ('Як нова', 'Добрий', 'Читана')),
  description text not null default '',
  city text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  cover_url text,
  status text not null default 'active' check (status in ('active', 'sold', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.book_listings enable row level security;

create policy "Authenticated users can view active listings"
on public.book_listings for select
to authenticated
using (status = 'active' or seller_id = (select auth.uid()));

create policy "Users can create their own listings"
on public.book_listings for insert
to authenticated
with check (seller_id = (select auth.uid()));

create policy "Users can update their own listings"
on public.book_listings for update
to authenticated
using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));

create policy "Users can delete their own listings"
on public.book_listings for delete
to authenticated
using (seller_id = (select auth.uid()));

create index if not exists book_listings_created_at_idx
on public.book_listings (created_at desc);

create index if not exists book_listings_city_idx
on public.book_listings (city);
