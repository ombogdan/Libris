import { t } from 'shared/localization/i18n';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from 'shared/components/ui';
import { signInWithGoogle } from 'services/auth';
import { useTheme } from 'shared/theme';
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
          : t('signup.googleError'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Pressable onPress={navigation.goBack}>
        <Text style={styles.back}>← {t('common.back')}</Text>
      </Pressable>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{t('common.logoLetter')}</Text>
        </View>
        <Text style={styles.title}>{t('signup.title')}</Text>
        <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>
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
            {isLoading ? t('signup.signingIn') : t('signup.continueWithGoogle')}
          </Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.help}>{t('signup.help')}</Text>
      </View>
      <Button
        secondary
        label={t('welcome.browseFirst')}
        onPress={() => navigation.replace('Tabs', { screen: 'Feed' })}
      />
    </View>
  );
}
