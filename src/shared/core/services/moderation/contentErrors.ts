import { t } from 'shared/localization/i18n';

// The server rejects text with this message and names the column in the hint.
const CONTENT_NOT_ALLOWED = 'content_not_allowed';

const FIELD_LABEL_KEYS: Record<string, string> = {
  title: 'moderation.fields.title',
  author: 'moderation.fields.author',
  description: 'moderation.fields.description',
  display_name: 'moderation.fields.displayName',
  comment: 'moderation.fields.comment',
};

type ServerError = { message?: unknown; hint?: unknown };

export function isContentNotAllowedError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as ServerError).message === CONTENT_NOT_ALLOWED
  );
}

// The text to show the user for a failed save or send: an explanation for
// rejected content, otherwise the error's own message, otherwise the fallback.
export function getFriendlyErrorMessage(error: unknown, fallback: string) {
  if (isContentNotAllowedError(error)) {
    const hint = (error as ServerError).hint;

    if (hint === 'body') {
      return t('moderation.messageNotAllowed');
    }

    const labelKey = typeof hint === 'string' ? FIELD_LABEL_KEYS[hint] : '';
    return labelKey
      ? t('moderation.contentNotAllowedField', { field: t(labelKey) })
      : t('moderation.contentNotAllowed');
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return fallback;
}
