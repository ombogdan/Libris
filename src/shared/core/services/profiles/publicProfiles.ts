import { supabase } from 'services/supabase';
import type {
  PublicUserListing,
  PublicUserProfile,
} from 'services/supabase/database.types';

export async function fetchPublicUserProfile(userId: string) {
  const { data, error } = await supabase.rpc('get_public_user_profile', {
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PublicUserProfile[])[0] ?? null;
}

export async function fetchPublicUserListings(userId: string) {
  const { data, error } = await supabase.rpc('get_public_user_listings', {
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicUserListing[];
}
