import { t } from 'shared/localization/i18n';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useStyles } from './message-bubble.styles';
import type { MessageBubbleProps } from './message-bubble.types';

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const styles = useStyles();
  const failed = message.me && message.status === 'failed';
  const sending = message.me && message.status === 'sending';
  const time = formatMessageTime(message.createdAt);

  return (
    <View style={[styles.row, message.me ? styles.mineRow : styles.theirsRow]}>
      <View
        style={[
          styles.bubble,
          message.me ? styles.mine : styles.theirs,
          sending && styles.sending,
          failed && styles.failed,
        ]}
      >
        <Text
          style={[
            styles.message,
            message.me && styles.mineMessage,
            failed && styles.failedMessage,
          ]}
        >
          {message.text}
        </Text>

        <View style={styles.metaRow}>
          {time ? (
            <Text
              style={[
                styles.time,
                message.me && styles.mineMeta,
                failed && styles.failedMeta,
              ]}
            >
              {time}
            </Text>
          ) : null}

          {sending ? (
            <Text style={[styles.status, styles.mineMeta]}>{t('thread.sending')}</Text>
          ) : null}

          {message.me && message.status === 'sent' ? (
            <Text style={[styles.status, styles.mineMeta]}>✓</Text>
          ) : null}

          {failed ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('thread.retrySendLabel')}
              hitSlop={styles.hitSlop}
              onPress={onRetry}
            >
              <Text style={styles.retry}>{t('thread.notSent')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
