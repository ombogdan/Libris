import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import {
  Button,
  common,
  Cover,
  PricePill,
  ScreenTitle,
} from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
export function MyListingsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'MyListings'>) {
  const x = useAppStore();
  return (
    <ScrollView contentContainerStyle={common.page}>
      <Pressable onPress={navigation.goBack}>
        <Text style={common.back}>← Назад</Text>
      </Pressable>
      <ScreenTitle>Мої оголошення</ScreenTitle>
      {x.ads.map(a => (
        <View key={a.id} style={s.row}>
          <Cover book={{ title: a.title, tone: a.tone }} />
          <View style={s.info}>
            <Text style={s.title}>{a.title}</Text>
            <View style={common.inline}>
              <PricePill value={a.price} />
              <View style={s.status}>
                <Text style={s.statusText}>{a.status}</Text>
              </View>
            </View>
            <Text style={common.mini}>{a.stats}</Text>
          </View>
        </View>
      ))}
      <Button
        secondary
        label="Додати ще книгу"
        onPress={() => navigation.navigate('Tabs', { screen: 'Add' })}
      />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  row: {
    backgroundColor: c.surface,
    borderRadius: 28,
    padding: 12,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  info: { flex: 1, gap: 6 },
  title: { fontSize: 16, fontWeight: '800', color: c.text },
  status: {
    backgroundColor: c.violet100,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  statusText: { fontSize: 11, color: c.violet800, fontWeight: '700' },
});
