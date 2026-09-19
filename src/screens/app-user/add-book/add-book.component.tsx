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
import {
  Button,
  Chip,
  Field,
  ScreenHeader,
  useCommonStyles,
} from 'shared/components/ui';
import { useAuth } from 'providers/auth/AuthProvider';
import { useAppStore } from 'store/AppStore';
import { getCityCenter, getUserLocation } from 'services/location';
import { getFriendlyErrorMessage } from 'services/moderation';
import {
  clearListingDraft,
  loadListingDraft,
  saveListingDraft,
} from 'services/storage/listingDraft';
import { BookImagesPicker } from './components/book-images-picker';
import { useStyles } from './add-book.styles';
import type { AddBookForm, AddBookScreenProps } from './add-book.types';

const CONDITIONS = ['Як нова', 'Добрий', 'Читана'];

const emptyForm: AddBookForm = {
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

const oneOf = (value: string | undefined, allowed: readonly string[]) =>
  value !== undefined && allowed.includes(value) ? value : undefined;

// The saved text of an unfinished listing, if there is one for this user.
function restoreForm(userId?: string): AddBookForm {
  const draft = userId ? loadListingDraft(userId) : null;

  if (!draft) {
    return emptyForm;
  }

  return {
    ...emptyForm,
    title: draft.title ?? '',
    author: draft.author ?? '',
    price: draft.price ?? '',
    about: draft.about ?? '',
    free: draft.free ?? false,
    city: draft.city ?? '',
    condition: oneOf(draft.condition, CONDITIONS) ?? emptyForm.condition,
    category: oneOf(draft.category, BOOK_CATEGORIES) ?? emptyForm.category,
    language: oneOf(draft.language, BOOK_LANGUAGES) ?? emptyForm.language,
  };
}

export function AddBookScreen({ navigation }: AddBookScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const common = useCommonStyles();
  const store = useAppStore();
  const { session, profile } = useAuth();
  const userId = session?.user.id;
  const [form, setForm] = useState<AddBookForm>(() => restoreForm(userId));
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  // A city that came back with the draft was typed by the user; keep it.
  const cityEdited = useRef(Boolean(form.city));

  useEffect(() => {
    if (userId) {
      saveListingDraft(userId, form);
    }
  }, [form, userId]);

  const set = <Key extends keyof AddBookForm>(
    key: Key,
    value: AddBookForm[Key],
  ) => setForm(current => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!cityEdited.current && profile?.city) {
      setForm(current => ({
        ...current,
        city: profile.city ?? '',
        latitude: profile.latitude,
        longitude: profile.longitude,
      }));
    }
  }, [profile?.city, profile?.latitude, profile?.longitude]);

  const detectCity = async () => {
    setIsLocating(true);
    setError('');
    try {
      const location = await getUserLocation();
      if (!location) {
        setError(t('listingForm.locationPermission'));
        return;
      }
      cityEdited.current = true;
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

  const publish = async () => {
    const price = Number(form.price.replace(',', '.'));
    if (!form.title.trim() || !form.author.trim() || !form.city.trim()) {
      setError(t('listingForm.requiredFields'));
      return;
    }
    if (!form.images.length) {
      setError(t('listingForm.addPhoto'));
      return;
    }
    if (
      !form.free &&
      (!form.price.trim() || !Number.isFinite(price) || price < 0)
    ) {
      setError(t('listingForm.priceError'));
      return;
    }

    setIsPublishing(true);
    setError('');
    try {
      const cityCenter = await getCityCenter(form.city);
      if (!cityCenter) {
        setError(t('listingForm.cityNotFound'));
        return;
      }

      await store.publish({
        ...form,
        latitude: cityCenter.latitude,
        longitude: cityCenter.longitude,
      });
      if (userId) {
        clearListingDraft(userId);
      }
      store.notify(t('listingForm.published'));
      cityEdited.current = false;
      setForm({
        ...emptyForm,
        city: profile?.city ?? '',
        latitude: profile?.latitude ?? null,
        longitude: profile?.longitude ?? null,
      });
      navigation.navigate('Feed');
    } catch (publishError) {
      setError(
        getFriendlyErrorMessage(publishError, t('listingForm.publishError')),
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('listingForm.newTitle')} />

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
        <Text style={common.subtitle}>{t('listingForm.newSubtitle')}</Text>
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
          {CONDITIONS.map(condition => (
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
          onChangeText={value => {
            cityEdited.current = true;
            setForm(current => ({
              ...current,
              city: value,
              latitude: null,
              longitude: null,
            }));
          }}
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
          label={isPublishing ? t('common.publishing') : t('common.publish')}
          disabled={isPublishing}
          onPress={publish}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}
