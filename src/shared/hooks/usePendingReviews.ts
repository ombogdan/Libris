import { useMemo } from 'react';
import { useMMKVString } from 'react-native-mmkv';

import { appStorage } from 'services/storage/mmkv';
import type { Chat } from 'shared/data';
import { useAppStore } from 'store/AppStore';

const SEEN_KEY = 'reviews.pendingSeenIds';

// Chats a sale/purchase made reviewable that the user hasn't opened yet.
// "Seen" (not "reviewed") clears the badge — the point is just to surface
// that something new is waiting, not to nag until a review is actually
// left. useMMKVString re-renders every reader as soon as markAllSeen()
// writes, so the badge clears immediately without any extra wiring.
export function usePendingReviews(): {
  pendingChats: Chat[];
  unseenCount: number;
  markAllSeen: () => void;
} {
  const { chats } = useAppStore();
  const [seenRaw, setSeenRaw] = useMMKVString(SEEN_KEY, appStorage);

  const pendingChats = useMemo(
    () => chats.filter(chat => chat.canReview),
    [chats],
  );

  const seenIds = useMemo<Set<string>>(() => {
    try {
      return seenRaw ? new Set(JSON.parse(seenRaw)) : new Set();
    } catch {
      return new Set();
    }
  }, [seenRaw]);

  const unseenCount = useMemo(
    () => pendingChats.filter(chat => !seenIds.has(chat.id)).length,
    [pendingChats, seenIds],
  );

  const markAllSeen = () => {
    setSeenRaw(JSON.stringify(pendingChats.map(chat => chat.id)));
  };

  return { pendingChats, unseenCount, markAllSeen };
}
