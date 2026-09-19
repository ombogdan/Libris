import { t } from 'shared/localization/i18n';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from 'shared/components/ui';
import { useStyles } from './review-modal.styles';
import type { ReviewModalProps, ReviewRating } from './review-modal.types';

const RATINGS: ReviewRating[] = [1, 2, 3, 4, 5];

export function ReviewModal({
  visible,
  recipientName,
  isSubmitting = false,
  error = null,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const [rating, setRating] = useState<ReviewRating | null>(null);
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setRating(null);
      setComment('');
      setValidationError('');
    }
  }, [visible]);

  const submit = () => {
    if (!rating) {
      setValidationError(t('reviews.ratingError'));
      return;
    }

    setValidationError('');
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isSubmitting ? undefined : onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('reviews.leave')}</Text>
          <Text style={styles.subtitle}>
            {t('reviews.experience', { name: recipientName || t('common.userInContext') })}
          </Text>

          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={t('reviews.ratingLabel')}
            style={styles.stars}
          >
            {RATINGS.map(value => {
              const selected = rating !== null && value <= rating;

              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={t('reviews.ratingValue', { value })}
                  accessibilityState={{ selected: rating === value }}
                  disabled={isSubmitting}
                  onPress={() => {
                    setRating(value);
                    setValidationError('');
                  }}
                  style={({ pressed }) => [
                    styles.starButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.star, selected && styles.starSelected]}>
                    {selected ? '★' : '☆'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>{t('reviews.optionalComment')}</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            editable={!isSubmitting}
            multiline
            maxLength={500}
            placeholder={t('reviews.commentPlaceholder')}
            placeholderTextColor={styles.colors.placeholder}
            style={styles.input}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{comment.length}/500</Text>

          {validationError || error ? (
            <Text style={styles.error}>{validationError || error}</Text>
          ) : null}

          <Button
            label={isSubmitting ? t('reviews.publishing') : t('reviews.leave')}
            disabled={isSubmitting}
            onPress={submit}
          />
          <Button
            secondary
            label={t('common.cancel')}
            disabled={isSubmitting}
            onPress={onClose}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
