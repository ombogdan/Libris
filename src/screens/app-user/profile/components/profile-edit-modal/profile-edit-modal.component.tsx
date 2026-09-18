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

const fieldConfig: Record<
  EditableProfileField,
  {
    title: string;
    label: string;
    placeholder: string;
    keyboardType: 'default' | 'phone-pad';
    autoCapitalize: 'none' | 'words';
  }
> = {
  display_name: {
    title: 'Редагувати ім’я',
    label: 'Ім’я',
    placeholder: 'Як тебе звати',
    keyboardType: 'default',
    autoCapitalize: 'words',
  },
  city: {
    title: 'Редагувати місто',
    label: 'Місто',
    placeholder: 'Наприклад, Полтава',
    keyboardType: 'default',
    autoCapitalize: 'words',
  },
  phone: {
    title: 'Редагувати телефон',
    label: 'Телефон',
    placeholder: '+380XXXXXXXXX',
    keyboardType: 'phone-pad',
    autoCapitalize: 'none',
  },
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

  const config = fieldConfig[field];

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
            label={isSaving ? 'Зберігаємо…' : 'Зберегти'}
            disabled={isSaving}
            onPress={() => onSave(value)}
          />
          <Button
            secondary
            label="Скасувати"
            disabled={isSaving}
            onPress={onClose}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
