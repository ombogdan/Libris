import { supabase } from 'services/supabase';

export async function getFavoriteListingIds(userId: string) {
  const { data, error } = await supabase
    .from('book_favorites')
    .select('listing_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(favorite => favorite.listing_id);
}

export async function addFavorite(userId: string, listingId: string) {
  const { error } = await supabase.from('book_favorites').upsert(
    {
      user_id: userId,
      listing_id: listingId,
    },
    {
      onConflict: 'user_id,listing_id',
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw error;
  }
}

export async function removeFavorite(userId: string, listingId: string) {
  const { error } = await supabase
    .from('book_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);

  if (error) {
    throw error;
  }
}
