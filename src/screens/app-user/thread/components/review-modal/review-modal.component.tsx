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
      setValidationError('Обери оцінку від 1 до 5.');
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
          <Text style={styles.title}>Залишити відгук</Text>
          <Text style={styles.subtitle}>
            Як пройшло спілкування з {recipientName || 'користувачем'}?
          </Text>

          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Оцінка"
            style={styles.stars}
          >
            {RATINGS.map(value => {
              const selected = rating !== null && value <= rating;

              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={`${value} з 5`}
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

          <Text style={styles.label}>Коментар (необов’язково)</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            editable={!isSubmitting}
            multiline
            maxLength={500}
            placeholder="Напиши кілька слів про спілкування"
            placeholderTextColor={styles.colors.placeholder}
            style={styles.input}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{comment.length}/500</Text>

          {validationError || error ? (
            <Text style={styles.error}>{validationError || error}</Text>
          ) : null}

          <Button
            label={isSubmitting ? 'Публікуємо…' : 'Опублікувати відгук'}
            disabled={isSubmitting}
            onPress={submit}
          />
          <Button
            secondary
            label="Скасувати"
            disabled={isSubmitting}
            onPress={onClose}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
