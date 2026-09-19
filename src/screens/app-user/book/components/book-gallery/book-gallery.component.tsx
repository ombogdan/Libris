import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { PhotoViewer } from 'shared/components/photo-viewer';
import { Cover } from 'shared/components/ui';
import { useStyles } from './book-gallery.styles';
import type { BookGalleryProps } from './book-gallery.types';

export function BookGallery({ book }: BookGalleryProps) {
  const styles = useStyles();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (!book.imageUrls?.length) {
    return (
      <View style={styles.fallback}>
        <Cover book={book} big />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        horizontal
        snapToInterval={styles.snapInterval}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {book.imageUrls.map((url, index) => (
          <Pressable
            key={url}
            accessibilityRole="imagebutton"
            onPress={() => setViewerIndex(index)}
          >
            <Image
              source={{ uri: url }}
              style={styles.image}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
      <PhotoViewer
        visible={viewerIndex !== null}
        images={book.imageUrls}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}
