import {
  formatListingsCount,
  formatRating,
  getLocaleTag,
  t,
  useLocale,
} from 'shared/localization/i18n';
import React, {
  useCallback,
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { Ad, Book, Chat, Message } from 'shared/data';
import { useAuth } from 'providers/auth/AuthProvider';
import { supabase } from 'services/supabase';
import type {
  BookListing,
  ChatConversationSummary,
  ChatMessage,
  ListingSellerProfile,
} from 'services/supabase/database.types';
import {
  getBookImagePath,
  markBookListingSold,
  reactivateBookListing,
  registerBookListingImages,
  removeBookImages,
  removeBookListingImageRecords,
  searchBookListings,
  softDeleteBookListing,
  uploadBookImages,
} from 'services/books';
import type {
  FeedFilters,
  FeedListingRow,
  LocalBookImage,
} from 'services/books';
import {
  addFavorite,
  getFavoriteListingIds,
  removeFavorite,
} from 'services/favorites';
import {
  fetchChatConversations,
  fetchChatMessages,
  getOrCreateListingConversation,
  markChatConversationRead,
  sendChatMessage,
} from 'services/chats';
import { submitConversationReview } from 'services/reviews';
import {
  blockUser as blockUserRequest,
  fetchBlockedUserIds,
  reportContent as reportContentRequest,
  unblockUser as unblockUserRequest,
} from 'services/moderation';
import type { ReportReason } from 'services/moderation';

type AddForm = {
  title: string;
  author: string;
  price: string;
  about: string;
  free: boolean;
  condition: string;
  category: string;
  language: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  images: LocalBookImage[];
};
type UpdateListingForm = Omit<AddForm, 'images'> & {
  retainedImageUrls: string[];
  newImages: LocalBookImage[];
};
type Store = {
  books: Book[];
  booksLoading: boolean;
  booksError: string | null;
  reloadBooks: () => Promise<void>;
  favs: string[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  reloadFavorites: () => Promise<void>;
  toggleFav: (id: string) => Promise<void>;
  ads: Ad[];
  feedBooks: Book[];
  feedLoading: boolean;
  feedLoadingMore: boolean;
  feedError: string | null;
  feedHasMore: boolean;
  feedFilters: FeedFilters;
  setFeedFilters: (filters: Partial<FeedFilters>) => void;
  loadFeed: () => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  publish: (form: AddForm) => Promise<Book>;
  updateListing: (
    id: string,
    form: UpdateListingForm,
  ) => Promise<{ book: Book; imageCleanupFailed: boolean }>;
  setListingStatus: (
    id: string,
    status: 'active' | 'sold',
    conversationId?: string | null,
  ) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  chats: Chat[];
  chatsLoading: boolean;
  chatsError: string | null;
  reloadChats: (options?: { silent?: boolean }) => Promise<void>;
  openSellerChat: (book: Book) => Promise<Chat>;
  loadChatMessages: (
    chatId: string,
    options?: { refresh?: boolean; silent?: boolean },
  ) => Promise<void>;
  loadOlderMessages: (chatId: string) => Promise<void>;
  send: (chatId: string, text: string) => Promise<void>;
  retryMessage: (chatId: string, messageId: string) => Promise<void>;
  submitReview: (
    chatId: string,
    rating: number,
    comment: string,
  ) => Promise<void>;
  blockedUserIds: string[];
  blockedUsersLoading: boolean;
  reloadBlockedUsers: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  reportContent: (options: {
    reason: ReportReason;
    reportedUserId?: string | null;
    listingId?: string | null;
    comment?: string;
  }) => Promise<void>;
  toast: string;
  notify: (text: string) => void;
};

const AppStore = createContext<Store | null>(null);

function formatChatTime(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDifference = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (dayDifference === 0) {
    return date.toLocaleTimeString(getLocaleTag(), {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (dayDifference === 1) {
    return t('time.yesterday');
  }

  return date.toLocaleDateString(getLocaleTag(), {
    day: '2-digit',
    month: '2-digit',
  });
}

function mergeMessages(...groups: Message[][]) {
  const byId = new Map<string, Message>();
  groups.flat().forEach(message => byId.set(message.id, message));

  return [...byId.values()].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

const FEED_TONES: Book['tone'][] = ['accent', 'accent2', 'neutral'];

const DEFAULT_FEED_FILTERS: FeedFilters = {
  query: '',
  city: null,
  category: null,
  freeOnly: false,
  minPrice: null,
  maxPrice: null,
  condition: null,
  latitude: null,
  longitude: null,
  radiusKm: null,
  sort: 'recent',
};

function toFeedBook(row: FeedListingRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: '',
    price: row.price,
    cat: row.category,
    condition: row.condition,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    seller: row.seller_display_name || t('common.user'),
    rating: row.seller_review_count
      ? formatRating(row.seller_rating_average)
      : '—',
    reviewsCount: row.seller_review_count,
    sellerAds: formatListingsCount(row.seller_listings_count),
    tone: FEED_TONES[row.id.charCodeAt(0) % FEED_TONES.length],
    about: row.description,
    imageUrls: row.image_urls.length
      ? row.image_urls
      : row.cover_url
      ? [row.cover_url]
      : [],
    sellerId: row.seller_id,
    sellerAvatarUrl: row.seller_avatar_url,
    status: 'active',
    createdAt: row.created_at,
    distanceKm: row.distance_km,
  };
}

export function AppStoreProvider({ children }: PropsWithChildren) {
  const { session, profile } = useAuth();
  const { locale } = useLocale();
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [feedBooks, setFeedBooks] = useState<Book[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedFilters, setFeedFiltersState] =
    useState<FeedFilters>(DEFAULT_FEED_FILTERS);
  const feedRequestSeq = useRef(0);
  const feedLoadingRef = useRef(false);
  const feedLoadingMoreRef = useRef(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const blockedUsersRequest = useRef(0);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const favsRef = useRef<string[]>([]);
  const favoritesRequest = useRef(0);
  const favoriteMutations = useRef(new Set<string>());
  const chatsRef = useRef<Chat[]>([]);
  const chatsRequest = useRef(0);
  const messageRequestSequence = useRef(0);
  const messageRequests = useRef(new Map<string, number>());
  const olderMessageRequests = useRef(new Set<string>());

  const updateFavs = useCallback((updater: (current: string[]) => string[]) => {
    const next = updater(favsRef.current);
    favsRef.current = next;
    setFavs(next);
  }, []);

  const updateChats = useCallback((updater: (current: Chat[]) => Chat[]) => {
    const next = updater(chatsRef.current);
    chatsRef.current = next;
    setChats(next);
  }, []);

  const notify = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 2400);
  }, []);

  const toMessage = useCallback(
    (row: ChatMessage): Message => ({
      id: row.id,
      me: row.sender_id === session?.user.id,
      text: row.body,
      createdAt: row.created_at,
      status: 'sent',
    }),
    [session?.user.id],
  );

  const toChat = useCallback(
    (row: ChatConversationSummary, existing?: Chat): Chat => {
      const serverLastMessageAt = row.last_message_at;
      const hasNewerLocalMessage = Boolean(
        existing?.lastMessageAt &&
          (!serverLastMessageAt ||
            existing.lastMessageAt > serverLastMessageAt),
      );
      const lastMessageAt = hasNewerLocalMessage
        ? existing?.lastMessageAt ?? null
        : serverLastMessageAt;
      const lastMessage = hasNewerLocalMessage
        ? existing?.lastMessage ?? ''
        : row.last_message_text ?? '';
      const name = row.other_user_display_name.trim() || t('common.user');

      return {
        id: row.conversation_id,
        listingId: row.listing_id,
        otherUserId: row.other_user_id,
        name,
        avatarUrl: row.other_user_avatar_url,
        about: `${row.listing_title} · ${
          row.listing_price ? `${row.listing_price} ₴` : t('common.free')
        }`,
        coverUrl: row.listing_cover_url,
        time: formatChatTime(lastMessageAt ?? row.created_at),
        unread: row.unread_count > 0,
        unreadCount: row.unread_count,
        lastMessage,
        lastMessageAt,
        section: row.section,
        archivedAt: row.archived_at,
        archiveReason: row.archive_reason,
        canReview: row.can_review,
        myReviewRating: row.my_review_rating,
        msgs: existing?.msgs ?? [],
        messagesLoaded: existing?.messagesLoaded ?? false,
        messagesLoading: existing?.messagesLoading ?? false,
        messagesLoadingMore: existing?.messagesLoadingMore ?? false,
        hasMoreMessages: existing?.hasMoreMessages ?? true,
        messagesError: existing?.messagesError ?? null,
      };
    },
    [],
  );

  const mergeChatSummaries = useCallback(
    (summaries: ChatConversationSummary[], current: Chat[]) =>
      summaries.map(summary =>
        toChat(
          summary,
          current.find(chat => chat.id === summary.conversation_id),
        ),
      ),
    [toChat],
  );

  const reloadChats = useCallback(
    async (options?: { silent?: boolean }) => {
      const request = ++chatsRequest.current;

      if (!session?.user.id) {
        updateChats(() => []);
        setChatsLoading(false);
        setChatsError(null);
        return;
      }

      if (!options?.silent) {
        setChatsLoading(true);
      }
      setChatsError(null);

      try {
        const summaries = await fetchChatConversations();
        if (request === chatsRequest.current) {
          updateChats(current => mergeChatSummaries(summaries, current));
        }
      } catch (error) {
        if (request === chatsRequest.current) {
          setChatsError(
            error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : t('store.chatsLoadError'),
          );
        }
      } finally {
        if (request === chatsRequest.current) {
          setChatsLoading(false);
        }
      }
    },
    [mergeChatSummaries, session?.user.id, updateChats],
  );

  useEffect(() => {
    reloadChats();

    return () => {
      chatsRequest.current += 1;
      messageRequests.current.clear();
      olderMessageRequests.current.clear();
    };
  }, [reloadChats]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void reloadChats({ silent: true });
      }
    });

    return () => subscription.remove();
  }, [reloadChats]);

  const loadChatMessages = useCallback(
    async (
      chatId: string,
      options?: { refresh?: boolean; silent?: boolean },
    ) => {
      const chat = chatsRef.current.find(item => item.id === chatId);
      if (!session?.user.id || !chat) {
        return;
      }
      if (chat.messagesLoaded && !options?.refresh) {
        return;
      }
      if (messageRequests.current.has(chatId)) {
        return;
      }

      const request = ++messageRequestSequence.current;
      messageRequests.current.set(chatId, request);
      updateChats(current =>
        current.map(item =>
          item.id === chatId
            ? {
                ...item,
                messagesLoading: !options?.silent,
                messagesError: null,
              }
            : item,
        ),
      );

      try {
        const result = await fetchChatMessages(chatId);
        if (messageRequests.current.get(chatId) !== request) {
          return;
        }

        const serverMessages = result.messages.map(toMessage);
        updateChats(current =>
          current.map(item => {
            if (item.id !== chatId) {
              return item;
            }

            return {
              ...item,
              msgs: mergeMessages(item.msgs, serverMessages),
              messagesLoaded: true,
              messagesLoading: false,
              hasMoreMessages:
                item.messagesLoaded && !item.hasMoreMessages
                  ? false
                  : result.hasMore,
              messagesError: null,
              unread: false,
              unreadCount: 0,
            };
          }),
        );

        try {
          await markChatConversationRead(chatId);
        } catch {
          // Повідомлення вже завантажені, тому помилка read receipt не блокує чат.
        }
      } catch (error) {
        if (messageRequests.current.get(chatId) === request) {
          updateChats(current =>
            current.map(item =>
              item.id === chatId
                ? {
                    ...item,
                    messagesLoading: false,
                    messagesError:
                      error && typeof error === 'object' && 'message' in error
                        ? String(error.message)
                        : t('store.messagesLoadError'),
                  }
                : item,
            ),
          );
        }
      } finally {
        if (messageRequests.current.get(chatId) === request) {
          messageRequests.current.delete(chatId);
        }
      }
    },
    [session?.user.id, toMessage, updateChats],
  );

  const loadOlderMessages = useCallback(
    async (chatId: string) => {
      const chat = chatsRef.current.find(item => item.id === chatId);
      if (
        !chat ||
        !chat.messagesLoaded ||
        !chat.hasMoreMessages ||
        olderMessageRequests.current.has(chatId)
      ) {
        return;
      }

      const oldestServerMessage = chat.msgs.find(
        message => message.status === 'sent',
      );
      if (!oldestServerMessage) {
        return;
      }

      olderMessageRequests.current.add(chatId);
      updateChats(current =>
        current.map(item =>
          item.id === chatId
            ? { ...item, messagesLoadingMore: true, messagesError: null }
            : item,
        ),
      );

      try {
        const result = await fetchChatMessages(
          chatId,
          oldestServerMessage.createdAt,
        );
        const olderMessages = result.messages.map(toMessage);
        updateChats(current =>
          current.map(item =>
            item.id === chatId
              ? {
                  ...item,
                  msgs: mergeMessages(olderMessages, item.msgs),
                  messagesLoadingMore: false,
                  hasMoreMessages: result.hasMore,
                }
              : item,
          ),
        );
      } catch (error) {
        updateChats(current =>
          current.map(item =>
            item.id === chatId
              ? {
                  ...item,
                  messagesLoadingMore: false,
                  messagesError:
                    error && typeof error === 'object' && 'message' in error
                      ? String(error.message)
                      : t('store.previousMessagesError'),
                }
              : item,
          ),
        );
      } finally {
        olderMessageRequests.current.delete(chatId);
      }
    },
    [toMessage, updateChats],
  );

  const reloadFavorites = useCallback(async () => {
    const request = ++favoritesRequest.current;
    const userId = session?.user.id;

    if (!userId) {
      favoriteMutations.current.clear();
      updateFavs(() => []);
      setFavoritesError(null);
      setFavoritesLoading(false);
      return;
    }

    setFavoritesLoading(true);
    setFavoritesError(null);
    try {
      const ids = await getFavoriteListingIds(userId);
      if (request === favoritesRequest.current) {
        updateFavs(() => ids);
      }
    } catch (error) {
      if (request === favoritesRequest.current) {
        setFavoritesError(
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : t('store.favoritesLoadError'),
        );
      }
    } finally {
      if (request === favoritesRequest.current) {
        setFavoritesLoading(false);
      }
    }
  }, [session?.user.id, updateFavs]);

  useEffect(() => {
    reloadFavorites();

    return () => {
      favoritesRequest.current += 1;
    };
  }, [reloadFavorites]);

  const reloadBlockedUsers = useCallback(async () => {
    const request = ++blockedUsersRequest.current;
    const userId = session?.user.id;

    if (!userId) {
      setBlockedUserIds([]);
      setBlockedUsersLoading(false);
      return;
    }

    setBlockedUsersLoading(true);
    try {
      const ids = await fetchBlockedUserIds();
      if (request === blockedUsersRequest.current) {
        setBlockedUserIds(ids);
      }
    } catch {
      // Silent: the blocked-users screen can retry on its own.
    } finally {
      if (request === blockedUsersRequest.current) {
        setBlockedUsersLoading(false);
      }
    }
  }, [session?.user.id]);

  useEffect(() => {
    reloadBlockedUsers();

    return () => {
      blockedUsersRequest.current += 1;
    };
  }, [reloadBlockedUsers]);

  const toggleFav = useCallback(
    async (id: string) => {
      const userId = session?.user.id;
      if (!userId) {
        notify(t('store.favoritesAuth'));
        return;
      }
      if (favoriteMutations.current.has(id)) {
        return;
      }

      favoritesRequest.current += 1;
      setFavoritesLoading(false);
      favoriteMutations.current.add(id);
      const wasFavorite = favsRef.current.includes(id);
      updateFavs(current =>
        wasFavorite
          ? current.filter(favoriteId => favoriteId !== id)
          : [...current, id],
      );

      try {
        if (wasFavorite) {
          await removeFavorite(userId, id);
        } else {
          await addFavorite(userId, id);
        }
        setFavoritesError(null);
        void reloadFavorites();
      } catch (error) {
        updateFavs(current =>
          wasFavorite
            ? current.includes(id)
              ? current
              : [...current, id]
            : current.filter(favoriteId => favoriteId !== id),
        );
        setFavoritesError(
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : t('store.favoritesUpdateError'),
        );
        notify(t('store.favoritesUpdateError'));
        void reloadFavorites();
      } finally {
        favoriteMutations.current.delete(id);
      }
    },
    [notify, reloadFavorites, session?.user.id, updateFavs],
  );
  const toBook = useCallback(
    (
      row: BookListing,
      sellerProfile?: ListingSellerProfile,
      visibleListingsCount = 0,
    ): Book => {
      const tones: Book['tone'][] = ['accent', 'accent2', 'neutral'];
      const tone = tones[row.id.charCodeAt(0) % tones.length];
      const sellerName =
        sellerProfile?.display_name.trim() || row.seller_name.trim();

      return {
        id: row.id,
        title: row.title,
        author: row.author,
        year: '',
        price: row.price,
        cat: row.category,
        language: row.language,
        condition: row.condition,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude,
        seller: sellerName || t('common.user'),
        rating: sellerProfile?.review_count
          ? formatRating(sellerProfile.rating_average)
          : '—',
        reviewsCount: sellerProfile?.review_count ?? 0,
        sellerAds: formatListingsCount(
          sellerProfile?.listings_count ?? visibleListingsCount,
        ),
        tone,
        about: row.description,
        imageUrls: row.image_urls.length
          ? row.image_urls
          : row.cover_url
          ? [row.cover_url]
          : [],
        sellerId: row.seller_id,
        sellerAvatarUrl: sellerProfile?.avatar_url ?? null,
        status: row.status,
        createdAt: row.created_at,
      };
    },
    [],
  );

  const reloadBooks = useCallback(async () => {
    if (!session) {
      setBooks([]);
      setBooksError(null);
      setBooksLoading(false);
      return;
    }

    setBooksLoading(true);
    setBooksError(null);
    const { data, error } = await supabase
      .from('book_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setBooksError(error.message);
    } else {
      const listings = data ?? [];
      const sellerIds = [...new Set(listings.map(row => row.seller_id))];
      const visibleListingsBySeller = listings.reduce<Map<string, number>>(
        (counts, row) => {
          counts.set(row.seller_id, (counts.get(row.seller_id) ?? 0) + 1);
          return counts;
        },
        new Map(),
      );
      let sellerProfiles = new Map<string, ListingSellerProfile>();

      if (sellerIds.length) {
        const { data: sellers } = await supabase
          .from('listing_seller_profiles')
          .select('*')
          .in('id', sellerIds);

        sellerProfiles = new Map(
          (sellers ?? []).map(seller => [seller.id, seller]),
        );
      }

      setBooks(
        listings.map(row =>
          toBook(
            row,
            sellerProfiles.get(row.seller_id),
            visibleListingsBySeller.get(row.seller_id) ?? 0,
          ),
        ),
      );
    }
    setBooksLoading(false);
  }, [session, toBook]);

  useEffect(() => {
    reloadBooks();
  }, [reloadBooks]);

  useEffect(() => {
    const userId = session?.user.id;
    const displayName = profile?.display_name.trim();
    const reviewsCount = profile?.review_count ?? 0;
    const rating = reviewsCount
      ? formatRating(profile?.rating_average ?? 0)
      : '—';

    if (!userId || !displayName) {
      return;
    }

    setBooks(current => {
      let changed = false;
      const next = current.map(book => {
        if (book.sellerId !== userId) {
          return book;
        }

        if (
          book.seller === displayName &&
          book.rating === rating &&
          book.reviewsCount === reviewsCount
        ) {
          return book;
        }

        changed = true;
        return {
          ...book,
          seller: displayName,
          rating,
          reviewsCount,
        };
      });

      return changed ? next : current;
    });
  }, [
    profile?.display_name,
    profile?.rating_average,
    profile?.review_count,
    session?.user.id,
  ]);

  const publish = useCallback(
    async (f: AddForm) => {
      if (!session) {
        throw new Error(t('store.publishAuth'));
      }
      if (f.latitude === null || f.longitude === null) {
        throw new Error(t('store.cityCoordinatesError'));
      }

      if (!f.images.length || f.images.length > 5) {
        throw new Error(t('store.addImagesError'));
      }

      const { data, error } = await supabase
        .from('book_listings')
        .insert({
          seller_id: session.user.id,
          seller_name:
            profile?.display_name ||
            session.user.email?.split('@')[0] ||
            t('common.user'),
          title: f.title.trim(),
          author: f.author.trim(),
          price: f.free ? 0 : Number(f.price),
          category: f.category,
          condition: f.condition,
          language: f.language,
          description: f.about.trim(),
          city: f.city.trim(),
          latitude: f.latitude,
          longitude: f.longitude,
          cover_url: null,
          image_urls: [],
          status: 'active',
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      let uploadedPaths: string[] = [];
      let imageRecordsRegistered = false;
      let listing = data;
      try {
        const uploaded = await uploadBookImages(
          session.user.id,
          data.id,
          f.images,
        );
        uploadedPaths = uploaded.paths;
        await registerBookListingImages(
          data.id,
          uploaded.paths.map((path, index) => ({
            path,
            url: uploaded.urls[index],
            position: index,
          })),
        );
        imageRecordsRegistered = true;
        const { data: updated, error: updateError } = await supabase
          .from('book_listings')
          .update({
            image_urls: uploaded.urls,
            cover_url: uploaded.urls[0] ?? null,
          })
          .eq('id', data.id)
          .select('*')
          .single();

        if (updateError) {
          throw updateError;
        }
        listing = updated;
      } catch (uploadError) {
        let storageRemoved = false;
        try {
          await removeBookImages(uploadedPaths);
          storageRemoved = true;
        } catch {
          // The registered paths stay queued for the deferred cleanup.
        }
        if (storageRemoved && imageRecordsRegistered) {
          await removeBookListingImageRecords(data.id, uploadedPaths).catch(
            () => undefined,
          );
        }
        await softDeleteBookListing(data.id).catch(() => undefined);
        throw uploadError;
      }

      const ownActiveListings = books.filter(
        book => book.sellerId === session.user.id && book.status === 'active',
      ).length;
      const book = {
        ...toBook(listing),
        rating: profile?.review_count
          ? formatRating(profile.rating_average)
          : '—',
        reviewsCount: profile?.review_count ?? 0,
        sellerAds: formatListingsCount(ownActiveListings + 1),
      };
      setBooks(current => [
        book,
        ...current.filter(item => item.id !== book.id),
      ]);
      return book;
    },
    [books, profile, session, toBook],
  );

  const updateListing = useCallback(
    async (id: string, form: UpdateListingForm) => {
      const userId = session?.user.id;
      const currentBook = books.find(book => book.id === id);
      if (!userId || !currentBook || currentBook.sellerId !== userId) {
        throw new Error(t('store.listingMissing'));
      }
      if (form.latitude === null || form.longitude === null) {
        throw new Error(t('store.cityCoordinatesError'));
      }

      const originalImageUrls = currentBook.imageUrls ?? [];
      const originalImageSet = new Set(originalImageUrls);
      const retainedImageUrls = form.retainedImageUrls.filter(
        (url, index, values) =>
          originalImageSet.has(url) && values.indexOf(url) === index,
      );
      const totalImages = retainedImageUrls.length + form.newImages.length;
      if (totalImages < 1 || totalImages > 5) {
        throw new Error(t('store.keepImagesError'));
      }

      let uploadedPaths: string[] = [];
      let uploadedUrls: string[] = [];
      if (form.newImages.length) {
        const uploaded = await uploadBookImages(userId, id, form.newImages);
        uploadedPaths = uploaded.paths;
        uploadedUrls = uploaded.urls;
        try {
          await registerBookListingImages(
            id,
            uploaded.paths.map((path, index) => ({
              path,
              url: uploaded.urls[index],
              position: retainedImageUrls.length + index,
            })),
          );
        } catch (error) {
          await removeBookImages(uploaded.paths).catch(() => undefined);
          throw error;
        }
      }

      const imageUrls = [...retainedImageUrls, ...uploadedUrls];
      const { data, error } = await supabase
        .from('book_listings')
        .update({
          title: form.title.trim(),
          author: form.author.trim(),
          price: form.free ? 0 : Number(form.price.replace(',', '.')),
          condition: form.condition,
          category: form.category,
          language: form.language,
          description: form.about.trim(),
          city: form.city.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
          image_urls: imageUrls,
          cover_url: imageUrls[0] ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('seller_id', userId)
        .select('*')
        .single();

      if (error) {
        let storageRemoved = false;
        try {
          await removeBookImages(uploadedPaths);
          storageRemoved = true;
        } catch {
          // Keep the registry row so a later listing purge can retry cleanup.
        }
        if (storageRemoved) {
          await removeBookListingImageRecords(id, uploadedPaths).catch(
            () => undefined,
          );
        }
        throw error;
      }

      const updatedBook = {
        ...toBook(data),
        seller: currentBook.seller,
        sellerAds: currentBook.sellerAds,
        rating: currentBook.rating,
        reviewsCount: currentBook.reviewsCount,
      };
      setBooks(current =>
        current.map(book => (book.id === id ? updatedBook : book)),
      );

      const removedPaths = originalImageUrls
        .filter(url => !retainedImageUrls.includes(url))
        .map(getBookImagePath)
        .filter((path): path is string => Boolean(path));
      let imageCleanupFailed = false;
      try {
        await removeBookImages(removedPaths);
        await removeBookListingImageRecords(id, removedPaths);
      } catch {
        imageCleanupFailed = true;
      }

      return { book: updatedBook, imageCleanupFailed };
    },
    [books, session, toBook],
  );

  const setListingStatus = useCallback(
    async (
      id: string,
      status: 'active' | 'sold',
      conversationId: string | null = null,
    ) => {
      const userId = session?.user.id;
      const currentBook = books.find(book => book.id === id);
      if (!userId || !currentBook || currentBook.sellerId !== userId) {
        throw new Error(t('store.listingMissing'));
      }

      if (status === 'sold') {
        await markBookListingSold(id, conversationId);
      } else {
        await reactivateBookListing(id);
      }

      setBooks(current =>
        current.map(book => (book.id === id ? { ...book, status } : book)),
      );
      await reloadChats({ silent: true });
    },
    [books, reloadChats, session?.user.id],
  );

  const deleteListing = useCallback(
    async (id: string) => {
      const userId = session?.user.id;
      const currentBook = books.find(book => book.id === id);
      if (!userId || !currentBook || currentBook.sellerId !== userId) {
        throw new Error(t('store.listingMissing'));
      }

      await softDeleteBookListing(id);

      setBooks(current => current.filter(book => book.id !== id));
      updateFavs(current => current.filter(listingId => listingId !== id));

      await reloadChats({ silent: true });
    },
    [books, reloadChats, session?.user.id, updateFavs],
  );

  const ads: Ad[] = useMemo(
    () =>
      books
        .filter(book => book.sellerId === session?.user.id)
        .map(book => ({
          id: book.id,
          title: book.title,
          price: book.price,
          status: book.status === 'sold' ? 'sold' : 'active',
          stats: t('myListings.published', { lng: locale }),
          tone: book.tone,
          imageUrls: book.imageUrls,
        })),
    [books, locale, session?.user.id],
  );
  const effectiveFeedFilters = useMemo<FeedFilters>(
    () => ({
      ...feedFilters,
      latitude: profile?.latitude ?? null,
      longitude: profile?.longitude ?? null,
    }),
    [feedFilters, profile?.latitude, profile?.longitude],
  );

  const loadFeed = useCallback(async () => {
    const request = ++feedRequestSeq.current;
    feedLoadingRef.current = true;
    feedLoadingMoreRef.current = false;
    setFeedLoading(true);
    setFeedLoadingMore(false);
    setFeedError(null);
    try {
      const { rows, hasMore } = await searchBookListings(
        effectiveFeedFilters,
        0,
      );
      if (feedRequestSeq.current !== request) {
        return;
      }
      setFeedBooks(rows.map(toFeedBook));
      setFeedHasMore(hasMore);
    } catch (error) {
      if (feedRequestSeq.current === request) {
        setFeedError(
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Unknown error',
        );
      }
    } finally {
      if (feedRequestSeq.current === request) {
        feedLoadingRef.current = false;
        setFeedLoading(false);
      }
    }
  }, [effectiveFeedFilters, session?.user.id]);

  const loadMoreFeed = useCallback(async () => {
    if (
      feedLoadingRef.current ||
      feedLoadingMoreRef.current ||
      !feedHasMore ||
      !feedBooks.length
    ) {
      return;
    }

    const request = feedRequestSeq.current;
    feedLoadingMoreRef.current = true;
    setFeedLoadingMore(true);
    try {
      const { rows, hasMore } = await searchBookListings(
        effectiveFeedFilters,
        feedBooks.length,
      );
      if (feedRequestSeq.current !== request) {
        return;
      }
      setFeedBooks(current => [...current, ...rows.map(toFeedBook)]);
      setFeedHasMore(hasMore);
    } catch {
      // Silent: the user can scroll again to retry, no need for a toast.
    } finally {
      if (feedRequestSeq.current === request) {
        setFeedLoadingMore(false);
      }
      feedLoadingMoreRef.current = false;
    }
  }, [effectiveFeedFilters, feedBooks.length, feedHasMore, session?.user.id]);

  const setFeedFilters = useCallback((partial: Partial<FeedFilters>) => {
    feedRequestSeq.current += 1;
    feedLoadingMoreRef.current = false;
    setFeedLoadingMore(false);
    setFeedFiltersState(current => ({ ...current, ...partial }));
  }, []);

  useEffect(() => {
    const frame = setTimeout(() => {
      void loadFeed();
    }, 350);

    return () => clearTimeout(frame);
  }, [loadFeed]);

  const openSellerChat = useCallback(
    async (book: Book) => {
      const userId = session?.user.id;
      if (!userId) {
        throw new Error(t('store.messageSellerAuth'));
      }
      if (!book.sellerId) {
        throw new Error(t('store.sellerMissing'));
      }
      if (book.sellerId === userId) {
        throw new Error(t('store.selfChat'));
      }

      const conversationId = await getOrCreateListingConversation(book.id);
      const summaries = await fetchChatConversations();
      const next = mergeChatSummaries(summaries, chatsRef.current);
      const chat = next.find(item => item.id === conversationId);

      if (!chat) {
        throw new Error(t('store.createdChatLoadError'));
      }

      updateChats(() => next);
      return chat;
    },
    [mergeChatSummaries, session?.user.id, updateChats],
  );

  const persistMessage = useCallback(
    async (chatId: string, localId: string, text: string) => {
      const userId = session?.user.id;
      if (!userId) {
        throw new Error(t('store.sendAuth'));
      }

      try {
        const row = await sendChatMessage(chatId, userId, text);
        const savedMessage = toMessage(row);
        updateChats(current =>
          current.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  msgs: mergeMessages(
                    chat.msgs.filter(message => message.id !== localId),
                    [savedMessage],
                  ),
                  lastMessage: savedMessage.text,
                  lastMessageAt: savedMessage.createdAt,
                  time: formatChatTime(savedMessage.createdAt),
                  messagesError: null,
                }
              : chat,
          ),
        );
        void reloadChats({ silent: true });
      } catch (error) {
        updateChats(current =>
          current.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  msgs: chat.msgs.map(message =>
                    message.id === localId
                      ? { ...message, status: 'failed' }
                      : message,
                  ),
                }
              : chat,
          ),
        );
        throw error;
      }
    },
    [reloadChats, session?.user.id, toMessage, updateChats],
  );

  const send = useCallback(
    async (chatId: string, value: string) => {
      const text = value.trim();
      const userId = session?.user.id;
      if (!text || !userId) {
        return;
      }

      const localId = `local-${userId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
      const createdAt = new Date().toISOString();
      const optimisticMessage: Message = {
        id: localId,
        me: true,
        text,
        createdAt,
        status: 'sending',
      };

      updateChats(current => {
        const chat = current.find(item => item.id === chatId);
        if (!chat) {
          return current;
        }

        const updated = {
          ...chat,
          msgs: mergeMessages(chat.msgs, [optimisticMessage]),
          lastMessage: text,
          lastMessageAt: createdAt,
          time: formatChatTime(createdAt),
          messagesError: null,
        };
        return [updated, ...current.filter(item => item.id !== chatId)];
      });

      try {
        await persistMessage(chatId, localId, text);
      } catch {
        notify(t('store.sendError'));
      }
    },
    [notify, persistMessage, session?.user.id, updateChats],
  );

  const retryMessage = useCallback(
    async (chatId: string, messageId: string) => {
      const chat = chatsRef.current.find(item => item.id === chatId);
      const message = chat?.msgs.find(item => item.id === messageId);
      if (!message || message.status !== 'failed') {
        return;
      }

      updateChats(current =>
        current.map(item =>
          item.id === chatId
            ? {
                ...item,
                msgs: item.msgs.map(value =>
                  value.id === messageId
                    ? { ...value, status: 'sending' }
                    : value,
                ),
                messagesError: null,
              }
            : item,
        ),
      );

      try {
        await persistMessage(chatId, messageId, message.text);
      } catch {
        notify(t('store.resendError'));
      }
    },
    [notify, persistMessage, updateChats],
  );

  const submitReview = useCallback(
    async (chatId: string, rating: number, comment: string) => {
      const chat = chatsRef.current.find(item => item.id === chatId);
      if (!chat?.canReview) {
        throw new Error(t('store.reviewUnavailable'));
      }
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error(t('reviews.ratingError'));
      }

      await submitConversationReview(chatId, rating, comment);
      updateChats(current =>
        current.map(item =>
          item.id === chatId
            ? { ...item, canReview: false, myReviewRating: rating }
            : item,
        ),
      );
      await Promise.all([reloadChats({ silent: true }), reloadBooks()]);
    },
    [reloadBooks, reloadChats, updateChats],
  );

  const blockUser = useCallback(
    async (userId: string) => {
      await blockUserRequest(userId);
      setBlockedUserIds(current =>
        current.includes(userId) ? current : [...current, userId],
      );
      await Promise.all([
        reloadBooks(),
        reloadChats({ silent: true }),
        loadFeed(),
      ]);
    },
    [loadFeed, reloadBooks, reloadChats],
  );

  const unblockUser = useCallback(
    async (userId: string) => {
      await unblockUserRequest(userId);
      setBlockedUserIds(current => current.filter(id => id !== userId));
      await Promise.all([
        reloadBooks(),
        reloadChats({ silent: true }),
        loadFeed(),
      ]);
    },
    [loadFeed, reloadBooks, reloadChats],
  );

  const reportContent = useCallback(
    async (options: {
      reason: ReportReason;
      reportedUserId?: string | null;
      listingId?: string | null;
      comment?: string;
    }) => {
      await reportContentRequest(options);
    },
    [],
  );

  const appliedLocale = useRef(locale);

  useEffect(() => {
    if (appliedLocale.current === locale) {
      return;
    }
    appliedLocale.current = locale;

    // Chat and listing rows keep pre-formatted text (dates, plurals, ratings),
    // so rebuild them in the new language.
    void reloadChats({ silent: true });
    void reloadBooks();
    void loadFeed();
  }, [loadFeed, locale, reloadBooks, reloadChats]);

  const value: Store = {
    books,
    booksLoading,
    booksError,
    reloadBooks,
    favs,
    favoritesLoading,
    favoritesError,
    reloadFavorites,
    toggleFav,
    ads,
    feedBooks,
    feedLoading,
    feedLoadingMore,
    feedError,
    feedHasMore,
    feedFilters,
    setFeedFilters,
    loadFeed,
    loadMoreFeed,
    publish,
    updateListing,
    setListingStatus,
    deleteListing,
    chats,
    chatsLoading,
    chatsError,
    reloadChats,
    openSellerChat,
    loadChatMessages,
    loadOlderMessages,
    send,
    retryMessage,
    submitReview,
    blockedUserIds,
    blockedUsersLoading,
    reloadBlockedUsers,
    blockUser,
    unblockUser,
    reportContent,
    toast,
    notify,
  };
  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStore);
  if (!value)
    throw new Error('useAppStore must be used inside AppStoreProvider');
  return value;
}
