import { t } from 'shared/localization/i18n';
import React from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from 'shared/components/ui';
import { useStyles } from './mark-sold-modal.styles';
import type { MarkSoldModalProps } from './mark-sold-modal.types';

export function MarkSoldModal({
  visible,
  listingTitle,
  conversations,
  isSaving,
  onClose,
  onSelect,
}: MarkSoldModalProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isSaving ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text numberOfLines={2} style={styles.title}>
            {t('myListings.soldTo', { title: listingTitle })}
          </Text>
          <Text style={styles.subtitle}>{t('myListings.soldHelp')}</Text>
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {conversations.map(option => {
              const initial = option.name.trim().charAt(0).toUpperCase() || '?';
              return (
                <Pressable
                  key={option.conversationId}
                  disabled={isSaving}
                  onPress={() => onSelect(option.conversationId)}
                  style={({ pressed }) => [
                    styles.option,
                    isSaving && styles.optionDisabled,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <View style={styles.avatar}>
                    {option.avatarUrl ? (
                      <Image
                        source={{ uri: option.avatarUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarText}>{initial}</Text>
                    )}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionText}>{option.name}</Text>
                    <Text style={styles.optionHint}>{t('myListings.buyerFromChat')}</Text>
                  </View>
                </Pressable>
              );
            })}
            <Pressable
              disabled={isSaving}
              onPress={() => onSelect(null)}
              style={({ pressed }) => [
                styles.option,
                styles.outsideOption,
                isSaving && styles.optionDisabled,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.outsideText}>{t('myListings.soldOutside')}</Text>
            </Pressable>
          </ScrollView>
          <Button
            secondary
            label={t('common.cancel')}
            disabled={isSaving}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}
