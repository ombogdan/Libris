import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useCommonStyles } from '../../../../components/ui';
import { useStyles } from './chat-item.styles';
import type { ChatItemProps } from './chat-item.types';

export function ChatItem({ chat, onPress }: ChatItemProps) {
  const styles = useStyles();
  const common = useCommonStyles();

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{chat.name[0]}</Text>
      </View>
      <View style={common.grow}>
        <View style={styles.between}>
          <Text style={styles.name}>{chat.name}</Text>
          <Text style={common.mini}>{chat.time}</Text>
        </View>
        <Text numberOfLines={1} style={common.meta}>
          {chat.msgs.at(-1)?.text}
        </Text>
        <Text style={styles.topic}>{chat.about}</Text>
      </View>
      {chat.unread ? <View style={styles.unread} /> : null}
    </Pressable>
  );
}
