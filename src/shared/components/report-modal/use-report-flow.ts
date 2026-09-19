import { useState } from 'react';

import { t } from 'shared/localization/i18n';
import type { ReportReason } from 'services/moderation';
import { useAppStore } from 'store/AppStore';
import type { ReportModalProps } from './report-modal.types';

type ReportTarget = {
  reportedUserId?: string | null;
  listingId?: string | null;
};

// Drives ReportModal: opens it, sends the report and says how it went.
export function useReportFlow(target: ReportTarget) {
  const store = useAppStore();
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async ({
    reason,
    comment,
  }: {
    reason: ReportReason;
    comment: string;
  }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await store.reportContent({ reason, ...target, comment });
      setVisible(false);
      store.notify(t('report.sent'));
    } catch (submitError) {
      setError(
        submitError &&
          typeof submitError === 'object' &&
          'message' in submitError
          ? String(submitError.message)
          : t('report.sendError'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalProps: ReportModalProps = {
    visible,
    isSubmitting,
    error,
    onClose: () => setVisible(false),
    onSubmit: payload => void submit(payload),
  };

  return { open: () => setVisible(true), modalProps };
}
