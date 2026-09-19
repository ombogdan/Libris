export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewSubmission = {
  rating: ReviewRating;
  comment: string;
};

export type ReviewModalProps = {
  visible: boolean;
  recipientName: string;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (review: ReviewSubmission) => void;
};
