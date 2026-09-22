import { formatDate, t } from 'shared/localization/i18n';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

import { useStyles } from './review-item.styles';
import type { ReviewItemProps } from './review-item.types';

const stars = (rating: number) => {
  const normalized = Math.min(5, Math.max(0, Math.round(rating)));
  return `${'★'.repeat(normalized)}${'☆'.repeat(5 - normalized)}`;
};

export function ReviewItem({
  review,
  revieweeName,
  canReply,
  isReplying,
  isSubmittingReply,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onRemoveReply,
}: ReviewItemProps) {
  const styles = useStyles();
  const initial = review.reviewerName.trim().charAt(0).toUpperCase() || '?';
  const date = formatDate(review.createdAt);
  const comment = review.comment?.trim();
  const [draft, setDraft] = useState(review.reply ?? '');

  useEffect(() => {
    if (isReplying) {
      setDraft(review.reply ?? '');
    }
  }, [isReplying, review.reply]);

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

      {review.reply && !isReplying ? (
        <View style={styles.replyCard}>
          <Text style={styles.replyLabel}>
            {t('reviews.replyFrom', { name: revieweeName })}
          </Text>
          <Text style={styles.replyText}>{review.reply}</Text>
        </View>
      ) : null}

      {canReply && !isReplying ? (
        <View style={styles.replyActions}>
          <Pressable
            accessibilityRole="button"
            onPress={onStartReply}
            style={({ pressed }) => [
              styles.replyActionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.replyActionText}>
              {review.reply ? t('reviews.editReply') : t('reviews.reply')}
            </Text>
          </Pressable>
          {review.reply ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRemoveReply}
              style={({ pressed }) => [
                styles.replyActionButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.removeReplyText}>
                {t('reviews.removeReply')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {isReplying ? (
        <View style={styles.replyForm}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={!isSubmittingReply}
            multiline
            maxLength={1000}
            placeholder={t('reviews.replyPlaceholder')}
            placeholderTextColor={styles.colors.placeholder}
            style={styles.replyInput}
            textAlignVertical="top"
          />
          <View style={styles.replyFormActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmittingReply}
              onPress={onCancelReply}
              style={({ pressed }) => [
                styles.replyActionButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.replyActionText}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmittingReply}
              onPress={() => onSubmitReply(draft)}
              style={({ pressed }) => [
                styles.replyActionButton,
                styles.replySaveButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.replySaveText}>
                {isSubmittingReply ? t('common.saving') : t('common.save')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
