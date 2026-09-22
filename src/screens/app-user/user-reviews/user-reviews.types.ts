export type UserReviewListItem = {
  id: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  reply: string | null;
  replyCreatedAt: string | null;
  listingTitle: string;
  createdAt: string;
};

export type UserReviewsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserReviews'
>;
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from 'types/navigation';
