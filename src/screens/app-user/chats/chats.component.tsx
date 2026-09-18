import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from 'shared/components/ui';
import { useAppStore } from 'store/AppStore';
import { ChatItem } from './components/chat-item';
import { useStyles } from './chats.styles';
import type { ChatsScreenProps } from './chats.types';

export function ChatsScreen({ navigation }: ChatsScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const store = useAppStore();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Чати" />

      <ScrollView contentContainerStyle={styles.page}>
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
    </View>
  );
}
