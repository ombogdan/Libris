import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from 'providers/auth/AuthProvider';
import { Button, ScreenHeader } from 'shared/components/ui';
import { signOutFromGoogle } from 'services/auth';
import { getCityCenter } from 'services/location';
import { useAppStore } from 'store/AppStore';
import { ProfileEditModal } from './components/profile-edit-modal';
import type { EditableProfileField } from './components/profile-edit-modal';
import { ProfileMetric } from './components/profile-metric';
import { ProfileRow } from './components/profile-row';
import { useStyles } from './profile.styles';
import type { ProfileScreenProps } from './profile.types';

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const app = useAppStore();
  const { session, profile, profileError, updateProfile } = useAuth();
  const [editingField, setEditingField] = useState<EditableProfileField | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const name =
    profile?.display_name.trim() ||
    session?.user.email?.split('@')[0] ||
    'Користувач';
  const city = profile?.city?.trim() || 'Не вказано';
  const phone = profile?.phone || 'Не вказано';
  const email = profile?.email || session?.user.email || '';
  const createdYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;
  const activeListings = app.ads.filter(ad => ad.status === 'Активне').length;
  const soldListings = app.ads.filter(ad => ad.status === 'Продано').length;
  const meta = [city, email, createdYear ? `з ${createdYear}` : '']
    .filter(Boolean)
    .join(' · ');

  const editValue = useMemo(() => {
    if (editingField === 'display_name') {
      return profile?.display_name || '';
    }
    if (editingField === 'city') {
      return profile?.city || '';
    }
    if (editingField === 'phone') {
      return profile?.phone || '+380';
    }
    return '';
  }, [editingField, profile?.city, profile?.display_name, profile?.phone]);

  const openEditor = (field: EditableProfileField) => {
    setEditError('');
    setEditingField(field);
  };

  const closeEditor = () => {
    if (!isSaving) {
      setEditError('');
      setEditingField(null);
    }
  };

  const saveField = async (value: string) => {
    if (!editingField) {
      return;
    }

    const trimmedValue = value.trim();
    setEditError('');
    setIsSaving(true);

    try {
      if (editingField === 'display_name') {
        if (trimmedValue.length < 2) {
          throw new Error('Ім’я має містити щонайменше 2 символи.');
        }
        await updateProfile({ display_name: trimmedValue });
      }

      if (editingField === 'phone') {
        const digits = trimmedValue.replace(/\D/g, '');
        if (digits.length !== 12 || !digits.startsWith('380')) {
          throw new Error('Вкажи номер у форматі +380XXXXXXXXX.');
        }
        await updateProfile({ phone: `+${digits}` });
      }

      if (editingField === 'city') {
        if (trimmedValue.length < 2) {
          throw new Error('Вкажи назву міста.');
        }
        const location = await getCityCenter(trimmedValue);
        if (!location) {
          throw new Error('Не вдалося знайти це місто. Перевір назву.');
        }
        await updateProfile({
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      setEditingField(null);
    } catch (error) {
      setEditError(
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Не вдалося оновити профіль.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Профіль" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <View style={styles.top}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{name[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{name}</Text>
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        </View>

        <View style={styles.metrics}>
          <ProfileMetric value={String(app.ads.length)} label="оголошення" />
          <ProfileMetric value={String(activeListings)} label="активні" />
          <ProfileMetric value={String(soldListings)} label="продано" />
        </View>

        <View style={styles.rows}>
          <ProfileRow
            label="Ім’я"
            value={name}
            onPress={() => openEditor('display_name')}
          />
          <ProfileRow
            label="Мої оголошення"
            value={String(app.ads.length)}
            onPress={() => navigation.getParent()?.navigate('MyListings')}
          />
          <ProfileRow
            label="Обране"
            value={String(app.favs.length)}
            onPress={() => navigation.navigate('Favorites')}
          />
          <ProfileRow
            label="Місто"
            value={city}
            onPress={() => openEditor('city')}
          />
          <ProfileRow
            label="Телефон"
            value={phone}
            onPress={() => openEditor('phone')}
          />
        </View>

        {profileError ? <Text style={styles.error}>{profileError}</Text> : null}

        {session ? (
          <Button danger label="Вийти з акаунта" onPress={signOutFromGoogle} />
        ) : (
          <Button
            label="Увійти або створити акаунт"
            onPress={() =>
              navigation
                .getParent()
                ?.reset({ index: 0, routes: [{ name: 'Welcome' }] })
            }
          />
        )}
      </ScrollView>

      <ProfileEditModal
        visible={editingField !== null}
        field={editingField}
        initialValue={editValue}
        isSaving={isSaving}
        error={editError}
        onClose={closeEditor}
        onSave={saveField}
      />
    </View>
  );
}
