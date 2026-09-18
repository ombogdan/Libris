import 'react-native-url-polyfill/auto';

import { AppState, Platform } from 'react-native';
import { createClient, processLock } from '@supabase/supabase-js';
import { env } from 'configs/env';
import { supabaseAuthStorage } from 'services/storage/mmkv';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabasePublishableKey,
  {
    auth: {
      storage: supabaseAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  },
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
