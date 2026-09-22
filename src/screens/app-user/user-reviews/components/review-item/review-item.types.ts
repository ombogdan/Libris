import type { UserReviewListItem } from '../../user-reviews.types';

export type ReviewItemProps = {
  review: UserReviewListItem;
  revieweeName: string;
  canReply: boolean;
  isReplying: boolean;
  isSubmittingReply: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  onSubmitReply: (text: string) => void;
  onRemoveReply: () => void;
};
