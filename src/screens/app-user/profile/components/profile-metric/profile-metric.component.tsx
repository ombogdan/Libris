import React from 'react';
import { Text, View } from 'react-native';

import { useStyles } from './profile-metric.styles';
import type { ProfileMetricProps } from './profile-metric.types';

export function ProfileMetric({ value, label }: ProfileMetricProps) {
  const styles = useStyles();

  return (
    <View style={styles.metric}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
