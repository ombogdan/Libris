import { env } from './env';

const DEFAULT_PUBLIC_WEB_URL = 'https://libris-app.onrender.com';

export const publicWebUrl = (
  env.publicWebUrl || DEFAULT_PUBLIC_WEB_URL
).replace(/\/$/, '');

export const publicLinks = {
  home: publicWebUrl,
  support: `${publicWebUrl}/support`,
  privacy: `${publicWebUrl}/privacy`,
  terms: `${publicWebUrl}/terms`,
  privacyChoices: `${publicWebUrl}/privacy-choices`,
  book: (bookId: string) => `${publicWebUrl}/book/${bookId}`,
  profile: (userId: string) => `${publicWebUrl}/profile/${userId}`,
} as const;
