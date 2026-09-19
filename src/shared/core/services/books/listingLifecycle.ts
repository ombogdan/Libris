import { supabase } from 'services/supabase';

export async function markBookListingSold(
  listingId: string,
  conversationId: string | null,
) {
  const { error } = await supabase.rpc('mark_book_listing_sold', {
    p_listing_id: listingId,
    p_conversation_id: conversationId,
  });

  if (error) {
    throw error;
  }
}

export async function reactivateBookListing(listingId: string) {
  const { error } = await supabase.rpc('reactivate_book_listing', {
    p_listing_id: listingId,
  });

  if (error) {
    throw error;
  }
}

export async function softDeleteBookListing(listingId: string) {
  const { error } = await supabase.rpc('soft_delete_book_listing', {
    p_listing_id: listingId,
  });

  if (error) {
    throw error;
  }
}
