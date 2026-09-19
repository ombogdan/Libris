update public.book_listings
set category = case category
  when 'Художня' then 'fiction'
  when 'Підручники' then 'education'
  when 'Інше' then 'other'
  else 'other'
end
where category not in (
  'fiction', 'education', 'children', 'non_fiction', 'business', 'comics', 'other'
);

alter table public.book_listings
drop constraint if exists book_listings_category_check;
alter table public.book_listings
add constraint book_listings_category_check check (
  category in (
    'fiction', 'education', 'children', 'non_fiction', 'business', 'comics', 'other'
  )
);

alter table public.book_listings
add column if not exists language text;

update public.book_listings
set language = 'uk'
where language is null;

alter table public.book_listings
alter column language set not null;

alter table public.book_listings
drop constraint if exists book_listings_language_check;
alter table public.book_listings
add constraint book_listings_language_check check (
  language in ('uk', 'en', 'other')
);

revoke update on public.book_listings from authenticated;
grant update (
  title,
  author,
  price,
  category,
  condition,
  language,
  description,
  city,
  latitude,
  longitude,
  cover_url,
  image_urls,
  updated_at
) on public.book_listings to authenticated;
