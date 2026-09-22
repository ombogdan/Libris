import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from 'shared/components/ui';
import { useKeyboardHeight } from 'hooks/useKeyboardHeight';
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
  suggestions,
}: FeedSelectModalProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const styles = useStyles({ bottomInset: insets.bottom, keyboardHeight });
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

  // search_book_listings matches the typed city exactly, so a suggestion
  // list of values that actually have listings beats guessing the spelling.
  const matchingSuggestions = useMemo(() => {
    const query = custom.trim().toLowerCase();
    if (!query || !suggestions?.length) {
      return [];
    }

    const known = new Set(
      options.map(option => option.value?.toLowerCase()).filter(Boolean),
    );

    return suggestions
      .filter(
        city =>
          city.toLowerCase().includes(query) &&
          city.toLowerCase() !== query &&
          !known.has(city.toLowerCase()),
      )
      .slice(0, 6);
  }, [custom, options, suggestions]);

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
                {matchingSuggestions.length ? (
                  <View style={styles.suggestions}>
                    {matchingSuggestions.map((city, index) => (
                      <Pressable
                        key={city}
                        onPress={() => select(city)}
                        style={({ pressed }) => [
                          styles.suggestion,
                          index === matchingSuggestions.length - 1 &&
                            styles.suggestionLast,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="location-outline"
                          size={styles.suggestionIconSize}
                          color={styles.colors.close}
                        />
                        <Text numberOfLines={1} style={styles.suggestionText}>
                          {city}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
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
