import { supabase } from 'services/supabase';

export type WelcomeStats = {
  listingCount: number;
  popularCities: string[];
};

export async function fetchWelcomeStats(): Promise<WelcomeStats> {
  const { data, error } = await supabase.rpc('get_welcome_stats');

  if (error) {
    throw error;
  }

  const row = data?.[0];

  return {
    listingCount: Math.max(0, Number(row?.listing_count ?? 0)),
    popularCities: (row?.popular_cities ?? [])
      .map(city => city.trim())
      .filter(Boolean)
      .slice(0, 3),
  };
}
