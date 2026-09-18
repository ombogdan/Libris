import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '../../auth/AuthProvider';
import { ScreenTitle } from '../../components/ui';
import { signOutFromGoogle } from '../../services/auth';
import { useAppStore } from '../../store/AppStore';
import { ProfileMetric } from './components/profile-metric';
import { ProfileRow } from './components/profile-row';
import { useStyles } from './profile.styles';
import type { ProfileScreenProps } from './profile.types';

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const styles = useStyles();
  const app = useAppStore();
  const { session, profile } = useAuth();
  const name = profile?.display_name || app.user;
  const city = profile?.city || app.city;
  const contact = profile?.phone || app.contact;
  const rows = [
    ['Мої оголошення', String(app.ads.length)],
    ['Обране', String(app.favs.length)],
    ['Місто', city],
    ['Спосіб зв’язку', contact || 'Не вказано'],
    ['Відгуки', '4,9 ★'],
  ];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <ScreenTitle>Профіль</ScreenTitle>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{name[0] || 'О'}</Text>
        </View>
        <Text style={styles.title}>{name || 'Оксана'}</Text>
        <Text style={styles.meta}>★ 4,9 · {city || 'Полтава'} · з 2026</Text>
      </View>
      <View style={styles.metrics}>
        <ProfileMetric value="3" label="оголошення" />
        <ProfileMetric value="7" label="продано" />
        <ProfileMetric value="4" label="віддано" />
      </View>
      {rows.map(([label, value], index) => (
        <ProfileRow
          key={label}
          label={label}
          value={value}
          onPress={
            index === 0
              ? () => navigation.getParent()?.navigate('MyListings')
              : undefined
          }
        />
      ))}
      {session ? (
        <Pressable onPress={signOutFromGoogle}>
          <Text style={styles.logout}>Вийти з акаунта</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() =>
            navigation
              .getParent()
              ?.reset({ index: 0, routes: [{ name: 'Welcome' }] })
          }
        >
          <Text style={styles.logout}>Увійти або створити акаунт</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
