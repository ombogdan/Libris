import React from 'react';
import { Text, View } from 'react-native';

import { useStyles } from './rating-summary.styles';
import type { RatingSummaryProps } from './rating-summary.types';

const reviewCountLabel = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${count} відгук`;
  }
  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return `${count} відгуки`;
  }
  return `${count} відгуків`;
};

export function RatingSummary({
  displayName,
  average,
  count,
}: RatingSummaryProps) {
  const styles = useStyles();
  const normalizedAverage = average === null ? null : Math.max(0, average);

  return (
    <View style={styles.card}>
      <View style={styles.scoreBlock}>
        <Text style={styles.score}>
          {normalizedAverage === null
            ? '—'
            : normalizedAverage.toFixed(1).replace('.', ',')}
        </Text>
        <Text style={styles.star}>★</Text>
      </View>
      <View style={styles.details}>
        <Text numberOfLines={2} style={styles.name}>
          {displayName}
        </Text>
        <Text style={styles.count}>{reviewCountLabel(count)}</Text>
      </View>
    </View>
  );
}
