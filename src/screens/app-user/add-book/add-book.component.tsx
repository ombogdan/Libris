import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import {
  Button,
  Chip,
  Field,
  ScreenTitle,
  useCommonStyles,
} from '../../components/ui';
import { useAuth } from '../../auth/AuthProvider';
import { useAppStore } from '../../store/AppStore';
import { getCityCenter, getUserLocation } from '../../services/location';
import { BookImagesPicker } from './components/book-images-picker';
import { useStyles } from './add-book.styles';
import type { AddBookForm, AddBookScreenProps } from './add-book.types';

const emptyForm: AddBookForm = {
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

export function AddBookScreen({ navigation }: AddBookScreenProps) {
  const styles = useStyles();
  const common = useCommonStyles();
  const store = useAppStore();
  const { profile } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const cityEdited = useRef(false);

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
        setError('Дозволь доступ до геолокації або введи місто вручну.');
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
      setError('Не вдалося визначити місто. Введи його вручну.');
    } finally {
      setIsLocating(false);
    }
  };

  const publish = async () => {
    const price = Number(form.price.replace(',', '.'));
    if (!form.title.trim() || !form.author.trim() || !form.city.trim()) {
      setError('Заповни назву, автора та місто.');
      return;
    }
    if (!form.images.length) {
      setError('Додай хоча б одне фото книги.');
      return;
    }
    if (
      !form.free &&
      (!form.price.trim() || !Number.isFinite(price) || price < 0)
    ) {
      setError('Вкажи коректну ціну або обери «Віддам даром».');
      return;
    }

    setIsPublishing(true);
    setError('');
    try {
      const cityCenter = await getCityCenter(form.city);
      if (!cityCenter) {
        setError('Не вдалося знайти це місто. Перевір назву.');
        return;
      }

      await store.publish({
        ...form,
        latitude: cityCenter.latitude,
        longitude: cityCenter.longitude,
      });
      store.notify('Оголошення опубліковано');
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
        publishError &&
          typeof publishError === 'object' &&
          'message' in publishError
          ? String(publishError.message)
          : 'Не вдалося опублікувати книгу.',
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={common.page}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenTitle>Нова книга</ScreenTitle>
      <Text style={common.subtitle}>
        Заповни дані — і оголошення з’явиться у стрічці.
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
          style={[styles.input, styles.grow, form.free && styles.disabledInput]}
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
        onChangeText={value => {
          cityEdited.current = true;
          setForm(current => ({
            ...current,
            city: value,
            latitude: null,
            longitude: null,
          }));
        }}
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
        label={isPublishing ? 'Публікуємо…' : 'Опублікувати'}
        disabled={isPublishing}
        onPress={publish}
      />
    </ScrollView>
  );
}
