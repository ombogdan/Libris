import React, {useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {RootStackParamList} from '../navigation/types';
import {Button, common} from '../components/ui';
import {colors as c} from '../theme';
import {signInWithGoogle} from '../services/auth';

export function SignupScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Signup'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Не вдалося увійти через Google. Спробуй ще раз.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.page}>
      <Pressable onPress={navigation.goBack}>
        <Text style={common.back}>← Назад</Text>
      </Pressable>
      <View style={s.content}>
        <View style={s.logo}>
          <Text style={s.logoText}>К</Text>
        </View>
        <Text style={s.title}>Створи профіль</Text>
        <Text style={common.subtitle}>
          Увійди через Google. Паролів, SMS та листів підтвердження не буде.
        </Text>
        <Pressable
          disabled={isLoading}
          onPress={handleGoogleSignIn}
          style={({pressed}) => [
            s.googleButton,
            (pressed || isLoading) && s.pressed,
          ]}>
          <Ionicons name="logo-google" size={21} color={c.text} />
          <Text style={s.googleText}>
            {isLoading ? 'Входимо…' : 'Продовжити з Google'}
          </Text>
        </Pressable>
        {error ? <Text style={s.error}>{error}</Text> : null}
        <Text style={s.help}>
          Після входу залишиться вказати телефон. Місто визначимо з геолокації.
        </Text>
      </View>
      <Button
        secondary
        label="Спершу подивлюсь"
        onPress={() => navigation.replace('Tabs', {screen: 'Feed'})}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: c.bg,
  },
  content: {flex: 1, justifyContent: 'center', gap: 16},
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {fontSize: 28, fontWeight: '800', color: c.bg},
  title: {fontSize: 31, fontWeight: '800', color: c.text},
  googleButton: {
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.divider,
    backgroundColor: c.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pressed: {opacity: 0.55},
  googleText: {fontSize: 15, fontWeight: '700', color: c.text},
  help: {fontSize: 12.5, lineHeight: 19, color: c.n600},
  error: {fontSize: 13, lineHeight: 19, color: '#A53C3C'},
});
