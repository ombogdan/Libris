import {
  formatDate,
  formatReviewsCount,
  t,
  translateCategory,
  translateCondition,
  translateLanguage,
} from 'shared/localization/i18n';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Button,
  Chip,
  Empty,
  PricePill,
  ScreenHeader,
  useCommonStyles,
} from 'shared/components/ui';
import { ListRow } from 'shared/components/list-row';
import { ReportModal, useReportFlow } from 'shared/components/report-modal';
import { useAuth } from 'providers/auth/AuthProvider';
import { publicLinks } from 'configs/publicLinks';
import { fetchPublicBookListing, incrementListingView } from 'services/books';
import type { Book } from 'shared/data';
import { useTheme } from 'shared/theme';
import { useAppStore } from 'store/AppStore';
import { BookGallery } from './components/book-gallery';
import { SafetyTip } from './components/safety-tip';
import { SimilarBooks } from './components/similar-books';
import { useStyles } from './book.styles';
import type { BookScreenProps } from './book.types';

export function BookScreen({ navigation, route }: BookScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const common = useCommonStyles();
  const { theme } = useTheme();
  const store = useAppStore();
  const { session } = useAuth();
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const storedBook = store.books.find(item => item.id === route.params.bookId);
  const [linkedBook, setLinkedBook] = useState<Book | null>(null);
  const [bookLoading, setBookLoading] = useState(!storedBook);
  const [bookLoadError, setBookLoadError] = useState(false);
  const book = storedBook ?? linkedBook;
  const isOwnListing = book?.sellerId === session?.user.id;
  const report = useReportFlow({ listingId: book?.id });

  const loadLinkedBook = useCallback(async () => {
    if (storedBook) {
      setLinkedBook(null);
      setBookLoading(false);
      setBookLoadError(false);
      return;
    }

    setBookLoading(true);
    setBookLoadError(false);
    try {
      setLinkedBook(await fetchPublicBookListing(route.params.bookId));
    } catch {
      setBookLoadError(true);
    } finally {
      setBookLoading(false);
    }
  }, [route.params.bookId, storedBook]);

  useEffect(() => {
    void loadLinkedBook();
  }, [loadLinkedBook]);

  useEffect(() => {
    if (book?.id && !isOwnListing) {
      void incrementListingView(book.id).catch(() => undefined);
    }
  }, [book?.id, isOwnListing]);

  const shareBook = async () => {
    if (!book) {
      return;
    }

    const url = publicLinks.book(book.id);
    try {
      await Share.share({
        message: t('book.shareMessage', { title: book.title, url }),
        url,
      });
    } catch {
      store.notify(t('book.shareError'));
    }
  };

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

  if (!book && bookLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={t('book.title')} onBack={navigation.goBack} />
        <View style={styles.missing}>
          <ActivityIndicator size="large" color={theme.palette.accent} />
          <Text style={styles.stateText}>{t('book.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={t('book.title')} onBack={navigation.goBack} />
        <View style={styles.missing}>
          <Empty
            text={
              bookLoadError ? t('book.loadError') : t('listingForm.missing')
            }
          />
          <Button
            label={bookLoadError ? t('common.retry') : t('common.back')}
            onPress={
              bookLoadError ? () => void loadLinkedBook() : navigation.goBack
            }
          />
        </View>
      </View>
    );
  }

  const details = [
    [t('book.details.category'), translateCategory(book.cat)],
    [
      t('book.details.language'),
      book.language ? translateLanguage(book.language) : '',
    ],
    [
      t('book.details.published'),
      book.createdAt ? formatDate(book.createdAt) : '',
    ],
  ].filter(([, value]) => value);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={t('book.title')}
        onBack={navigation.goBack}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => void shareBook()}
            style={({ pressed }) => [
              styles.shareAction,
              pressed && styles.shareActionPressed,
            ]}
          >
            <Text style={styles.shareActionText}>{t('book.share')}</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={[common.page, styles.page]}>
        <BookGallery book={book} />
        <View style={common.inline}>
          <PricePill value={book.price} />
          <Chip label={translateCondition(book.condition)} />
        </View>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <Text style={common.body}>{book.about}</Text>
        {details.length ? (
          <View style={styles.details}>
            {details.map(([label, value], index) => (
              <ListRow
                key={label}
                label={label}
                value={value}
                isLast={index === details.length - 1}
              />
            ))}
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={!book.sellerId}
          onPress={() => {
            if (book.sellerId) {
              navigation.navigate('UserProfile', {
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
            {book.sellerAvatarUrl ? (
              <Image
                source={{ uri: book.sellerAvatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{book.seller[0]}</Text>
            )}
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
          <Ionicons
            name="chevron-forward"
            size={styles.iconSizes.sellerArrow}
            color={styles.colors.sellerArrow}
          />
        </Pressable>
        {!isOwnListing ? <SafetyTip city={book.city} /> : null}
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
        <SimilarBooks
          book={book}
          books={store.books}
          excludeSellerId={session?.user.id}
          onOpen={bookId => navigation.push('Book', { bookId })}
        />
        {!isOwnListing ? (
          <Pressable
            accessibilityRole="button"
            style={styles.reportLink}
            onPress={report.open}
          >
            <Text style={styles.reportLinkText}>
              {t('report.reportListing')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <ReportModal {...report.modalProps} />
    </View>
  );
}
