import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookImagesPicker } from 'screens/app-user/add-book/components/book-images-picker';
import {
  Button,
  Chip,
  Empty,
  Field,
  ScreenHeader,
  useCommonStyles,
} from 'shared/components/ui';
import { getCityCenter, getUserLocation } from 'services/location';
import { useAppStore } from 'store/AppStore';
import { useStyles } from './edit-listing.styles';
import type {
  EditListingForm,
  EditListingScreenProps,
} from './edit-listing.types';

const emptyForm: EditListingForm = {
  title: '',
  author: '',
  price: '',
  about: '',
  free: false,
  condition: 'Добрий',
  city: '',
  latitude: null,
  longitude: null,
  images: [],
};

export function EditListingScreen({
  navigation,
  route,
}: EditListingScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const common = useCommonStyles();
  const store = useAppStore();
  const book = store.books.find(item => item.id === route.params.bookId);
  const initializedBookId = useRef<string | null>(null);
  const [form, setForm] = useState<EditListingForm>(emptyForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!book || initializedBookId.current === book.id) {
      return;
    }

    initializedBookId.current = book.id;
    setForm({
      title: book.title,
      author: book.author,
      price: book.price ? String(book.price) : '',
      about: book.about,
      free: book.price === 0,
      condition: book.condition,
      city: book.city,
      latitude: book.latitude ?? null,
      longitude: book.longitude ?? null,
      images: (book.imageUrls ?? []).map((uri, index) => ({
        uri,
        type: 'image/remote',
        fileName: `existing-book-${index + 1}`,
      })),
    });
  }, [book]);

  const set = <Key extends keyof EditListingForm>(
    key: Key,
    value: EditListingForm[Key],
  ) => setForm(current => ({ ...current, [key]: value }));

  const detectCity = async () => {
    setIsLocating(true);
    setError('');
    try {
      const location = await getUserLocation();
      if (!location) {
        setError('Дозволь доступ до геолокації або введи місто вручну.');
        return;
      }
      setForm(current => ({
        ...current,
        city: location.city,
        latitude: null,
        longitude: null,
      }));
    } catch {
      setError('Не вдалося визначити місто. Введи його вручну.');
    } finally {
      setIsLocating(false);
    }
  };

  const save = async () => {
    if (!book || isSaving) {
      return;
    }

    const price = Number(form.price.replace(',', '.'));
    if (!form.title.trim() || !form.author.trim() || !form.city.trim()) {
      setError('Заповни назву, автора та місто.');
      return;
    }
    if (!form.images.length) {
      setError('Залиши хоча б одне фото книги.');
      return;
    }
    if (
      !form.free &&
      (!form.price.trim() || !Number.isFinite(price) || price < 0)
    ) {
      setError('Вкажи коректну ціну або обери «Віддам даром».');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      let latitude = form.latitude;
      let longitude = form.longitude;
      if (latitude === null || longitude === null) {
        const cityCenter = await getCityCenter(form.city);
        if (!cityCenter) {
          setError('Не вдалося знайти це місто. Перевір назву.');
          return;
        }
        latitude = cityCenter.latitude;
        longitude = cityCenter.longitude;
      }

      const originalImageUrls = new Set(book.imageUrls ?? []);
      const retainedImageUrls = form.images
        .map(image => image.uri)
        .filter(uri => originalImageUrls.has(uri));
      const newImages = form.images.filter(
        image => !originalImageUrls.has(image.uri),
      );

      const result = await store.updateListing(book.id, {
        ...form,
        latitude,
        longitude,
        retainedImageUrls,
        newImages,
      });
      store.notify(
        result.imageCleanupFailed
          ? 'Дані збережено, але старі фото не вдалося видалити'
          : 'Оголошення оновлено',
      );
      navigation.goBack();
    } catch (saveError) {
      setError(
        saveError && typeof saveError === 'object' && 'message' in saveError
          ? String(saveError.message)
          : 'Не вдалося оновити оголошення.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!book) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Редагування" onBack={navigation.goBack} />
        <View style={styles.missing}>
          <Empty text="Це оголошення більше недоступне." />
          <Button label="Назад" onPress={navigation.goBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Редагування" onBack={navigation.goBack} />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[common.page, styles.page]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableResetScrollToCoords={false}
        extraScrollHeight={styles.keyboardExtraScrollHeight}
        keyboardOpeningTime={0}
        showsVerticalScrollIndicator={false}
      >
        <Text style={common.subtitle}>
          Зміни дані оголошення або онови фотографії книги.
        </Text>
        <BookImagesPicker
          images={form.images}
          onChange={images => set('images', images)}
          onError={setError}
        />
        <Field
          compact
          label="Назва"
          value={form.title}
          onChangeText={value => set('title', value)}
        />
        <Field
          compact
          label="Автор"
          value={form.author}
          onChangeText={value => set('author', value)}
        />
        <Text style={styles.label}>Ціна</Text>
        <View style={common.inline}>
          <TextInput
            editable={!form.free}
            keyboardType="numeric"
            style={[
              styles.input,
              styles.grow,
              form.free && styles.disabledInput,
            ]}
            value={form.price}
            onChangeText={value => set('price', value)}
            placeholder="220 ₴"
            placeholderTextColor={styles.colors.placeholder}
          />
          <Chip
            label="Віддам даром"
            active={form.free}
            onPress={() => set('free', !form.free)}
          />
        </View>
        <Text style={styles.label}>Стан</Text>
        <View style={styles.chips}>
          {['Як нова', 'Добрий', 'Читана'].map(condition => (
            <Chip
              key={condition}
              label={condition}
              active={form.condition === condition}
              onPress={() => set('condition', condition)}
            />
          ))}
        </View>
        <View style={styles.cityHeading}>
          <Text style={styles.label}>Місто</Text>
          <Chip
            label={isLocating ? 'Визначаємо…' : 'Визначити зараз'}
            onPress={isLocating ? undefined : detectCity}
          />
        </View>
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={value =>
            setForm(current => ({
              ...current,
              city: value,
              latitude: null,
              longitude: null,
            }))
          }
          placeholder="Наприклад, Полтава"
          placeholderTextColor={styles.colors.placeholder}
        />
        <Text style={styles.label}>Коротко про книгу</Text>
        <TextInput
          multiline
          style={[styles.input, styles.textarea]}
          value={form.about}
          onChangeText={value => set('about', value)}
          placeholder="Читала один раз, обкладинка як нова."
          placeholderTextColor={styles.colors.placeholder}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={isSaving ? 'Зберігаємо…' : 'Зберегти зміни'}
          disabled={isSaving}
          onPress={save}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}
