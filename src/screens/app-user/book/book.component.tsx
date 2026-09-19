import { formatReviewsCount, t, translateCondition } from 'shared/localization/i18n';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Chip,
  Empty,
  PricePill,
  ScreenHeader,
  useCommonStyles,
} from 'shared/components/ui';
import { useAuth } from 'providers/auth/AuthProvider';
import { useAppStore } from 'store/AppStore';
import { BookGallery } from './components/book-gallery';
import { useStyles } from './book.styles';
import type { BookScreenProps } from './book.types';

export function BookScreen({ navigation, route }: BookScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const common = useCommonStyles();
  const store = useAppStore();
  const { session } = useAuth();
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const book = store.books.find(item => item.id === route.params.bookId);
  const isOwnListing = book?.sellerId === session?.user.id;

  const openChat = async () => {
    if (!book || isOpeningChat || isOwnListing) {
      return;
    }

    setIsOpeningChat(true);
    try {
      const chat = await store.openSellerChat(book);
      navigation.navigate('Thread', { chatId: chat.id });
    } catch (error) {
      store.notify(
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : t('book.openChatError'),
      );
    } finally {
      setIsOpeningChat(false);
    }
  };

  if (!book) {
    return (
      <View style={styles.missing}>
        <Empty text={t('listingForm.missing')} />
        <Button label={t('common.back')} onPress={navigation.goBack} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('book.title')} onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={[common.page, styles.page]}>
        <BookGallery book={book} />
        <View style={common.inline}>
          <PricePill value={book.price} />
          <Chip label={translateCondition(book.condition)} />
        </View>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <Text style={common.body}>{book.about}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={!book.sellerId}
          onPress={() => {
            if (book.sellerId) {
              navigation.navigate('UserReviews', {
                userId: book.sellerId,
                displayName: book.seller,
              });
            }
          }}
          style={({ pressed }) => [
            styles.seller,
            pressed && styles.sellerPressed,
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{book.seller[0]}</Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{book.seller}</Text>
            <Text style={common.meta}>
              ★ {book.rating} ·{' '}
              {book.reviewsCount
                ? formatReviewsCount(book.reviewsCount)
                : t('book.noReviews')}
            </Text>
            <Text style={common.meta}>
              {book.city} · {book.sellerAds}
            </Text>
          </View>
          <Text style={styles.sellerArrow}>›</Text>
        </Pressable>
        <Button
          label={
            isOwnListing
              ? t('book.ownListing')
              : isOpeningChat
              ? t('book.openingChat')
              : t('book.messageSeller')
          }
          disabled={isOpeningChat || isOwnListing}
          onPress={openChat}
        />
        <Button
          secondary
          label={
            store.favs.includes(book.id)
              ? t('favorites.saved')
              : t('favorites.add')
          }
          onPress={() => store.toggleFav(book.id)}
        />
      </ScrollView>
    </View>
  );
}
