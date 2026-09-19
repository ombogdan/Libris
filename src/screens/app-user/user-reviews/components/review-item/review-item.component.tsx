import { localeTag, t } from 'shared/localization/i18n';
import React from 'react';
import { Image, Text, View } from 'react-native';

import { useStyles } from './review-item.styles';
import type { ReviewItemProps } from './review-item.types';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const stars = (rating: number) => {
  const normalized = Math.min(5, Math.max(0, Math.round(rating)));
  return `${'★'.repeat(normalized)}${'☆'.repeat(5 - normalized)}`;
};

export function ReviewItem({ review }: ReviewItemProps) {
  const styles = useStyles();
  const initial = review.reviewerName.trim().charAt(0).toUpperCase() || '?';
  const date = formatDate(review.createdAt);
  const comment = review.comment?.trim();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {review.reviewerAvatarUrl ? (
            <Image
              source={{ uri: review.reviewerAvatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>
        <View style={styles.headerDetails}>
          <Text numberOfLines={1} style={styles.name}>
            {review.reviewerName}
          </Text>
          <Text style={styles.rating}>{stars(review.rating)}</Text>
        </View>
        {date ? <Text style={styles.date}>{date}</Text> : null}
      </View>

      {comment ? <Text style={styles.comment}>{comment}</Text> : null}
      <Text numberOfLines={1} style={styles.listing}>
        {t('reviews.regarding', { title: review.listingTitle })}
      </Text>
    </View>
  );
}
