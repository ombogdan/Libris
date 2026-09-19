import { t } from 'shared/localization/i18n';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Field } from 'shared/components/ui';
import { useStyles } from './profile-edit-modal.styles';
import type {
  EditableProfileField,
  ProfileEditModalProps,
} from './profile-edit-modal.types';

type FieldConfig = {
  title: string;
  label: string;
  placeholder: string;
  keyboardType: 'default' | 'phone-pad';
  autoCapitalize: 'none' | 'words';
};

// Built on demand so the texts follow the current app language.
const getFieldConfig = (field: EditableProfileField): FieldConfig => {
  switch (field) {
    case 'display_name':
      return {
        title: t('profile.editName'),
        label: t('profile.name'),
        placeholder: t('profile.namePlaceholder'),
        keyboardType: 'default',
        autoCapitalize: 'words',
      };
    case 'city':
      return {
        title: t('profile.editCity'),
        label: t('profile.city'),
        placeholder: t('listingForm.cityPlaceholder'),
        keyboardType: 'default',
        autoCapitalize: 'words',
      };
    case 'phone':
      return {
        title: t('profile.editPhone'),
        label: t('profile.phone'),
        placeholder: '+380XXXXXXXXX',
        keyboardType: 'phone-pad',
        autoCapitalize: 'none',
      };
  }
};

export function ProfileEditModal({
  visible,
  field,
  initialValue,
  isSaving,
  error,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [initialValue, visible]);

  if (!field) {
    return null;
  }

  const config = getFieldConfig(field);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isSaving ? undefined : onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{config.title}</Text>
          <Field
            autoFocus
            label={config.label}
            value={value}
            onChangeText={setValue}
            placeholder={config.placeholder}
            keyboardType={config.keyboardType}
            autoCapitalize={config.autoCapitalize}
            editable={!isSaving}
            onSubmitEditing={() => onSave(value)}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={isSaving ? t('common.saving') : t('common.save')}
            disabled={isSaving}
            onPress={() => onSave(value)}
          />
          <Button
            secondary
            label={t('common.cancel')}
            disabled={isSaving}
            onPress={onClose}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
