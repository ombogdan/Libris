import { t } from 'shared/localization/i18n';
import React from 'react';
import { Text, View } from 'react-native';

import { Button, Chip } from 'shared/components/ui';
import { useStyles } from './welcome.styles';
import type { WelcomeScreenProps } from './welcome.types';

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const styles = useStyles();

  return (
    <View style={styles.page}>
      <View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{t('common.logoLetter')}</Text>
        </View>
        <Text style={styles.hero}>{t('welcome.title')}</Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
      </View>
      <View>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{t('welcome.nearbyBooks')}</Text>
          </View>
          <Chip label={t('welcome.cities')} />
        </View>
        <Button
          label={t('welcome.createAccount')}
          onPress={() => navigation.navigate('Signup')}
        />
        <Button
          secondary
          label={t('welcome.browseFirst')}
          onPress={() => navigation.replace('Tabs', { screen: 'Feed' })}
        />
      </View>
    </View>
  );
}
