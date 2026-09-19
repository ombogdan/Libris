import { formatRating, t } from 'shared/localization/i18n';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from 'providers/auth/AuthProvider';
import { ListRow } from 'shared/components/list-row';
import {
  ProfileEditModal,
  useProfileEditor,
} from 'shared/components/profile-edit-modal';
import { Button, ScreenHeader } from 'shared/components/ui';
import { signOutFromGoogle } from 'services/auth';
import { useAppStore } from 'store/AppStore';
import { ProfileMetric } from './components/profile-metric';
import { useStyles } from './profile.styles';
import type { ProfileScreenProps } from './profile.types';

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const app = useAppStore();
  const { session, profile, profileError, refreshProfile } = useAuth();
  const editor = useProfileEditor();

  const name =
    profile?.display_name.trim() ||
    session?.user.email?.split('@')[0] ||
    t('common.user');
  const city = profile?.city?.trim() || t('common.notSpecified');
  const email = profile?.email || session?.user.email || '';
  const createdYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;
  const activeListings = app.ads.filter(ad => ad.status === 'active').length;
  const soldListings = app.ads.filter(ad => ad.status === 'sold').length;
  const meta = [
    city,
    email,
    createdYear ? t('common.since', { year: createdYear }) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('profile.title')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <View style={styles.top}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{name[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{name}</Text>
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        </View>

        <View style={styles.metrics}>
          <ProfileMetric
            value={String(app.ads.length)}
            label={t('profile.listings')}
          />
          <ProfileMetric
            value={String(activeListings)}
            label={t('profile.active')}
          />
          <ProfileMetric
            value={String(soldListings)}
            label={t('profile.sold')}
          />
        </View>

        <View style={styles.rows}>
          <ListRow
            label={t('profile.myListings')}
            value={String(app.ads.length)}
            onPress={() => navigation.getParent()?.navigate('MyListings')}
          />
          <ListRow
            label={t('profile.favorites')}
            value={String(app.favs.length)}
            onPress={() => navigation.navigate('Favorites')}
          />
          <ListRow
            label={t('profile.myReviews')}
            value={
              profile?.review_count
                ? `${formatRating(profile.rating_average)} · ${
                    profile.review_count
                  }`
                : t('common.noneYet')
            }
            onPress={() => {
              if (session?.user.id) {
                navigation.getParent()?.navigate('UserReviews', {
                  userId: session.user.id,
                  displayName: name,
                });
              }
            }}
          />
          <ListRow
            label={t('profile.city')}
            value={city}
            onPress={() => editor.open('city')}
            isLast
          />
        </View>

        {session ? (
          <View style={styles.rows}>
            <ListRow
              label={t('settings.title')}
              onPress={() => navigation.getParent()?.navigate('Settings')}
              isLast
            />
          </View>
        ) : null}

        {profileError ? <Text style={styles.error}>{profileError}</Text> : null}

        {session ? (
          <Button
            danger
            label={t('profile.signOut')}
            onPress={signOutFromGoogle}
          />
        ) : (
          <Button
            label={t('profile.signIn')}
            onPress={() =>
              navigation
                .getParent()
                ?.reset({ index: 0, routes: [{ name: 'Welcome' }] })
            }
          />
        )}
      </ScrollView>

      <ProfileEditModal {...editor.modalProps} />
    </View>
  );
}
