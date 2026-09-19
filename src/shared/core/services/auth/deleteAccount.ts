import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from 'services/supabase';

// The Edge Function removes the user's files and the auth user; the profile,
// listings, chats and the rest cascade from it in the database.
export async function deleteAccount() {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw error;
  }

  // The account is gone, so only clean up this device. A global sign-out would
  // ask the server about a user that no longer exists.
  await Promise.allSettled([GoogleSignin.revokeAccess()]);
  await Promise.allSettled([
    GoogleSignin.signOut(),
    supabase.auth.signOut({ scope: 'local' }),
  ]);
}
