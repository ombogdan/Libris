import { supabase } from 'services/supabase';

export type FeedSort = 'recent' | 'price_asc' | 'price_desc' | 'distance';

export type FeedFilters = {
  query: string;
  city: string | null;
  category: string | null;
  freeOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  condition: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  sort: FeedSort;
};

export type FeedListingRow = {
  id: string;
  seller_id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  condition: string;
  description: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  cover_url: string | null;
  image_urls: string[];
  created_at: string;
  seller_display_name: string;
  seller_avatar_url: string | null;
  seller_listings_count: number;
  seller_rating_average: number;
  seller_review_count: number;
  distance_km: number | null;
};

const PAGE_SIZE = 20;

export async function searchBookListings(filters: FeedFilters, offset: number) {
  const { data, error } = await supabase.rpc('search_book_listings', {
    p_query: filters.query.trim() || null,
    p_city: filters.city?.trim() || null,
    p_category: filters.category,
    p_free_only: filters.freeOnly,
    p_min_price: filters.minPrice,
    p_max_price: filters.maxPrice,
    p_condition: filters.condition,
    p_latitude: filters.latitude,
    p_longitude: filters.longitude,
    p_radius_km: filters.radiusKm,
    p_sort: filters.sort,
    p_limit: PAGE_SIZE,
    p_offset: offset,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FeedListingRow[];
  return { rows, hasMore: rows.length === PAGE_SIZE };
}
