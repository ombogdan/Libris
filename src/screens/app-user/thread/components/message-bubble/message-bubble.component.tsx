import React from 'react';
import { Text, View } from 'react-native';

import { useStyles } from './message-bubble.styles';
import type { MessageBubbleProps } from './message-bubble.types';

export function MessageBubble({ message }: MessageBubbleProps) {
  const styles = useStyles();

  return (
    <View style={[styles.bubble, message.me ? styles.mine : styles.theirs]}>
      <Text style={[styles.message, message.me && styles.mineMessage]}>
        {message.text}
      </Text>
    </View>
  );
}
