import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button, Field, useCommonStyles } from '../../components/ui';
import { useAuth } from '../../auth/AuthProvider';
import { supabase } from '../../services/supabase';
import { getUserLocation, UserLocation } from '../../services/location';
import { signOutFromGoogle } from '../../services/auth';
import { useTheme } from '../../theme';
import { useStyles } from './complete-profile.styles';

export function CompleteProfileScreen() {
  const styles = useStyles();
  const common = useCommonStyles();
  const { theme } = useTheme();
  const { session, profile, profileError, refreshProfile } = useAuth();
  const googleName =
    session?.user.user_metadata?.full_name ??
    session?.user.user_metadata?.name ??
    '';
  const [name, setName] = useState(profile?.display_name || googleName);
  const [phone, setPhone] = useState(profile?.phone || '+380');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationState, setLocationState] = useState('Визначаємо місто…');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserLocation()
      .then(value => {
        setLocation(value);
        setLocationState(value ? value.city : 'Доступ до геолокації не надано');
      })
      .catch(() => setLocationState('Не вдалося отримати геолокацію'));
  }, []);

  const save = async () => {
    if (!session) {
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (name.trim().length < 2) {
      setError('Вкажи ім’я.');
      return;
    }
    if (digits.length !== 12 || !digits.startsWith('380')) {
      setError('Вкажи український номер у форматі +380XXXXXXXXX.');
      return;
    }
    if (!location) {
      setError('Дозволь геолокацію, щоб визначити твоє місто.');
      return;
    }

    setIsSaving(true);
    setError('');
    const { error: saveError } = await supabase.from('profiles').upsert({
      id: session.user.id,
      display_name: name.trim(),
      phone: `+${digits}`,
      email: session.user.email ?? null,
      avatar_url: session.user.user_metadata?.avatar_url ?? null,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      onboarding_completed: true,
    });

    if (saveError) {
      setError(saveError.message);
      setIsSaving(false);
      return;
    }
    await refreshProfile();
    setIsSaving(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.page}
      >
        <Text style={styles.title}>Ще один крок</Text>
        <Text style={common.subtitle}>
          Телефон побачать лише там, де ти сам вирішиш поділитися контактом.
        </Text>
        <Field
          label="Як тебе звати"
          value={name}
          onChangeText={setName}
          placeholder="Оксана"
          autoCapitalize="words"
        />
        <Field
          label="Телефон"
          value={phone}
          onChangeText={setPhone}
          placeholder="+380XXXXXXXXX"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />
        <View style={styles.locationCard}>
          <Ionicons
            name="location-outline"
            size={styles.iconSize}
            color={theme.palette.accent700}
          />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Твоє місто</Text>
            <Text style={common.meta}>{locationState}</Text>
          </View>
        </View>
        {profileError ? (
          <Text style={styles.error}>
            Таблиця профілів ще не налаштована: {profileError}
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={isSaving ? 'Зберігаємо…' : 'Готово, поїхали'}
          disabled={isSaving}
          onPress={save}
        />
        <Button
          secondary
          label="Вийти"
          disabled={isSaving}
          onPress={signOutFromGoogle}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
