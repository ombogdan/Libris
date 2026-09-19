import type { Book } from 'shared/data';
import {
  formatListingsCount,
  formatRating,
  t,
} from 'shared/localization/i18n';
import { supabase } from 'services/supabase';
import type { PublicBookListing } from 'services/supabase/database.types';

const TONES: Book['tone'][] = ['accent', 'accent2', 'neutral'];

function toBook(row: PublicBookListing): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: '',
    price: row.price,
    cat: row.category,
    condition: row.condition,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    seller: row.seller_display_name || t('common.user'),
    rating: row.seller_review_count
      ? formatRating(row.seller_rating_average)
      : '—',
    reviewsCount: row.seller_review_count,
    sellerAds: formatListingsCount(row.seller_listings_count),
    tone: TONES[row.id.charCodeAt(0) % TONES.length],
    about: row.description,
    imageUrls: row.image_urls.length
      ? row.image_urls
      : row.cover_url
      ? [row.cover_url]
      : [],
    sellerId: row.seller_id,
    sellerAvatarUrl: row.seller_avatar_url,
    status: 'active',
    createdAt: row.created_at,
    distanceKm: null,
  };
}

export async function fetchPublicBookListing(listingId: string) {
  const { data, error } = await supabase.rpc('get_public_book_listing', {
    p_listing_id: listingId,
  });

  if (error) {
    throw error;
  }

  const row = ((data ?? []) as PublicBookListing[])[0];
  return row ? toBook(row) : null;
}
