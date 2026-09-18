alter table public.book_listings
add column if not exists image_urls text[] not null default '{}';

alter table public.book_listings
drop constraint if exists book_listings_image_limit;

alter table public.book_listings
add constraint book_listings_image_limit
check (cardinality(image_urls) <= 5);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'book-images',
  'book-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own book images" on storage.objects;
create policy "Users can upload their own book images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'book-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can delete their own book images" on storage.objects;
create policy "Users can delete their own book images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'book-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
