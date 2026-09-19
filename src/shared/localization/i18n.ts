import { I18nManager, NativeModules, Platform } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import uk from './locales/uk';

export type AppLocale = 'uk' | 'en';

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

export const appLocale = detectLocale();
export const localeTag = appLocale === 'uk' ? 'uk-UA' : 'en-US';

void i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, en: { translation: en } },
  lng: appLocale,
  fallbackLng: 'en',
  supportedLngs: ['uk', 'en'],
  initAsync: false,
  interpolation: { escapeValue: false },
});

export function setLocale(locale: AppLocale) {
  return i18n.changeLanguage(locale);
}

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
    appLocale === 'uk'
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
  value.toLocaleString(localeTag, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export default i18n;
