import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { Chip, common } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
export function ThreadScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Thread'>) {
  const x = useAppStore();
  const chat = x.chats.find(v => v.id === route.params.chatId);
  const [draft, setDraft] = useState('');
  if (!chat) return null;
  const submit = () => {
    if (!draft.trim()) return;
    x.send(chat.id, draft.trim());
    setDraft('');
  };
  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.page}>
        <View style={s.header}>
          <Pressable onPress={navigation.goBack}>
            <Text style={common.back}>←</Text>
          </Pressable>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{chat.name[0]}</Text>
          </View>
          <View>
            <Text style={s.name}>{chat.name}</Text>
            <Text style={s.topic}>{chat.about}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={s.messages}>
          {chat.msgs.map((m, i) => (
            <View key={i} style={[s.bubble, m.me ? s.mine : s.theirs]}>
              <Text style={[s.message, m.me && { color: c.bg }]}>{m.text}</Text>
            </View>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.quick}
        >
          {[
            'Ще актуально?',
            'Готова зустрітись сьогодні',
            'Можна Новою поштою?',
          ].map(v => (
            <Chip key={v} label={v} onPress={() => setDraft(v)} />
          ))}
        </ScrollView>
        <View style={s.compose}>
          <TextInput
            style={s.input}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            placeholder="Повідомлення…"
          />
          <Pressable onPress={submit} style={s.send}>
            <Text style={s.sendText}>→</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  flex: { flex: 1 },
  page: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: c.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: c.violet300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800', color: c.violet800 },
  name: { fontSize: 16, fontWeight: '800', color: c.text },
  topic: { fontSize: 11, color: c.accent700 },
  messages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: 8,
    paddingVertical: 12,
  },
  bubble: {
    maxWidth: '76%',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: c.accent,
    borderBottomRightRadius: 6,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: c.surface,
    borderBottomLeftRadius: 6,
  },
  message: { fontSize: 14, lineHeight: 20, color: c.text },
  quick: { gap: 7, paddingBottom: 9 },
  compose: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
    paddingHorizontal: 16,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: c.bg, fontSize: 22, fontWeight: '800' },
});
