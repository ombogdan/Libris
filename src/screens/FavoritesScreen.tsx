import React from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScrollView } from 'react-native';
import { TabParamList } from '../navigation/types';
import { BookRow, Button, common, Empty, ScreenTitle } from '../components/ui';
import { useAppStore } from '../store/AppStore';
export function FavoritesScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, 'Favorites'>) {
  const x = useAppStore();
  const list = x.books.filter(b => x.favs.includes(b.id));
  return (
    <ScrollView contentContainerStyle={common.page}>
      <ScreenTitle>Обране</ScreenTitle>
      {list.length ? (
        list.map(b => (
          <BookRow
            key={b.id}
            book={b}
            favorite
            onOpen={() => navigation.getParent()?.navigate('Book', { bookId: b.id })}
            onHeart={() => x.toggleFav(b.id)}
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
