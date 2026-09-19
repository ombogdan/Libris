import { useSyncExternalStore } from 'react';
import { I18nManager, NativeModules, Platform } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { appStorage } from 'services/storage/mmkv';
import en from './locales/en';
import uk from './locales/uk';

export type AppLocale = 'uk' | 'en';
export type LocalePreference = AppLocale | 'system';

const LOCALE_PREFERENCE_KEY = 'app.locale';
const LOCALE_TAGS: Record<AppLocale, string> = {
  uk: 'uk-UA',
  en: 'en-US',
};

type IOSSettings = {
  AppleLanguages?: string[];
  AppleLocale?: string;
};

function getDeviceLocale() {
  const settingsManager = NativeModules.SettingsManager as
    | {
        settings?: IOSSettings;
        getConstants?: () => { settings?: IOSSettings };
      }
    | undefined;
  const iosSettings =
    settingsManager?.settings ?? settingsManager?.getConstants?.().settings;
  const iosLocale =
    iosSettings?.AppleLanguages?.[0] ?? iosSettings?.AppleLocale;
  const reactNativeLocale = I18nManager.getConstants().localeIdentifier;
  const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;

  if (Platform.OS === 'ios') {
    return iosLocale ?? reactNativeLocale ?? intlLocale;
  }

  return reactNativeLocale ?? intlLocale;
}

function detectLocale(): AppLocale {
  const localeIdentifier = getDeviceLocale();
  return localeIdentifier.replace('_', '-').toLowerCase().startsWith('uk')
    ? 'uk'
    : 'en';
}

function readLocalePreference(): LocalePreference {
  try {
    const stored = appStorage.getString(LOCALE_PREFERENCE_KEY);
    return stored === 'uk' || stored === 'en' ? stored : 'system';
  } catch {
    return 'system';
  }
}

const resolveLocale = (preference: LocalePreference): AppLocale =>
  preference === 'system' ? detectLocale() : preference;

type LocaleSnapshot = { locale: AppLocale; preference: LocalePreference };

const initialPreference = readLocalePreference();
let localeSnapshot: LocaleSnapshot = {
  locale: resolveLocale(initialPreference),
  preference: initialPreference,
};
const localeListeners = new Set<() => void>();

// Read at call time: the language can change while the app is running.
export const getAppLocale = () => localeSnapshot.locale;
export const getLocaleTag = () => LOCALE_TAGS[localeSnapshot.locale];

void i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, en: { translation: en } },
  lng: localeSnapshot.locale,
  fallbackLng: 'en',
  supportedLngs: ['uk', 'en'],
  initAsync: false,
  interpolation: { escapeValue: false },
});

export async function setLocalePreference(preference: LocalePreference) {
  const locale = resolveLocale(preference);

  try {
    if (preference === 'system') {
      appStorage.remove(LOCALE_PREFERENCE_KEY);
    } else {
      appStorage.set(LOCALE_PREFERENCE_KEY, preference);
    }
  } catch {
    // The choice still applies until the app restarts.
  }

  if (locale !== localeSnapshot.locale) {
    await i18n.changeLanguage(locale);
  }

  localeSnapshot = { locale, preference };
  localeListeners.forEach(listener => listener());
}

const subscribeToLocale = (listener: () => void) => {
  localeListeners.add(listener);
  return () => {
    localeListeners.delete(listener);
  };
};

const getLocaleSnapshot = () => localeSnapshot;

export const useLocale = () =>
  useSyncExternalStore(subscribeToLocale, getLocaleSnapshot);

export const t = (key: string, options?: Record<string, unknown>) =>
  String(i18n.t(key, options));

export function translateCondition(condition: string) {
  const keys: Record<string, string> = {
    'Як нова': 'conditions.likeNew',
    Добрий: 'conditions.good',
    Читана: 'conditions.read',
  };
  return keys[condition] ? t(keys[condition]) : condition;
}

export const BOOK_CATEGORIES = [
  'fiction',
  'education',
  'children',
  'non_fiction',
  'business',
  'comics',
  'other',
] as const;

export function translateCategory(category: string) {
  const keys: Record<string, string> = {
    fiction: 'categories.fiction',
    education: 'categories.education',
    children: 'categories.children',
    non_fiction: 'categories.nonFiction',
    business: 'categories.business',
    comics: 'categories.comics',
    other: 'categories.other',
  };
  return keys[category] ? t(keys[category]) : category;
}

export const BOOK_LANGUAGES = ['uk', 'en', 'other'] as const;

export function translateLanguage(language: string) {
  const keys: Record<string, string> = {
    uk: 'languages.uk',
    en: 'languages.en',
    other: 'languages.other',
  };
  return keys[language] ? t(keys[language]) : language;
}

type CountNoun = 'book' | 'listing' | 'review';

function ukrainianCountKey(count: number, noun: CountNoun) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `counts.${noun}One`;
  }
  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return `counts.${noun}Few`;
  }
  return `counts.${noun}Many`;
}

function countLabel(count: number, noun: CountNoun) {
  const key =
    getAppLocale() === 'uk'
      ? ukrainianCountKey(count, noun)
      : `counts.${noun}${count === 1 ? 'One' : 'Many'}`;
  return t(key, { count });
}

export const formatListingsCount = (count: number) =>
  countLabel(count, 'listing');
export const formatReviewsCount = (count: number) =>
  countLabel(count, 'review');
export const formatBooksCount = (count: number) => countLabel(count, 'book');

export const formatRating = (value: number) =>
  value.toLocaleString(getLocaleTag(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(getLocaleTag(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default i18n;
