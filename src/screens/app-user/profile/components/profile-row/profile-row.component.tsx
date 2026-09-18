import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useStyles } from './profile-row.styles';
import type { ProfileRowProps } from './profile-row.types';

export function ProfileRow({ label, value, onPress }: ProfileRowProps) {
  const styles = useStyles();

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        <Text numberOfLines={1} style={styles.value}>
          {value}
        </Text>
        {onPress ? <Text style={styles.arrow}>›</Text> : null}
      </View>
    </Pressable>
  );
}
