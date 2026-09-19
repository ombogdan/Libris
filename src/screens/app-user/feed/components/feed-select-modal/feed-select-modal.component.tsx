import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from 'shared/components/ui';
import { t } from 'shared/localization/i18n';
import { useStyles } from './feed-select-modal.styles';
import type { FeedSelectModalProps } from './feed-select-modal.types';

export function FeedSelectModal({
  visible,
  title,
  value,
  options,
  onClose,
  onSelect,
  customLabel,
  customPlaceholder,
  customValue = '',
}: FeedSelectModalProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const [custom, setCustom] = useState(customValue);

  useEffect(() => {
    if (visible) {
      setCustom(customValue);
    }
  }, [customValue, visible]);

  const select = (nextValue: string | null) => {
    onSelect(nextValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={styles.hitSlop}
              onPress={onClose}
              style={({ pressed }) => [
                styles.close,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={styles.closeIconSize}
                color={styles.colors.close}
              />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.options}
          >
            {options.map(option => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value ?? 'all'}
                  onPress={() => select(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    active && styles.optionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text numberOfLines={1} style={styles.optionText}>
                    {option.label}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}

            {customLabel ? (
              <View style={styles.custom}>
                <Text style={styles.customLabel}>{customLabel}</Text>
                <TextInput
                  value={custom}
                  onChangeText={setCustom}
                  placeholder={customPlaceholder}
                  placeholderTextColor={styles.colors.placeholder}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (custom.trim()) {
                      select(custom.trim());
                    }
                  }}
                  style={styles.input}
                />
                <Button
                  label={t('filters.choose')}
                  disabled={!custom.trim()}
                  onPress={() => select(custom.trim())}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
