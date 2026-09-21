import { t } from 'shared/localization/i18n';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCommonStyles } from 'shared/components/ui';
import type { LocalBookImage } from 'services/books';
import { useStyles } from './book-images-picker.styles';
import type { BookImagesPickerProps } from './book-images-picker.types';

function normalizeImage(asset: Asset, index: number): LocalBookImage | null {
  if (!asset.uri) {
    return null;
  }

  const originalName = asset.fileName || `book-${Date.now()}-${index}.jpg`;
  const originalType = asset.type?.toLowerCase() || '';
  const extension = originalName.split('.').pop()?.toLowerCase();
  const isHeic =
    originalType === 'image/heic' ||
    originalType === 'image/heif' ||
    extension === 'heic' ||
    extension === 'heif';
  const inferredType =
    extension === 'png'
      ? 'image/png'
      : extension === 'webp'
      ? 'image/webp'
      : extension === 'jpg' || extension === 'jpeg'
      ? 'image/jpeg'
      : '';
  const type = isHeic
    ? 'image/jpeg'
    : originalType === 'image/jpg'
    ? 'image/jpeg'
    : originalType || inferredType || 'application/octet-stream';
  const fileName = isHeic
    ? originalName.replace(/\.(heic|heif)$/i, '.jpg')
    : originalName;

  return {
    uri: asset.uri,
    type,
    fileName,
  };
}

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
          ? t('images.permissionError')
          : t('images.galleryError'),
      );
      return;
    }

    const assets = result.assets ?? [];
    const selected = assets
      .map(normalizeImage)
      .filter((image): image is LocalBookImage => image !== null);
    if (selected.length !== assets.length) {
      onError(t('images.selectionError'));
    }
    if (!selected.length) {
      return;
    }
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
        <Text style={styles.label}>{t('images.title')}</Text>
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
                <Text style={styles.coverBadgeText}>{t('images.cover')}</Text>
              </View>
            ) : null}
            <Pressable
              hitSlop={styles.hitSlop}
              onPress={() =>
                onChange(images.filter(item => item.uri !== image.uri))
              }
              style={styles.removeButton}
            >
              <Ionicons
                name="close"
                size={styles.iconSizes.remove}
                color={styles.colors.removeIcon}
              />
            </Pressable>
          </View>
        ))}
        {images.length < 5 ? (
          <Pressable onPress={selectImages} style={styles.addButton}>
            <Ionicons
              name="add"
              size={styles.iconSizes.add}
              color={styles.colors.addIcon}
            />
            <Text style={styles.addText}>
              {images.length ? t('images.addMore') : t('images.choose')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </>
  );
}
