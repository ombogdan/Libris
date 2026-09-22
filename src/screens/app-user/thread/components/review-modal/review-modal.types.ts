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
  // When set, the modal opens pre-filled to edit that existing review
  // instead of starting a new one.
  initialRating?: ReviewRating | null;
  initialComment?: string;
  onClose: () => void;
  onSubmit: (review: ReviewSubmission) => void;
};
