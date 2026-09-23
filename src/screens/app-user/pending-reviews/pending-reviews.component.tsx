import { t } from 'shared/localization/i18n';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Empty, ScreenHeader } from 'shared/components/ui';
import { usePendingReviews } from 'hooks/usePendingReviews';
import type { Chat } from 'shared/data';
import { ChatItem } from 'screens/app-user/chats/components/chat-item';
import { useStyles } from './pending-reviews.styles';
import type { PendingReviewsScreenProps } from './pending-reviews.types';

export function PendingReviewsScreen({
  navigation,
}: PendingReviewsScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { pendingChats, markAllSeen } = usePendingReviews();

  // Opening this screen is what clears the badge, whether or not a review
  // actually gets left here — that's the point, no nagging.
  useFocusEffect(
    useCallback(() => {
      markAllSeen();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingChats]),
  );

  const openChat = useCallback(
    (chat: Chat) => {
      navigation.navigate('Thread', { chatId: chat.id, openReview: true });
    },
    [navigation],
  );

  const renderChat = useCallback(
    ({ item }: { item: Chat }) => (
      <ChatItem chat={item} onPress={() => openChat(item)} />
    ),
    [openChat],
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={t('pendingReviews.title')}
        onBack={navigation.goBack}
      />
      <FlatList
        data={pendingChats}
        keyExtractor={chat => chat.id}
        renderItem={renderChat}
        contentContainerStyle={[
          styles.page,
          !pendingChats.length && styles.emptyPage,
        ]}
        ListHeaderComponent={
          pendingChats.length ? (
            <Text style={styles.subtitle}>{t('pendingReviews.subtitle')}</Text>
          ) : null
        }
        ListEmptyComponent={<Empty text={t('pendingReviews.empty')} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
