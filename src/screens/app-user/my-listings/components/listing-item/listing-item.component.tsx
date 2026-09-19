import { t } from 'shared/localization/i18n';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Cover, PricePill } from 'shared/components/ui';
import { useStyles } from './listing-item.styles';
import type { ListingItemProps } from './listing-item.types';

export function ListingItem({
  ad,
  disabled = false,
  onEdit,
  onToggleStatus,
  onDelete,
}: ListingItemProps) {
  const styles = useStyles();
  const isSold = ad.status === 'sold';

  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onEdit}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Cover
          book={{ title: ad.title, tone: ad.tone, imageUrls: ad.imageUrls }}
        />
        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.title}>
            {ad.title}
          </Text>
          <View style={styles.inline}>
            <PricePill value={ad.price} />
            <View style={[styles.status, isSold && styles.statusSold]}>
              <Text
                style={[styles.statusText, isSold && styles.statusSoldText]}
              >
                {ad.status}
              </Text>
            </View>
          </View>
          <Text style={styles.meta}>{ad.stats}</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>{t('myListings.edit')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onToggleStatus}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>
            {isSold ? t('myListings.activate') : t('myListings.soldAction')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.deleteText}>{t('myListings.delete')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
