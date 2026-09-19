import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useStyles } from './feed-filter-button.styles';
import type { FeedFilterButtonProps } from './feed-filter-button.types';

export function FeedFilterButton({
  label,
  value,
  icon,
  badge = 0,
  compact = false,
  onPress,
}: FeedFilterButtonProps) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={styles.iconSize} color={styles.colors.icon} />
      {!compact ? (
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          <Text numberOfLines={1} style={styles.value}>
            {value}
          </Text>
        </View>
      ) : null}
      {!compact ? (
        <Ionicons
          name="chevron-down"
          size={styles.chevronSize}
          color={styles.colors.chevron}
        />
      ) : null}
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
