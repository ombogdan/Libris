import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookRow,
  Chip,
  Empty,
  ScreenHeader,
  useCommonStyles,
} from 'shared/components/ui';
import { useAppStore } from 'store/AppStore';
import { useAuth } from 'providers/auth/AuthProvider';
import { useTheme } from 'shared/theme';
import { useStyles } from './feed.styles';
import type { FeedScreenProps } from './feed.types';

export function FeedScreen({ navigation }: FeedScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const common = useCommonStyles();
  const { theme } = useTheme();
  const store = useAppStore();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Усі');
  const list = useMemo(
    () =>
      store.books.filter(book => {
        const normalizedQuery = query.toLowerCase();
        return (
          book.status !== 'hidden' &&
          (!normalizedQuery ||
            `${book.title} ${book.author} ${book.cat} ${book.city}`
              .toLowerCase()
              .includes(normalizedQuery)) &&
          (category === 'Усі' || category === 'Даром'
            ? category !== 'Даром' || book.price === 0
            : book.cat === category)
        );
      }),
    [store.books, query, category],
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Що поруч"
        right={<Chip label={profile?.city || 'Місто'} />}
      />

      <ScrollView
        contentContainerStyle={[common.page, styles.page]}
        refreshControl={
          <RefreshControl
            refreshing={store.booksLoading}
            onRefresh={store.reloadBooks}
          />
        }
      >
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Автор, назва, предмет…"
          placeholderTextColor={styles.colors.placeholder}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {['Усі', 'Підручники', 'Художня', 'Даром'].map(value => (
            <Chip
              key={value}
              label={value}
              active={category === value}
              onPress={() => setCategory(value)}
            />
          ))}
        </ScrollView>
        <Text style={common.mini}>
          {list.length} книг · сортування: найновіші
        </Text>
        {store.booksLoading && !store.books.length ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.palette.accent} />
          </View>
        ) : store.booksError ? (
          <Empty text={`Не вдалося завантажити книги: ${store.booksError}`} />
        ) : list.length ? (
          list.map(book => (
            <BookRow
              key={book.id}
              book={book}
              favorite={store.favs.includes(book.id)}
              onOpen={() =>
                navigation.getParent()?.navigate('Book', { bookId: book.id })
              }
              onHeart={() => store.toggleFav(book.id)}
            />
          ))
        ) : (
          <Empty text="Нічого не знайшлось. Спробуй іншу назву або скинь фільтр." />
        )}
      </ScrollView>
    </View>
  );
}
