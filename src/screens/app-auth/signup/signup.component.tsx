import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../../components/ui';
import { signInWithGoogle } from '../../services/auth';
import { useTheme } from '../../theme';
import { useStyles } from './signup.styles';
import type { SignupScreenProps } from './signup.types';

export function SignupScreen({ navigation }: SignupScreenProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (caught) {
      console.warn('Google sign-in failed', caught);
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
    <View style={styles.page}>
      <Pressable onPress={navigation.goBack}>
        <Text style={styles.back}>← Назад</Text>
      </Pressable>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>К</Text>
        </View>
        <Text style={styles.title}>Створи профіль</Text>
        <Text style={styles.subtitle}>
          Увійди через Google. Паролів, SMS та листів підтвердження не буде.
        </Text>
        <Pressable
          disabled={isLoading}
          onPress={handleGoogleSignIn}
          style={({ pressed }) => [
            styles.googleButton,
            (pressed || isLoading) && styles.pressed,
          ]}
        >
          <Ionicons
            name="logo-google"
            size={styles.iconSize}
            color={theme.palette.text}
          />
          <Text style={styles.googleText}>
            {isLoading ? 'Входимо…' : 'Продовжити з Google'}
          </Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.help}>
          Після входу залишиться вказати телефон. Місто визначимо з геолокації.
        </Text>
      </View>
      <Button
        secondary
        label="Спершу подивлюсь"
        onPress={() => navigation.replace('Tabs', { screen: 'Feed' })}
      />
    </View>
  );
}
