import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Cover } from 'shared/components/ui';
import { useStyles } from './book-gallery.styles';
import type { BookGalleryProps } from './book-gallery.types';

export function BookGallery({ book }: BookGalleryProps) {
  const styles = useStyles();

  if (!book.imageUrls?.length) {
    return (
      <View style={styles.fallback}>
        <Cover book={book} big />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      snapToInterval={styles.snapInterval}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.gallery}
    >
      {book.imageUrls.map(url => (
        <Image
          key={url}
          source={{ uri: url }}
          style={styles.image}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}
