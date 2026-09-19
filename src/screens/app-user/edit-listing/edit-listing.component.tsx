import {
  BOOK_CATEGORIES,
  BOOK_LANGUAGES,
  t,
  translateCategory,
  translateCondition,
  translateLanguage,
} from 'shared/localization/i18n';
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
import { getFriendlyErrorMessage } from 'services/moderation';

const emptyForm: EditListingForm = {
  title: '',
  author: '',
  price: '',
  about: '',
  free: false,
  condition: 'Добрий',
  category: 'other',
  language: 'uk',
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
      category: book.cat,
      language: book.language ?? 'uk',
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
        setError(t('listingForm.locationPermission'));
        return;
      }
      setForm(current => ({
        ...current,
        city: location.city,
        latitude: null,
        longitude: null,
      }));
    } catch {
      setError(t('listingForm.locationError'));
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
      setError(t('listingForm.requiredFields'));
      return;
    }
    if (!form.images.length) {
      setError(t('listingForm.keepPhoto'));
      return;
    }
    if (
      !form.free &&
      (!form.price.trim() || !Number.isFinite(price) || price < 0)
    ) {
      setError(t('listingForm.priceError'));
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
          setError(t('listingForm.cityNotFound'));
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
          ? t('listingForm.cleanupWarning')
          : t('listingForm.updated'),
      );
      navigation.goBack();
    } catch (saveError) {
      setError(
        getFriendlyErrorMessage(saveError, t('listingForm.updateError')),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!book) {
    return (
      <View style={styles.screen}>
        <ScreenHeader
          title={t('listingForm.editTitle')}
          onBack={navigation.goBack}
        />
        <View style={styles.missing}>
          <Empty text={t('listingForm.missing')} />
          <Button label={t('common.back')} onPress={navigation.goBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={t('listingForm.editTitle')}
        onBack={navigation.goBack}
      />
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
        <Text style={common.subtitle}>{t('listingForm.editSubtitle')}</Text>
        <BookImagesPicker
          images={form.images}
          onChange={images => set('images', images)}
          onError={setError}
        />
        <Field
          compact
          label={t('listingForm.title')}
          value={form.title}
          onChangeText={value => set('title', value)}
        />
        <Field
          compact
          label={t('listingForm.author')}
          value={form.author}
          onChangeText={value => set('author', value)}
        />
        <Text style={styles.label}>{t('listingForm.price')}</Text>
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
            label={t('listingForm.giveAway')}
            active={form.free}
            onPress={() => set('free', !form.free)}
          />
        </View>
        <Text style={styles.label}>{t('listingForm.condition')}</Text>
        <View style={styles.chips}>
          {['Як нова', 'Добрий', 'Читана'].map(condition => (
            <Chip
              key={condition}
              label={translateCondition(condition)}
              active={form.condition === condition}
              onPress={() => set('condition', condition)}
            />
          ))}
        </View>
        <Text style={styles.label}>{t('listingForm.category')}</Text>
        <View style={styles.chips}>
          {BOOK_CATEGORIES.map(category => (
            <Chip
              key={category}
              label={translateCategory(category)}
              active={form.category === category}
              onPress={() => set('category', category)}
            />
          ))}
        </View>
        <Text style={styles.label}>{t('listingForm.language')}</Text>
        <View style={styles.chips}>
          {BOOK_LANGUAGES.map(language => (
            <Chip
              key={language}
              label={translateLanguage(language)}
              active={form.language === language}
              onPress={() => set('language', language)}
            />
          ))}
        </View>
        <View style={styles.cityHeading}>
          <Text style={styles.label}>{t('listingForm.city')}</Text>
          <Chip
            label={
              isLocating
                ? t('listingForm.detecting')
                : t('listingForm.detectNow')
            }
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
          placeholder={t('listingForm.cityPlaceholder')}
          placeholderTextColor={styles.colors.placeholder}
        />
        <Text style={styles.label}>{t('listingForm.about')}</Text>
        <TextInput
          multiline
          style={[styles.input, styles.textarea]}
          value={form.about}
          onChangeText={value => set('about', value)}
          placeholder={t('listingForm.aboutPlaceholder')}
          placeholderTextColor={styles.colors.placeholder}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={isSaving ? t('common.saving') : t('listingForm.saveChanges')}
          disabled={isSaving}
          onPress={save}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}
