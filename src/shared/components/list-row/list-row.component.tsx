import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useStyles } from './list-row.styles';
import type { ListRowProps } from './list-row.types';

export function ListRow({
  label,
  value,
  onPress,
  danger = false,
  disabled = false,
  isLast = false,
  showChevron = Boolean(onPress),
  accessory,
}: ListRowProps) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divider,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text numberOfLines={1} style={[styles.label, danger && styles.danger]}>
        {label}
      </Text>
      <View style={styles.trailing}>
        {value ? (
          <Text numberOfLines={1} style={styles.value}>
            {value}
          </Text>
        ) : null}
        {accessory}
        {showChevron ? (
          <Ionicons
            name="chevron-forward"
            size={styles.chevronSize}
            color={styles.colors.chevron}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
