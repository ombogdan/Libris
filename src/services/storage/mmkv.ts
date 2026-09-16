import { createMMKV } from 'react-native-mmkv';

export const appStorage = createMMKV({ id: 'libris' });

export const supabaseAuthStorage = {
  getItem(key: string): string | null {
    return appStorage.getString(key) ?? null;
  },
  setItem(key: string, value: string): void {
    appStorage.set(key, value);
  },
  removeItem(key: string): void {
    appStorage.remove(key);
  },
};
