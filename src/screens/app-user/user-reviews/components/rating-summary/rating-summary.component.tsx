import { formatRating, formatReviewsCount } from 'shared/localization/i18n';
import React from 'react';
import { Text, View } from 'react-native';

import { useStyles } from './rating-summary.styles';
import type { RatingSummaryProps } from './rating-summary.types';

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
            : formatRating(normalizedAverage)}
        </Text>
        <Text style={styles.star}>★</Text>
      </View>
      <View style={styles.details}>
        <Text numberOfLines={2} style={styles.name}>
          {displayName}
        </Text>
        <Text style={styles.count}>{formatReviewsCount(count)}</Text>
      </View>
    </View>
  );
}
