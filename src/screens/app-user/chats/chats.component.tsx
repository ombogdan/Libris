import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Empty, ScreenHeader } from 'shared/components/ui';
import type { Chat } from 'shared/data';
import { useTheme } from 'shared/theme';
import { useAppStore } from 'store/AppStore';
import { ChatItem } from './components/chat-item';
import { useStyles } from './chats.styles';
import type { ChatsScreenProps } from './chats.types';

export function ChatsScreen({ navigation }: ChatsScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
  const store = useAppStore();
  const hasChats = store.chats.length > 0;
  const reloadChats = store.reloadChats;
  const [refreshingChats, setRefreshingChats] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void reloadChats();
      const interval = setInterval(() => {
        void reloadChats({ silent: true });
      }, 15_000);

      return () => clearInterval(interval);
    }, [reloadChats]),
  );

  const openChat = useCallback(
    (chat: Chat) => {
      navigation.getParent()?.navigate('Thread', { chatId: chat.id });
    },
    [navigation],
  );

  const refreshChats = useCallback(() => {
    if (refreshingChats) {
      return;
    }

    setRefreshingChats(true);
    void reloadChats().finally(() => setRefreshingChats(false));
  }, [refreshingChats, reloadChats]);

  const renderChat = useCallback(
    ({ item }: { item: Chat }) => (
      <ChatItem chat={item} onPress={() => openChat(item)} />
    ),
    [openChat],
  );

  const renderEmpty = () => {
    if (store.chatsLoading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.palette.accent} />
          <Text style={styles.stateText}>Завантажуємо чати…</Text>
        </View>
      );
    }

    if (store.chatsError) {
      return (
        <View style={styles.emptyState}>
          <Empty text="Не вдалося завантажити чати. Перевір з’єднання та спробуй ще раз." />
          <Button
            secondary
            label="Спробувати ще раз"
            onPress={() => void store.reloadChats()}
          />
        </View>
      );
    }

    return <Empty text="Тут з’являться твої розмови про книги з оголошень." />;
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Чати" />

      <FlatList
        data={store.chats}
        keyExtractor={chat => chat.id}
        renderItem={renderChat}
        contentContainerStyle={[styles.page, !hasChats && styles.emptyPage]}
        refreshControl={
          <RefreshControl
            refreshing={refreshingChats}
            onRefresh={refreshChats}
            colors={[theme.palette.accent]}
            tintColor={theme.palette.accent}
          />
        }
        ListHeaderComponent={
          store.chatsError && hasChats ? (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>
                Не вдалося оновити чати
              </Text>
              <Button
                secondary
                label="Повторити"
                onPress={() => void store.reloadChats()}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
