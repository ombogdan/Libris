import React from 'react';
import { ScrollView } from 'react-native';
import { BookRow, Button, Empty, ScreenTitle } from '../../components/ui';
import { useAppStore } from '../../store/AppStore';
import { useStyles } from './favorites.styles';
import type { FavoritesScreenProps } from './favorites.types';

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const styles = useStyles();
  const store = useAppStore();
  const list = store.books.filter(book => store.favs.includes(book.id));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <ScreenTitle>Обране</ScreenTitle>
      {list.length ? (
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
  );
}
