import React from 'react';
import { ScrollView } from 'react-native';
import { ScreenTitle } from '../../components/ui';
import { useAppStore } from '../../store/AppStore';
import { ChatItem } from './components/chat-item';
import { useStyles } from './chats.styles';
import type { ChatsScreenProps } from './chats.types';

export function ChatsScreen({ navigation }: ChatsScreenProps) {
  const styles = useStyles();
  const store = useAppStore();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <ScreenTitle>Чати</ScreenTitle>
      {store.chats.map(chat => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onPress={() =>
            navigation.getParent()?.navigate('Thread', { chatId: chat.id })
          }
        />
      ))}
    </ScrollView>
  );
}
