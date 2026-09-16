import React from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabParamList } from '../navigation/types';
import { common, ScreenTitle } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
import { useAuth } from '../auth/AuthProvider';
import { signOutFromGoogle } from '../services/auth';
export function ProfileScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, 'Profile'>) {
  const x = useAppStore();
  const { session, profile } = useAuth();
  const name = profile?.display_name || x.user;
  const city = profile?.city || x.city;
  const contact = profile?.phone || x.contact;
  const rows = [
    ['Мої оголошення', String(x.ads.length)],
    ['Обране', String(x.favs.length)],
    ['Місто', city],
    ['Спосіб зв’язку', contact || 'Не вказано'],
    ['Відгуки', '4,9 ★'],
  ];
  return (
    <ScrollView contentContainerStyle={common.page}>
      <ScreenTitle>Профіль</ScreenTitle>
      <View style={s.top}>
        <View style={s.avatar}>
          <Text style={s.initial}>{name[0] || 'О'}</Text>
        </View>
        <Text style={s.title}>{name || 'Оксана'}</Text>
        <Text style={common.meta}>★ 4,9 · {city || 'Полтава'} · з 2026</Text>
      </View>
      <View style={s.metrics}>
        {[
          ['3', 'оголошення'],
          ['7', 'продано'],
          ['4', 'віддано'],
        ].map(([v, l]) => (
          <View key={l} style={s.metric}>
            <Text style={s.value}>{v}</Text>
            <Text style={common.mini}>{l}</Text>
          </View>
        ))}
      </View>
      {rows.map(([l, v], i) => (
        <Pressable
          key={l}
          style={s.row}
          onPress={() => i === 0 && navigation.getParent()?.navigate('MyListings')}
        >
          <Text style={s.label}>{l}</Text>
          <Text style={common.meta}>{v} ›</Text>
        </Pressable>
      ))}
      {session ? (
        <Pressable onPress={signOutFromGoogle}>
          <Text style={s.logout}>Вийти з акаунта</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() =>
            navigation
              .getParent()
              ?.reset({ index: 0, routes: [{ name: 'Welcome' }] })
          }>
          <Text style={s.logout}>Увійти або створити акаунт</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  top: { alignItems: 'center', gap: 6, paddingVertical: 10 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 28, fontWeight: '800', color: c.bg },
  title: { fontSize: 23, fontWeight: '800', color: c.text },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 13,
    alignItems: 'center',
    gap: 3,
  },
  value: { fontSize: 22, fontWeight: '800', color: c.text },
  row: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 14.5, fontWeight: '600', color: c.text },
  logout: { color: c.accent700, fontWeight: '700', paddingVertical: 18 },
});
