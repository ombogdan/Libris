import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { t } from 'shared/localization/i18n';
import { useStyles } from './photo-viewer.styles';
import type { PhotoViewerProps } from './photo-viewer.types';

// Mounted only while the viewer is open, so the counter starts on the photo
// that was tapped.
function PhotoPages({
  images,
  initialIndex,
  onClose,
}: Omit<PhotoViewerProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const styles = useStyles({ topInset: insets.top });
  const firstIndex = Math.max(
    0,
    Math.min(initialIndex ?? 0, images.length - 1),
  );
  const [index, setIndex] = useState(firstIndex);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.min(Math.max(page, 0), images.length - 1));
  };

  return (
    <View style={styles.root}>
      <FlatList
        horizontal
        pagingEnabled
        data={images}
        keyExtractor={(url, position) => `${position}-${url}`}
        initialScrollIndex={firstIndex}
        getItemLayout={(_, position) => ({
          length: width,
          offset: width * position,
          index: position,
        })}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image
              source={{ uri: item }}
              resizeMode="contain"
              style={styles.image}
            />
          </View>
        )}
      />

      <View pointerEvents="box-none" style={styles.topBar}>
        {images.length > 1 ? (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {index + 1} / {images.length}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          hitSlop={styles.hitSlop}
          onPress={onClose}
          style={({ pressed }) => [
            styles.close,
            pressed && styles.closePressed,
          ]}
        >
          <Ionicons name="close" size={styles.closeIconSize} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

export function PhotoViewer({
  visible,
  images,
  initialIndex,
  onClose,
}: PhotoViewerProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {visible && images.length ? (
        <PhotoPages
          images={images}
          initialIndex={initialIndex}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}
