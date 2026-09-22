import { supabase } from 'services/supabase';
import type {
  ProfileReviewSummary,
  Review,
  UserReviewDetail,
} from 'services/supabase/database.types';

export async function submitConversationReview(
  conversationId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const { data, error } = await supabase.rpc('submit_conversation_review', {
    p_conversation_id: conversationId,
    p_rating: rating,
    p_comment: comment.trim(),
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateReview(
  reviewId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const { data, error } = await supabase.rpc('update_review', {
    p_review_id: reviewId,
    p_rating: rating,
    p_comment: comment.trim(),
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_review', {
    p_review_id: reviewId,
  });

  if (error) {
    throw error;
  }
}

// An empty reply clears a previously posted one.
export async function replyToReview(
  reviewId: string,
  reply: string,
): Promise<Review> {
  const { data, error } = await supabase.rpc('reply_to_review', {
    p_review_id: reviewId,
    p_reply: reply.trim() || null,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchUserReviews(
  userId: string,
): Promise<UserReviewDetail[]> {
  const { data, error } = await supabase
    .from('user_review_details')
    .select('*')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchProfileReviewSummary(
  userId: string,
): Promise<ProfileReviewSummary> {
  const { data, error } = await supabase
    .from('profile_review_summaries')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
