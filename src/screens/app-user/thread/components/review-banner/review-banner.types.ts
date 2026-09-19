export type ReviewListingStatus = 'active' | 'sold' | 'deleted';

export type ReviewBannerProps = {
  listingStatus: ReviewListingStatus;
  otherUserName: string;
  canReview: boolean;
  submittedRating?: number | null;
  onLeaveReview?: () => void;
};
