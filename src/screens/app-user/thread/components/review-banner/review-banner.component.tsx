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
          <Text style={styles.title}>Оголошення видалено</Text>
          <Text style={styles.description}>
            Переписка збережена в архіві. Залишити відгук уже не можна.
          </Text>
        </View>
      </View>
    );
  }

  if (submittedRating) {
    return (
      <View style={styles.card}>
        <Text style={styles.icon}>✓</Text>
        <View style={styles.content}>
          <Text style={styles.title}>Відгук залишено</Text>
          <Text style={styles.rating}>{ratingStars(submittedRating)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>★</Text>
      <View style={styles.content}>
        <Text style={styles.title}>Книгу продано</Text>
        <Text style={styles.description}>
          {canReview
            ? `Оціни спілкування з ${otherUserName || 'користувачем'}.`
            : 'Переписка збережена в архіві.'}
        </Text>
        {canReview && onLeaveReview ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Залишити відгук"
            onPress={onLeaveReview}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>Залишити відгук</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
