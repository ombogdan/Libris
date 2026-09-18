import React from 'react';
import { Pressable, Text } from 'react-native';

import { useStyles } from './profile-row.styles';
import type { ProfileRowProps } from './profile-row.types';

export function ProfileRow({ label, value, onPress }: ProfileRowProps) {
  const styles = useStyles();

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value} ›</Text>
    </Pressable>
  );
}
