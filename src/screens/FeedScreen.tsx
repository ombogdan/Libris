import React, { useMemo, useState } from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { TabParamList } from '../navigation/types';
import { BookRow, Chip, common, Empty, ScreenTitle } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
export function FeedScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, 'Feed'>) {
  const x = useAppStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Усі');
  const list = useMemo(
    () =>
      x.books.filter(b => {
        const q = query.toLowerCase();
        return (
          (!q || `${b.title} ${b.author} ${b.cat}`.toLowerCase().includes(q)) &&
          (cat === 'Усі' || cat === 'Даром'
            ? cat !== 'Даром' || b.price === 0
            : b.cat === cat)
        );
      }),
    [x.books, query, cat],
  );
  return (
    <ScrollView contentContainerStyle={common.page}>
      <ScreenTitle right={<Chip label={x.city} />}>Що поруч</ScreenTitle>
      <TextInput
        style={s.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Автор, назва, предмет…"
        placeholderTextColor={c.n500}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        {['Усі', 'Підручники', 'Художня', 'Даром'].map(v => (
          <Chip
            key={v}
            label={v}
            active={cat === v}
            onPress={() => setCat(v)}
          />
        ))}
      </ScrollView>
      <Text style={common.mini}>
        {list.length} книг · сортування: найновіші
      </Text>
      {list.length ? (
        list.map(b => (
          <BookRow
            key={b.id}
            book={b}
            favorite={x.favs.includes(b.id)}
            onOpen={() => navigation.getParent()?.navigate('Book', { bookId: b.id })}
            onHeart={() => x.toggleFav(b.id)}
          />
        ))
      ) : (
        <Empty text="Нічого не знайшлось. Спробуй іншу назву або скинь фільтр." />
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  search: {
    height: 48,
    borderRadius: 999,
    backgroundColor: c.surface,
    paddingHorizontal: 17,
    fontSize: 14.5,
    color: c.text,
    borderWidth: 1,
    borderColor: c.divider,
  },
  chips: { gap: 8 },
});
