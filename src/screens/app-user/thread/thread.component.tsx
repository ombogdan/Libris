import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip, ScreenHeader } from 'shared/components/ui';
import { useAppStore } from 'store/AppStore';
import { MessageBubble } from './components/message-bubble';
import { useStyles } from './thread.styles';
import type { ThreadScreenProps } from './thread.types';

const QUICK_MESSAGES = [
  'Ще актуально?',
  'Готова зустрітись сьогодні',
  'Можна Новою поштою?',
];

export function ThreadScreen({ navigation, route }: ThreadScreenProps) {
  const styles = useStyles();
  const app = useAppStore();
  const chat = app.chats.find(value => value.id === route.params.chatId);
  const [draft, setDraft] = useState('');

  if (!chat) {
    return null;
  }

  const submit = () => {
    if (!draft.trim()) {
      return;
    }
    app.send(chat.id, draft.trim());
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.screen}>
        <ScreenHeader onBack={navigation.goBack}>
          <View style={styles.contact}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{chat.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.name}>{chat.name}</Text>
              <Text style={styles.topic}>{chat.about}</Text>
            </View>
          </View>
        </ScreenHeader>

        <View style={styles.page}>
          <ScrollView contentContainerStyle={styles.messages}>
            {chat.msgs.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quick}
          >
            {QUICK_MESSAGES.map(value => (
              <Chip key={value} label={value} onPress={() => setDraft(value)} />
            ))}
          </ScrollView>
          <View style={styles.compose}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submit}
              placeholder="Повідомлення…"
              placeholderTextColor={styles.colors.placeholder}
            />
            <Pressable onPress={submit} style={styles.send}>
              <Text style={styles.sendText}>→</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
