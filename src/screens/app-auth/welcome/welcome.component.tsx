import { formatBooksCount, t } from 'shared/localization/i18n';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Chip } from 'shared/components/ui';
import { fetchWelcomeStats } from 'services/books';
import type { WelcomeStats } from 'services/books';
import { useStyles } from './welcome.styles';
import type { WelcomeScreenProps } from './welcome.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<WelcomeStats | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetchWelcomeStats()
      .then(result => {
        if (mounted) {
          setStats(result);
        }
      })
      .catch(() => {
        // The welcome screen remains usable when the public stats request fails.
      })
      .finally(() => {
        if (mounted) {
          setStatsLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

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
        {stats || !statsLoaded ? (
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {stats
                  ? t('welcome.availableBooks', {
                      books: formatBooksCount(stats.listingCount),
                    })
                  : t('welcome.loadingStats')}
              </Text>
            </View>
            {stats?.popularCities.length ? (
              <Chip label={stats.popularCities.join(' · ')} />
            ) : null}
          </View>
        ) : null}
        <Button
          label={t('welcome.signInOrCreate')}
          onPress={() => navigation.navigate('Signup')}
        />
        <Button
          secondary
          label={t('welcome.browseFirst')}
          onPress={() => navigation.replace('Tabs', { screen: 'Feed' })}
        />
        <View style={{ height: insets.bottom }} />
      </View>
    </View>
  );
}
