import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useCommonStyles } from 'shared/components/ui';
import { useStyles } from './chat-item.styles';
import type { ChatItemProps } from './chat-item.types';

export function ChatItem({ chat, onPress }: ChatItemProps) {
  const styles = useStyles();
  const common = useCommonStyles();
  const initial = chat.name.trim().charAt(0).toUpperCase() || '?';
  const lastMessage =
    chat.lastMessage || chat.msgs.at(-1)?.text || 'Почніть розмову';
  const unreadCount = Math.max(chat.unreadCount, chat.unread ? 1 : 0);
  const archiveLabel =
    chat.archiveReason === 'sold'
      ? 'Продано'
      : chat.archiveReason === 'deleted'
      ? 'Видалено'
      : 'Архів';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Чат з ${chat.name}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        {chat.avatarUrl ? (
          <Image source={{ uri: chat.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </View>
      <View style={common.grow}>
        <View style={styles.between}>
          <Text numberOfLines={1} style={styles.name}>
            {chat.name}
          </Text>
          <Text style={[common.mini, styles.time]}>{chat.time}</Text>
        </View>
        <Text
          numberOfLines={1}
          style={[common.meta, unreadCount > 0 && styles.unreadMessage]}
        >
          {lastMessage}
        </Text>
        <View style={styles.topicRow}>
          <Text numberOfLines={1} style={styles.topic}>
            {chat.about}
          </Text>
          {chat.section === 'archive' ? (
            <View
              style={[
                styles.archiveBadge,
                chat.archiveReason === 'deleted' && styles.archiveBadgeDeleted,
              ]}
            >
              <Text
                style={[
                  styles.archiveBadgeText,
                  chat.archiveReason === 'deleted' &&
                    styles.archiveBadgeDeletedText,
                ]}
              >
                {archiveLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {unreadCount > 0 ? (
        <View style={styles.unread}>
          <Text style={styles.unreadText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
