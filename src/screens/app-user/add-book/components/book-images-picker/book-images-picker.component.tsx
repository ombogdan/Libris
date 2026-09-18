import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useCommonStyles } from '../../../../components/ui';
import { useStyles } from './book-images-picker.styles';
import type { BookImagesPickerProps } from './book-images-picker.types';

export function BookImagesPicker({
  images,
  onChange,
  onError,
}: BookImagesPickerProps) {
  const styles = useStyles();
  const common = useCommonStyles();

  const selectImages = async () => {
    const available = 5 - images.length;
    if (!available) {
      return;
    }

    onError('');
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: available,
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8,
      assetRepresentationMode: 'compatible',
    });

    if (result.didCancel) {
      return;
    }
    if (result.errorCode) {
      onError(
        result.errorCode === 'permission'
          ? 'Дозволь доступ до фото в налаштуваннях пристрою.'
          : 'Не вдалося відкрити галерею.',
      );
      return;
    }

    const selected = (result.assets ?? [])
      .filter(asset => asset.uri)
      .map((asset, index) => ({
        uri: asset.uri!,
        type: asset.type || 'image/jpeg',
        fileName: asset.fileName || `book-${Date.now()}-${index}.jpg`,
      }));
    const known = new Set(images.map(image => image.uri));
    onChange(
      [...images, ...selected.filter(image => !known.has(image.uri))].slice(
        0,
        5,
      ),
    );
  };

  return (
    <>
      <View style={styles.heading}>
        <Text style={styles.label}>Фото книги</Text>
        <Text style={common.mini}>{images.length}/5</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photos}
      >
        {images.map((image, index) => (
          <View key={image.uri} style={styles.preview}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            {index === 0 ? (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>Обкладинка</Text>
              </View>
            ) : null}
            <Pressable
              hitSlop={styles.hitSlop}
              onPress={() =>
                onChange(images.filter(item => item.uri !== image.uri))
              }
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </View>
        ))}
        {images.length < 5 ? (
          <Pressable onPress={selectImages} style={styles.addButton}>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.addText}>
              {images.length ? 'додати ще' : 'обрати з галереї'}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </>
  );
}
