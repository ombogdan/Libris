import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { t } from 'shared/localization/i18n';
import { useStyles } from './safety-tip.styles';

export function SafetyTip() {
  const styles = useStyles();

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
      </View>
    </View>
  );
}
