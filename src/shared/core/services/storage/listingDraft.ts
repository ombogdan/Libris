import { appStorage } from './mmkv';

// What the add-listing form keeps between launches. Photos are not part of it:
// they are temporary files that may be gone by the next launch.
export type ListingDraft = {
  title: string;
  author: string;
  price: string;
  about: string;
  free: boolean;
  condition: string;
  category: string;
  language: string;
  city: string;
};

const KEY_PREFIX = 'draft.listing.';
const TEXT_FIELDS = [
  'title',
  'author',
  'price',
  'about',
  'condition',
  'category',
  'language',
  'city',
] as const;

const draftKey = (userId: string) => `${KEY_PREFIX}${userId}`;

// A form that only holds defaults (or a city filled in from the profile) is not
// worth restoring.
const hasContent = (draft: ListingDraft) =>
  Boolean(
    draft.title.trim() ||
      draft.author.trim() ||
      draft.price.trim() ||
      draft.about.trim() ||
      draft.free,
  );

// Everything below is best effort: a draft is a convenience and must never
// break the form.
export function loadListingDraft(userId: string): Partial<ListingDraft> | null {
  try {
    const raw = appStorage.getString(draftKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const source = parsed as Record<string, unknown>;
    const draft: Partial<ListingDraft> = {};

    for (const field of TEXT_FIELDS) {
      const value = source[field];
      if (typeof value === 'string') {
        draft[field] = value;
      }
    }
    if (typeof source.free === 'boolean') {
      draft.free = source.free;
    }

    return draft;
  } catch {
    return null;
  }
}

export function saveListingDraft(userId: string, form: ListingDraft) {
  try {
    const { title, author, price, about, free } = form;
    const { condition, category, language, city } = form;
    const draft: ListingDraft = {
      title,
      author,
      price,
      about,
      free,
      condition,
      category,
      language,
      city,
    };

    if (hasContent(draft)) {
      appStorage.set(draftKey(userId), JSON.stringify(draft));
    } else {
      appStorage.remove(draftKey(userId));
    }
  } catch {
    // Not saved this time; the form keeps working.
  }
}

export function clearListingDraft(userId: string) {
  try {
    appStorage.remove(draftKey(userId));
  } catch {
    // Nothing to clear.
  }
}

// For account deletion: nobody should be able to read a former user's text.
export function clearAllListingDrafts() {
  try {
    appStorage
      .getAllKeys()
      .filter(key => key.startsWith(KEY_PREFIX))
      .forEach(key => appStorage.remove(key));
  } catch {
    // Nothing to clear.
  }
}
