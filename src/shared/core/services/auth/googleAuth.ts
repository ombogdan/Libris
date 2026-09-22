import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { env } from 'configs/env';
import { unregisterPushToken } from 'services/push';
import { supabase } from 'services/supabase';

GoogleSignin.configure({
  webClientId: env.googleWebClientId || undefined,
});

export async function signInWithGoogle() {
  if (!env.googleWebClientId) {
    throw new Error('Missing GOOGLE_WEB_CLIENT_ID in .env');
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();

  if (!isSuccessResponse(result)) {
    return null;
  }

  const idToken = result.data.idToken;

  if (!idToken) {
    throw new Error('Google did not return an ID token');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutFromGoogle() {
  // Unregister the device's push token first, while the session that owns it
  // is still valid — the RPC needs auth.uid() to know which row to remove.
  await unregisterPushToken().catch(() => undefined);
  await Promise.allSettled([GoogleSignin.signOut(), supabase.auth.signOut()]);
}
