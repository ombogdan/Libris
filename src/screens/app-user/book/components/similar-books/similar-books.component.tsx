import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Cover, PricePill } from 'shared/components/ui';
import { t } from 'shared/localization/i18n';
import { useStyles } from './similar-books.styles';
import type { SimilarBooksProps } from './similar-books.types';
import { findSimilarBooks } from './similar-books.utils';

export function SimilarBooks({
  book,
  books,
  excludeSellerId,
  onOpen,
}: SimilarBooksProps) {
  const styles = useStyles();
  const similarBooks = useMemo(
    () => findSimilarBooks(book, books, { excludeSellerId }),
    [book, books, excludeSellerId],
  );

  if (!similarBooks.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('book.similar')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.list}
      >
        {similarBooks.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onOpen(item.id)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Cover book={item} style={styles.cover} />
            <Text numberOfLines={2} style={styles.bookTitle}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={styles.author}>
              {item.author}
            </Text>
            <View style={styles.footer}>
              <PricePill value={item.price} />
              <Text numberOfLines={1} style={styles.city}>
                {item.city}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
