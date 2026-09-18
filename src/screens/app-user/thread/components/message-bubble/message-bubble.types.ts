import type { Message } from 'shared/data';

export type MessageBubbleProps = {
  message: Message;
  onRetry?: () => void;
};
