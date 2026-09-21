import { t } from 'shared/localization/i18n';
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
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  KeyboardEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getFriendlyErrorMessage } from 'services/moderation';
import { ListRow } from 'shared/components/list-row';
import { ReportModal, useReportFlow } from 'shared/components/report-modal';
import { Button, Chip, Empty, ScreenHeader } from 'shared/components/ui';
import type { Message } from 'shared/data';
import { useTheme } from 'shared/theme';
import { useAppStore } from 'store/AppStore';
import { MessageBubble } from './components/message-bubble';
import { ReviewBanner } from './components/review-banner';
import { ReviewModal } from './components/review-modal';
import { useStyles } from './thread.styles';
import type { ThreadScreenProps } from './thread.types';

const QUICK_MESSAGE_KEYS = [
  'thread.quickActual',
  'thread.quickMeet',
  'thread.quickDelivery',
];

const LOAD_OLDER_OFFSET = 56;
const NEAR_BOTTOM_OFFSET = 96;

export function ThreadScreen({ navigation, route }: ThreadScreenProps) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const styles = useStyles({ bottomInset: insets.bottom, keyboardVisible });
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
  const pageFrame = useRef({ y: 0, height: 0 });
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const report = useReportFlow({ reportedUserId: chat?.otherUserId });

  const lastMessageId = chat?.msgs.at(-1)?.id;
  const initial = chat?.name.trim().charAt(0).toUpperCase() || '?';
  const isDeleted = chat?.archiveReason === 'deleted';

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

      void reloadChats({ silent: true }).catch(() => undefined);
      void loadChatMessages(activeChatId, { refresh: true }).catch(
        () => undefined,
      );
      const interval = setInterval(() => {
        void reloadChats({ silent: true }).catch(() => undefined);
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
    // overlayHeight is included so the initial scroll re-anchors once the
    // floating composer's real height is measured (it starts at 0), instead
    // of settling on a stale end position computed before that layout pass.
  }, [chat?.messagesLoaded, lastMessageId, overlayHeight]);

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

  const handlePageLayout = useCallback((event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    pageFrame.current = { y, height };
  }, []);

  const handleOverlayLayout = useCallback((event: LayoutChangeEvent) => {
    setOverlayHeight(event.nativeEvent.layout.height);
  }, []);

  // iOS only: the window keeps its size under the keyboard, so the composer is
  // lifted by hand. Android's adjustResize already shrinks the window.
  const applyKeyboardMetrics = useCallback(
    (event: KeyboardEvent) => {
      const { y, height } = pageFrame.current;
      // `page` is measured relative to the root SafeAreaView, which already
      // shifted everything down by insets.top, while the keyboard's
      // screenY is in true window coordinates — add it back to compare.
      const overlap = insets.top + y + height - event.endCoordinates.screenY;
      Keyboard.scheduleLayoutAnimation(event);
      setKeyboardPadding(Math.max(overlap, 0));
      setKeyboardVisible(overlap > 0);
    },
    [insets.top],
  );

  useEffect(() => {
    const subscriptions =
      Platform.OS === 'ios'
        ? [
            Keyboard.addListener('keyboardWillShow', applyKeyboardMetrics),
            Keyboard.addListener('keyboardWillHide', applyKeyboardMetrics),
            Keyboard.addListener(
              'keyboardWillChangeFrame',
              applyKeyboardMetrics,
            ),
          ]
        : [
            Keyboard.addListener('keyboardDidShow', () =>
              setKeyboardVisible(true),
            ),
            Keyboard.addListener('keyboardDidHide', () =>
              setKeyboardVisible(false),
            ),
          ];

    return () => subscriptions.forEach(subscription => subscription.remove());
  }, [applyKeyboardMetrics]);

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
    if (!activeChatId || !text || isDeleted) {
      return;
    }

    setDraft('');
    nearBottom.current = true;
    void sendMessage(activeChatId, text)
      .then(accepted => {
        // A rejected text goes back so it can be edited, unless the user has
        // already started typing something else.
        if (!accepted) {
          setDraft(current => current || text);
        }
      })
      .catch(() => undefined);
  }, [activeChatId, draft, isDeleted, sendMessage]);

  const submitReview = useCallback(
    (review: { rating: 1 | 2 | 3 | 4 | 5; comment: string }) => {
      if (!activeChatId || reviewSubmitting) {
        return;
      }

      setReviewSubmitting(true);
      setReviewError(null);
      void app
        .submitReview(activeChatId, review.rating, review.comment)
        .then(() => {
          setReviewVisible(false);
          app.notify(t('reviews.published'));
        })
        .catch(error => {
          setReviewError(
            getFriendlyErrorMessage(error, t('reviews.publishError')),
          );
        })
        .finally(() => setReviewSubmitting(false));
    },
    [activeChatId, app, reviewSubmitting],
  );

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
          <Text style={styles.historyText}>{t('thread.loadingPrevious')}</Text>
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
              <Text style={styles.historyRetry}>{t('common.refresh')}</Text>
            </Pressable>
            {chat.hasMoreMessages ? (
              <Pressable accessibilityRole="button" onPress={loadOlderMessages}>
                <Text style={styles.historyRetry}>{t('thread.previous')}</Text>
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
          <Text style={styles.loadOlderText}>{t('thread.loadPrevious')}</Text>
        </Pressable>
      );
    }

    return null;
  }, [chat, loadOlderMessages, refreshMessages, styles, theme.palette.accent]);

  if (!chat) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={t('thread.title')} onBack={navigation.goBack} />
        <View style={styles.missingState}>
          {app.chatsLoading ? (
            <>
              <ActivityIndicator size="large" color={theme.palette.accent} />
              <Text style={styles.stateText}>{t('thread.loadingChat')}</Text>
            </>
          ) : app.chatsError ? (
            <>
              <Empty text={t('thread.chatLoadError')} />
              <Button
                secondary
                label={t('common.retry')}
                onPress={() => void reloadChats()}
              />
            </>
          ) : (
            <Empty text={t('thread.unavailable')} />
          )}
        </View>
      </View>
    );
  }

  const openContactProfile = () =>
    navigation.navigate('UserProfile', {
      userId: chat.otherUserId,
      displayName: chat.name,
    });

  const blockContact = async () => {
    try {
      await app.blockUser(chat.otherUserId);
      app.notify(t('moderation.blocked', { name: chat.name }));
      navigation.goBack();
    } catch (blockError) {
      app.notify(
        blockError && typeof blockError === 'object' && 'message' in blockError
          ? String(blockError.message)
          : t('moderation.blockError'),
      );
    }
  };

  const confirmBlockContact = () => {
    Alert.alert(
      t('moderation.blockConfirmTitle', { name: chat.name }),
      t('moderation.blockConfirmText'),
      [
        { text: t('moderation.menuCancel'), style: 'cancel' },
        {
          text: t('moderation.blockConfirm'),
          style: 'destructive',
          onPress: () => void blockContact(),
        },
      ],
    );
  };

  const runMenuAction = (action: () => void) => () => {
    setMenuVisible(false);
    action();
  };

  const initialLoading =
    chat.messagesLoading && !chat.messagesLoaded && !chat.msgs.length;
  const initialError =
    chat.messagesError && !chat.messagesLoaded && !chat.msgs.length;

  return (
    <View style={styles.screen}>
      <View
        onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)}
      >
        <ScreenHeader onBack={navigation.goBack}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              onPress={openContactProfile}
              style={({ pressed }) => [
                styles.contact,
                pressed && styles.contactPressed,
              ]}
            >
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
              <Ionicons
                name="chevron-forward"
                size={styles.iconSizes.contactArrow}
                color={styles.colors.contactArrow}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('moderation.menuTitle')}
              hitSlop={styles.menuHitSlop}
              onPress={() => setMenuVisible(true)}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed,
              ]}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={styles.menuIconSize}
                color={styles.colors.menuIcon}
              />
            </Pressable>
          </View>
        </ScreenHeader>
      </View>

      <ReviewBanner
        listingStatus={
          chat.archiveReason === 'deleted'
            ? 'deleted'
            : chat.archiveReason === 'sold'
            ? 'sold'
            : 'active'
        }
        otherUserName={chat.name}
        canReview={chat.canReview}
        submittedRating={chat.myReviewRating}
        onLeaveReview={() => {
          setReviewError(null);
          setReviewVisible(true);
        }}
      />

      <View style={styles.page} onLayout={handlePageLayout}>
        {initialLoading ? (
          <View
            style={[styles.centeredState, { paddingBottom: overlayHeight }]}
          >
            <ActivityIndicator size="large" color={theme.palette.accent} />
            <Text style={styles.stateText}>{t('thread.loadingMessages')}</Text>
          </View>
        ) : initialError ? (
          <View style={[styles.initialError, { paddingBottom: overlayHeight }]}>
            <Empty text={t('thread.messagesLoadError')} />
            <Button
              secondary
              label={t('common.retry')}
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
              {
                paddingBottom:
                  styles.messagesBottomBase + overlayHeight + keyboardPadding,
              },
            ]}
            ListHeaderComponent={historyHeader}
            ListEmptyComponent={
              <Text style={styles.emptyMessagesText}>
                {t('thread.firstMessage')}
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
            keyboardDismissMode="none"
            keyboardShouldPersistTaps="always"
            onScroll={handleScroll}
            onScrollEndDrag={maybeLoadOlder}
            onMomentumScrollEnd={maybeLoadOlder}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View
          style={[styles.overlay, { bottom: keyboardPadding }]}
          onLayout={handleOverlayLayout}
        >
          {!isDeleted && !initialLoading && !initialError ? (
            <ScrollView
              horizontal
              style={styles.quickList}
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quick}
            >
              {QUICK_MESSAGE_KEYS.map(key => (
                <Chip
                  key={key}
                  label={t(key)}
                  onPress={() => {
                    setDraft(t(key));
                    inputRef.current?.focus();
                  }}
                />
              ))}
            </ScrollView>
          ) : null}

          {isDeleted ? (
            <View style={styles.readOnlyComposer}>
              <Text style={styles.readOnlyText}>
                {t('thread.deletedReadonly')}
              </Text>
            </View>
          ) : (
            <View style={styles.compose}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={submit}
                placeholder={t('thread.placeholder')}
                placeholderTextColor={styles.colors.placeholder}
                multiline
                submitBehavior="submit"
                returnKeyType="send"
                textAlignVertical="center"
                maxLength={1000}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('thread.sendLabel')}
                disabled={!draft.trim()}
                onPress={submit}
                style={({ pressed }) => [
                  styles.send,
                  !draft.trim() && styles.sendDisabled,
                  pressed && styles.sendPressed,
                ]}
              >
                <Ionicons
                  name="arrow-up"
                  size={styles.iconSizes.send}
                  color={styles.colors.sendIcon}
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <ReviewModal
        visible={reviewVisible}
        recipientName={chat.name}
        isSubmitting={reviewSubmitting}
        error={reviewError}
        onClose={() => {
          setReviewVisible(false);
          setReviewError(null);
        }}
        onSubmit={submitReview}
      />
      <ReportModal {...report.modalProps} />
      {menuVisible ? (
        <>
          <Pressable
            accessibilityLabel={t('moderation.menuCancel')}
            onPress={() => setMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[styles.menu, { top: headerHeight + styles.menuOffset }]}
          >
            <ListRow
              label={t('moderation.viewProfile')}
              showChevron={false}
              onPress={runMenuAction(openContactProfile)}
            />
            <ListRow
              label={t('report.reportUser')}
              showChevron={false}
              onPress={runMenuAction(report.open)}
            />
            <ListRow
              danger
              label={t('moderation.blockAction')}
              showChevron={false}
              onPress={runMenuAction(confirmBlockContact)}
              isLast
            />
          </View>
        </>
      ) : null}
    </View>
  );
}
