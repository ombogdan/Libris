import React from 'react';
import { Text, View } from 'react-native';

import { useStyles } from './settings-section.styles';
import type { SettingsSectionProps } from './settings-section.types';

export function SettingsSection({
  title,
  footnote,
  children,
}: SettingsSectionProps) {
  const styles = useStyles();

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
      {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
    </View>
  );
}
