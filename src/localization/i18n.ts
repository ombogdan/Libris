import { I18n } from 'i18n-js';
import en from './locales/en';
import uk from './locales/uk';

export type AppLocale = 'uk' | 'en';
export const i18n = new I18n({ uk, en });
i18n.defaultLocale = 'uk';
i18n.locale = 'uk';
i18n.enableFallback = true;

export function setLocale(locale: AppLocale) {
  i18n.locale = locale;
}
export const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, options);
