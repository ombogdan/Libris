import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { Button, Chip } from '../components/ui';
import { colors as c } from '../theme';
export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Welcome'>) {
  return (
    <View style={s.page}>
      <View>
        <View style={s.logo}>
          <Text style={s.logoText}>К</Text>
        </View>
        <Text style={s.hero}>Книжки,{`\n`}що йдуть далі</Text>
        <Text style={s.sub}>
          Продавай прочитане, віддавай безкоштовно, знаходь підручники в своєму
          місті.
        </Text>
      </View>
      <View>
        <View style={s.tags}>
          <View style={s.tag}>
            <Text style={s.tagText}>1 240 книг поруч</Text>
          </View>
          <Chip label="Полтава · Київ · Львів" />
        </View>
        <Button
          label="Створити акаунт"
          onPress={() => navigation.navigate('Signup')}
        />
        <Button
          secondary
          label="Спершу подивлюсь"
          onPress={() => navigation.replace('Tabs', { screen: 'Feed' })}
        />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 42,
    paddingBottom: 34,
    justifyContent: 'space-between',
    backgroundColor: c.bg,
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  logoText: { fontSize: 34, fontWeight: '800', color: c.bg },
  hero: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: c.text,
    marginBottom: 15,
  },
  sub: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(16,26,20,.58)',
    maxWidth: 340,
  },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 13, flexWrap: 'wrap' },
  tag: {
    backgroundColor: c.violet200,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  tagText: { color: c.violet800, fontSize: 12.5, fontWeight: '700' },
});
