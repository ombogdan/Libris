import React from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabParamList } from '../navigation/types';
import { common, ScreenTitle } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
export function ChatsScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, 'Chats'>) {
  const x = useAppStore();
  return (
    <ScrollView contentContainerStyle={common.page}>
      <ScreenTitle>Чати</ScreenTitle>
      {x.chats.map(ch => (
        <Pressable
          key={ch.id}
          style={s.row}
          onPress={() => navigation.getParent()?.navigate('Thread', { chatId: ch.id })}
        >
          <View style={s.avatar}>
            <Text style={s.avatarText}>{ch.name[0]}</Text>
          </View>
          <View style={common.grow}>
            <View style={s.between}>
              <Text style={s.name}>{ch.name}</Text>
              <Text style={common.mini}>{ch.time}</Text>
            </View>
            <Text numberOfLines={1} style={common.meta}>
              {ch.msgs.at(-1)?.text}
            </Text>
            <Text style={s.topic}>{ch.about}</Text>
          </View>
          {ch.unread && <View style={s.unread} />}
        </Pressable>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  row: {
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: c.violet300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: c.violet800 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '800', color: c.text },
  topic: { fontSize: 11, color: c.accent700, marginTop: 3 },
  unread: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: c.accent,
  },
});
