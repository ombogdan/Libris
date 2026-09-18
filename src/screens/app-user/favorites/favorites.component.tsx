import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookRow, Button, Empty, ScreenHeader } from 'shared/components/ui';
import { useTheme } from 'shared/theme';
import { useAppStore } from 'store/AppStore';
import { useStyles } from './favorites.styles';
import type { FavoritesScreenProps } from './favorites.types';

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
  const store = useAppStore();
  const list = store.books.filter(book => store.favs.includes(book.id));

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Обране" />

      <ScrollView
        contentContainerStyle={styles.page}
        refreshControl={
          <RefreshControl
            refreshing={store.favoritesLoading}
            onRefresh={store.reloadFavorites}
          />
        }
      >
        {store.favoritesLoading && !store.favs.length ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.palette.accent} />
          </View>
        ) : store.favoritesError && !store.favs.length ? (
          <>
            <Empty text="Не вдалося завантажити обране." />
            <Button
              secondary
              label="Спробувати ще раз"
              onPress={store.reloadFavorites}
            />
          </>
        ) : list.length ? (
          list.map(book => (
            <BookRow
              key={book.id}
              book={book}
              favorite
              onOpen={() =>
                navigation.getParent()?.navigate('Book', { bookId: book.id })
              }
              onHeart={() => store.toggleFav(book.id)}
            />
          ))
        ) : (
          <>
            <Empty text="Тут будуть книги, які ти вподобаєш у стрічці." />
            <Button
              secondary
              label="До стрічки"
              onPress={() => navigation.navigate('Feed')}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
