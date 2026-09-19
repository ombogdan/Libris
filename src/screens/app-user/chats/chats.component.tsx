import { t } from 'shared/localization/i18n';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import type { ChatSection, ChatsScreenProps } from './chats.types';

const CHAT_SECTIONS: { key: ChatSection; labelKey: string }[] = [
  { key: 'buying', labelKey: 'chats.buying' },
  { key: 'selling', labelKey: 'chats.selling' },
  { key: 'archive', labelKey: 'chats.archive' },
];

const EMPTY_SECTION_KEY: Record<ChatSection, string> = {
  buying: 'chats.buyingEmpty',
  selling: 'chats.sellingEmpty',
  archive: 'chats.archiveEmpty',
};

export function ChatsScreen({ navigation }: ChatsScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
  const store = useAppStore();
  const reloadChats = store.reloadChats;
  const [activeSection, setActiveSection] = useState<ChatSection>('buying');
  const [refreshingChats, setRefreshingChats] = useState(false);
  const autoSelectedSection = useRef(false);
  const sectionChats = useMemo(
    () => store.chats.filter(chat => chat.section === activeSection),
    [activeSection, store.chats],
  );
  const hasChats = sectionChats.length > 0;

  useEffect(() => {
    if (autoSelectedSection.current || store.chatsLoading) {
      return;
    }

    autoSelectedSection.current = true;
    const sectionWithUnread = CHAT_SECTIONS.find(section =>
      store.chats.some(chat => chat.section === section.key && chat.unread),
    );

    if (sectionWithUnread) {
      setActiveSection(sectionWithUnread.key);
    }
  }, [store.chatsLoading, store.chats]);

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
          <Text style={styles.stateText}>{t('chats.loading')}</Text>
        </View>
      );
    }

    if (store.chatsError) {
      return (
        <View style={styles.emptyState}>
          <Empty text={t('chats.loadError')} />
          <Button
            secondary
            label={t('common.retry')}
            onPress={() => void store.reloadChats()}
          />
        </View>
      );
    }

    return <Empty text={t(EMPTY_SECTION_KEY[activeSection])} />;
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('chats.title')} />

      <View
        accessibilityRole="tablist"
        accessibilityLabel={t('chats.sectionsLabel')}
        style={styles.tabs}
      >
        {CHAT_SECTIONS.map(section => {
          const active = section.key === activeSection;

          return (
            <Pressable
              key={section.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setActiveSection(section.key)}
              style={({ pressed }) => [
                styles.tab,
                active && styles.tabActive,
                pressed && styles.tabPressed,
              ]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t(section.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={sectionChats}
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
                {t('chats.updateError')}
              </Text>
              <Button
                secondary
                label={t('common.repeat')}
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
