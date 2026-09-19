import { t } from 'shared/localization/i18n';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip } from 'shared/components/ui';
import type { ReportReason } from 'services/moderation';
import { useStyles } from './report-modal.styles';
import type { ReportModalProps } from './report-modal.types';

const REASONS: { value: ReportReason; labelKey: string }[] = [
  { value: 'spam', labelKey: 'report.reasons.spam' },
  { value: 'scam', labelKey: 'report.reasons.scam' },
  { value: 'inappropriate', labelKey: 'report.reasons.inappropriate' },
  { value: 'fake_listing', labelKey: 'report.reasons.fakeListing' },
  { value: 'harassment', labelKey: 'report.reasons.harassment' },
  { value: 'other', labelKey: 'report.reasons.other' },
];

export function ReportModal({
  visible,
  isSubmitting = false,
  error = null,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setReason(null);
      setComment('');
      setValidationError('');
    }
  }, [visible]);

  const submit = () => {
    if (!reason) {
      setValidationError(t('report.reasonRequired'));
      return;
    }

    setValidationError('');
    onSubmit({ reason, comment: comment.trim() });
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
          <Text style={styles.title}>{t('report.title')}</Text>

          <Text style={styles.label}>{t('report.reasonLabel')}</Text>
          <View style={styles.chips}>
            {REASONS.map(option => (
              <Chip
                key={option.value}
                label={t(option.labelKey)}
                active={reason === option.value}
                onPress={() => {
                  setReason(option.value);
                  setValidationError('');
                }}
              />
            ))}
          </View>

          <Text style={styles.label}>{t('report.commentLabel')}</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            editable={!isSubmitting}
            multiline
            maxLength={1000}
            placeholder={t('report.commentPlaceholder')}
            placeholderTextColor={styles.colors.placeholder}
            style={styles.input}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{comment.length}/1000</Text>

          {validationError || error ? (
            <Text style={styles.error}>{validationError || error}</Text>
          ) : null}

          <View style={styles.actions}>
            <Button
              label={isSubmitting ? t('report.submitting') : t('report.submit')}
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
