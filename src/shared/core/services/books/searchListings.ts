import { supabase } from 'services/supabase';
import type { PublicBookListing } from 'services/supabase/database.types';

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

export type FeedListingRow = PublicBookListing;

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

// Feeds the location filter's suggestion list — cities that actually have
// active listings, since search_book_listings matches p_city exactly and a
// typo or a different spelling otherwise just returns nothing silently.
export async function fetchActiveListingCities(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_active_listing_cities');

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => row.city);
}
