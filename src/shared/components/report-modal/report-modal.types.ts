import type { ReportReason } from 'services/moderation';

export type ReportModalProps = {
  visible: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: { reason: ReportReason; comment: string }) => void;
};
