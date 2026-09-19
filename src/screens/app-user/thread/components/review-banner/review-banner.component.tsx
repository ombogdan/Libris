import { t } from 'shared/localization/i18n';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useStyles } from './review-banner.styles';
import type { ReviewBannerProps } from './review-banner.types';

const ratingStars = (rating: number) =>
  '★'.repeat(Math.min(5, Math.max(1, Math.round(rating))));

export function ReviewBanner({
  listingStatus,
  otherUserName,
  canReview,
  submittedRating,
  onLeaveReview,
}: ReviewBannerProps) {
  const styles = useStyles();

  if (listingStatus === 'active') {
    return null;
  }

  if (listingStatus === 'deleted') {
    return (
      <View style={[styles.card, styles.deletedCard]}>
        <Text style={styles.icon}>×</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('reviews.deletedTitle')}</Text>
          <Text style={styles.description}>{t('reviews.deletedText')}</Text>
        </View>
      </View>
    );
  }

  if (submittedRating) {
    return (
      <View style={styles.card}>
        <Text style={styles.icon}>✓</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('reviews.left')}</Text>
          <Text style={styles.rating}>{ratingStars(submittedRating)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>★</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{t('reviews.bookSold')}</Text>
        <Text style={styles.description}>
          {canReview
            ? t('reviews.rateUser', { name: otherUserName || t('common.userInContext') })
            : t('reviews.archived')}
        </Text>
        {canReview && onLeaveReview ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('reviews.leave')}
            onPress={onLeaveReview}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>{t('reviews.leave')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
