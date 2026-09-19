import { supabase } from 'services/supabase';

export type ListingImageRecord = {
  path: string;
  url: string;
  position: number;
};

export async function registerBookListingImages(
  listingId: string,
  images: ListingImageRecord[],
) {
  if (!images.length) {
    return;
  }

  const { error } = await supabase.from('book_listing_images').insert(
    images.map(image => ({
      listing_id: listingId,
      storage_path: image.path,
      public_url: image.url,
      position: image.position,
    })),
  );

  if (error) {
    throw error;
  }
}

export async function removeBookListingImageRecords(
  listingId: string,
  paths: string[],
) {
  if (!paths.length) {
    return;
  }

  const { error } = await supabase
    .from('book_listing_images')
    .delete()
    .eq('listing_id', listingId)
    .in('storage_path', paths);

  if (error) {
    throw error;
  }
}
