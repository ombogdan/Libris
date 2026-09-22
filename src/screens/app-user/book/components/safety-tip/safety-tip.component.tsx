import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { t } from 'shared/localization/i18n';
import { useStyles } from './safety-tip.styles';
import type { SafetyTipProps } from './safety-tip.types';

export function SafetyTip({ city }: SafetyTipProps) {
  const styles = useStyles();

  const openNearbyMeetupSpots = () => {
    const query = city
      ? `${t('book.safety.meetupQuery')}, ${city}`
      : t('book.safety.meetupQuery');
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query,
    )}`;
    void Linking.openURL(url).catch(() => undefined);
  };

  return (
    <View style={styles.tip}>
      <Ionicons
        name="shield-checkmark-outline"
        size={styles.iconSize}
        color={styles.colors.icon}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{t('book.safety.title')}</Text>
        <Text style={styles.text}>{t('book.safety.text')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={openNearbyMeetupSpots}
          style={({ pressed }) => [
            styles.meetupButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="location-outline"
            size={styles.meetupIconSize}
            color={styles.colors.accent700}
          />
          <Text style={styles.meetupText}>
            {t('book.safety.meetupButton')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
