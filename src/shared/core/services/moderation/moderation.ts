import { supabase } from 'services/supabase';
import type { BlockedUserProfile } from 'services/supabase/database.types';

export type ReportReason =
  | 'spam'
  | 'scam'
  | 'inappropriate'
  | 'fake_listing'
  | 'harassment'
  | 'other';

export async function fetchBlockedUserIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id');

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => row.blocked_id);
}

export async function fetchBlockedUserProfiles(): Promise<
  BlockedUserProfile[]
> {
  const { data, error } = await supabase
    .from('blocked_user_profiles')
    .select('*')
    .order('blocked_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function blockUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('block_user', { p_user_id: userId });

  if (error) {
    throw error;
  }
}

export async function unblockUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('unblock_user', { p_user_id: userId });

  if (error) {
    throw error;
  }
}

export async function reportContent(options: {
  reason: ReportReason;
  reportedUserId?: string | null;
  listingId?: string | null;
  comment?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('report_content', {
    p_reason: options.reason,
    p_reported_user_id: options.reportedUserId ?? null,
    p_listing_id: options.listingId ?? null,
    p_comment: options.comment?.trim() ?? '',
  });

  if (error) {
    throw error;
  }
}
