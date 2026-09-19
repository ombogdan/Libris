import React from 'react';
import { Modal, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from 'shared/components/ui';
import { t } from 'shared/localization/i18n';
import { useStyles } from './delete-account-modal.styles';
import type { DeleteAccountModalProps } from './delete-account-modal.types';

export function DeleteAccountModal({
  visible,
  isDeleting = false,
  error = null,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isDeleting ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('settings.deleteAccount.title')}</Text>
          <Text style={styles.text}>{t('settings.deleteAccount.text')}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button
              danger
              label={
                isDeleting
                  ? t('settings.deleteAccount.deleting')
                  : t('settings.deleteAccount.confirm')
              }
              disabled={isDeleting}
              onPress={onConfirm}
            />
            <Button
              secondary
              label={t('common.cancel')}
              disabled={isDeleting}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
