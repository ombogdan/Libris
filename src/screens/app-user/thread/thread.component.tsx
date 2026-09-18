import { useFocusEffect } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Empty, ScreenHeader } from 'shared/components/ui';
import type { Message } from 'shared/data';
import { useTheme } from 'shared/theme';
import { useAppStore } from 'store/AppStore';
import { MessageBubble } from './components/message-bubble';
import { useStyles } from './thread.styles';
import type { ThreadScreenProps } from './thread.types';

const QUICK_MESSAGES = [
  'Ще актуально?',
  'Готова зустрітись сьогодні',
  'Можна Новою поштою?',
];

const LOAD_OLDER_OFFSET = 56;
const NEAR_BOTTOM_OFFSET = 96;

export function ThreadScreen({ navigation, route }: ThreadScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
  const app = useAppStore();
  const chatId = route.params.chatId;
  const chat = app.chats.find(value => value.id === chatId);
  const activeChatId = chat?.id;
  const reloadChats = app.reloadChats;
  const loadChatMessages = app.loadChatMessages;
  const loadOlder = app.loadOlderMessages;
  const sendMessage = app.send;
  const retryFailedMessage = app.retryMessage;
  const [draft, setDraft] = useState('');
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);
  const didInitialScroll = useRef(false);
  const nearBottom = useRef(true);
  const pullingToRefresh = useRef(false);
  const refreshing = useRef(false);
  const loadingOlder = useRef(false);

  const lastMessageId = chat?.msgs.at(-1)?.id;
  const initial = chat?.name.trim().charAt(0).toUpperCase() || '?';

  useEffect(() => {
    didInitialScroll.current = false;
    nearBottom.current = true;
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      if (!activeChatId) {
        void reloadChats().catch(() => undefined);
        return undefined;
      }

      void loadChatMessages(activeChatId, { refresh: true }).catch(
        () => undefined,
      );
      const interval = setInterval(() => {
        void loadChatMessages(activeChatId, {
          refresh: true,
          silent: true,
        }).catch(() => undefined);
      }, 7_000);

      return () => clearInterval(interval);
    }, [activeChatId, loadChatMessages, reloadChats]),
  );

  useEffect(() => {
    if (!chat?.messagesLoaded || !lastMessageId) {
      return;
    }

    if (!didInitialScroll.current || nearBottom.current) {
      const frame = requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: didInitialScroll.current });
        didInitialScroll.current = true;
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [chat?.messagesLoaded, lastMessageId]);

  const refreshMessages = useCallback(() => {
    if (
      !activeChatId ||
      chat?.messagesLoading ||
      refreshing.current ||
      refreshingMessages
    ) {
      return;
    }

    refreshing.current = true;
    setRefreshingMessages(true);
    void loadChatMessages(activeChatId, { refresh: true })
      .catch(() => undefined)
      .finally(() => {
        refreshing.current = false;
        setRefreshingMessages(false);
      });
  }, [
    activeChatId,
    chat?.messagesLoading,
    loadChatMessages,
    refreshingMessages,
  ]);

  const loadOlderMessages = useCallback(() => {
    if (
      !activeChatId ||
      !chat?.messagesLoaded ||
      !chat.hasMoreMessages ||
      chat.messagesLoading ||
      chat.messagesLoadingMore ||
      refreshing.current ||
      loadingOlder.current
    ) {
      return;
    }

    loadingOlder.current = true;
    void loadOlder(activeChatId)
      .catch(() => undefined)
      .finally(() => {
        loadingOlder.current = false;
      });
  }, [
    activeChatId,
    chat?.hasMoreMessages,
    chat?.messagesLoaded,
    chat?.messagesLoading,
    chat?.messagesLoadingMore,
    loadOlder,
  ]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      pullingToRefresh.current = contentOffset.y < -4;
      nearBottom.current =
        contentSize.height - layoutMeasurement.height - contentOffset.y <
        NEAR_BOTTOM_OFFSET;
    },
    [],
  );

  const maybeLoadOlder = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;

      if (pullingToRefresh.current || offset < 0) {
        pullingToRefresh.current = false;
        return;
      }

      if (didInitialScroll.current && offset <= LOAD_OLDER_OFFSET) {
        loadOlderMessages();
      }
    },
    [loadOlderMessages],
  );

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!activeChatId || !text) {
      return;
    }

    setDraft('');
    nearBottom.current = true;
    void sendMessage(activeChatId, text).catch(() => undefined);
  }, [activeChatId, draft, sendMessage]);

  const retryMessage = useCallback(
    (message: Message) => {
      if (!activeChatId || message.status !== 'failed') {
        return;
      }

      nearBottom.current = true;
      void retryFailedMessage(activeChatId, message.id).catch(() => undefined);
    },
    [activeChatId, retryFailedMessage],
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        onRetry={
          item.status === 'failed' ? () => retryMessage(item) : undefined
        }
      />
    ),
    [retryMessage],
  );

  const historyHeader = useMemo(() => {
    if (!chat) {
      return null;
    }

    if (chat.messagesLoadingMore) {
      return (
        <View style={styles.historyState}>
          <ActivityIndicator size="small" color={theme.palette.accent} />
          <Text style={styles.historyText}>Завантажуємо попередні…</Text>
        </View>
      );
    }

    const hasFailedMessage = chat.msgs.some(
      message => message.status === 'failed',
    );

    if (chat.messagesError && chat.msgs.length && !hasFailedMessage) {
      return (
        <View style={styles.historyError}>
          <Text style={styles.historyErrorText}>{chat.messagesError}</Text>
          <View style={styles.historyActions}>
            <Pressable accessibilityRole="button" onPress={refreshMessages}>
              <Text style={styles.historyRetry}>Оновити</Text>
            </Pressable>
            {chat.hasMoreMessages ? (
              <Pressable accessibilityRole="button" onPress={loadOlderMessages}>
                <Text style={styles.historyRetry}>Попередні</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      );
    }

    if (chat.hasMoreMessages) {
      return (
        <Pressable
          accessibilityRole="button"
          style={styles.loadOlderButton}
          onPress={loadOlderMessages}
        >
          <Text style={styles.loadOlderText}>Завантажити попередні</Text>
        </Pressable>
      );
    }

    return null;
  }, [chat, loadOlderMessages, refreshMessages, styles, theme.palette.accent]);

  if (!chat) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Чат" onBack={navigation.goBack} />
        <View style={styles.missingState}>
          {app.chatsLoading ? (
            <>
              <ActivityIndicator size="large" color={theme.palette.accent} />
              <Text style={styles.stateText}>Завантажуємо чат…</Text>
            </>
          ) : app.chatsError ? (
            <>
              <Empty text="Не вдалося відкрити чат. Перевір з’єднання та спробуй ще раз." />
              <Button
                secondary
                label="Спробувати ще раз"
                onPress={() => void reloadChats()}
              />
            </>
          ) : (
            <Empty text="Цей чат більше недоступний." />
          )}
        </View>
      </View>
    );
  }

  const initialLoading =
    chat.messagesLoading && !chat.messagesLoaded && !chat.msgs.length;
  const initialError =
    chat.messagesError && !chat.messagesLoaded && !chat.msgs.length;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.screen}>
        <ScreenHeader onBack={navigation.goBack}>
          <View style={styles.contact}>
            <View style={styles.avatar}>
              {chat.avatarUrl ? (
                <Image
                  source={{ uri: chat.avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            <View style={styles.contactDetails}>
              <Text numberOfLines={1} style={styles.name}>
                {chat.name}
              </Text>
              <Text numberOfLines={1} style={styles.topic}>
                {chat.about}
              </Text>
            </View>
          </View>
        </ScreenHeader>

        <View style={styles.page}>
          {initialLoading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={theme.palette.accent} />
              <Text style={styles.stateText}>Завантажуємо повідомлення…</Text>
            </View>
          ) : initialError ? (
            <View style={styles.initialError}>
              <Empty text="Не вдалося завантажити повідомлення. Перевір з’єднання та спробуй ще раз." />
              <Button
                secondary
                label="Спробувати ще раз"
                onPress={refreshMessages}
              />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={chat.msgs}
              keyExtractor={message => message.id}
              renderItem={renderMessage}
              style={styles.messagesList}
              contentContainerStyle={[
                styles.messages,
                !chat.msgs.length && styles.emptyMessages,
              ]}
              ListHeaderComponent={historyHeader}
              ListEmptyComponent={
                <Text style={styles.emptyMessagesText}>
                  Напиши перше повідомлення про цю книгу
                </Text>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshingMessages}
                  onRefresh={refreshMessages}
                  colors={[theme.palette.accent]}
                  tintColor={theme.palette.accent}
                />
              }
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              onScroll={handleScroll}
              onScrollEndDrag={maybeLoadOlder}
              onMomentumScrollEnd={maybeLoadOlder}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
            />
          )}

          {!initialLoading && !initialError ? (
            <ScrollView
              horizontal
              style={styles.quickList}
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quick}
            >
              {QUICK_MESSAGES.map(value => (
                <Chip
                  key={value}
                  label={value}
                  onPress={() => {
                    setDraft(value);
                    inputRef.current?.focus();
                  }}
                />
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.compose}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submit}
              placeholder="Повідомлення…"
              placeholderTextColor={styles.colors.placeholder}
              multiline
              submitBehavior="submit"
              returnKeyType="send"
              textAlignVertical="center"
              maxLength={2000}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Надіслати повідомлення"
              disabled={!draft.trim()}
              onPress={submit}
              style={({ pressed }) => [
                styles.send,
                !draft.trim() && styles.sendDisabled,
                pressed && styles.sendPressed,
              ]}
            >
              <Text style={styles.sendText}>↑</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
