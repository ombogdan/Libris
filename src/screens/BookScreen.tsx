import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { Button, Chip, common, Cover, PricePill } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
export function BookScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Book'>) {
  const x = useAppStore();
  const book = x.books.find(v => v.id === route.params.bookId)!;
  return (
    <ScrollView contentContainerStyle={common.page}>
      <Pressable onPress={navigation.goBack}>
        <Text style={common.back}>← Назад</Text>
      </Pressable>
      <View style={s.cover}>
        <Cover book={book} big />
      </View>
      <View style={common.inline}>
        <PricePill value={book.price} />
        <Chip label={book.condition} />
      </View>
      <Text style={s.title}>{book.title}</Text>
      <Text style={s.by}>
        {book.author} · {book.year}
      </Text>
      <Text style={common.body}>{book.about}</Text>
      <View style={s.seller}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{book.seller[0]}</Text>
        </View>
        <View>
          <Text style={s.name}>{book.seller}</Text>
          <Text style={common.meta}>
            ★ {book.rating} · {book.city} · {book.sellerAds}
          </Text>
        </View>
      </View>
      <Button
        label="Написати продавцю"
        onPress={() => {
          const chat = x.openSellerChat(book);
          navigation.navigate('Thread', { chatId: chat.id });
        }}
      />
      <Button
        secondary
        label={
          x.favs.includes(book.id) ? '♥  В обраному' : '♡  Додати в обране'
        }
        onPress={() => x.toggleFav(book.id)}
      />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  cover: { alignItems: 'center' },
  title: {
    fontSize: 28,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: c.text,
  },
  by: { fontSize: 14, color: c.n600 },
  seller: {
    backgroundColor: c.surface,
    borderRadius: 28,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: c.violet300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: c.violet800 },
  name: { fontSize: 16, fontWeight: '800', color: c.text },
});
