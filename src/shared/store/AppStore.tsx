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
import { Ad, Book, Chat, initialChats } from 'shared/data';
import { useAuth } from 'providers/auth/AuthProvider';
import { supabase } from 'services/supabase';
import type {
  BookListing,
  ListingSellerProfile,
} from 'services/supabase/database.types';
import { removeBookImages, uploadBookImages } from 'services/books';
import type { LocalBookImage } from 'services/books';
import {
  addFavorite,
  getFavoriteListingIds,
  removeFavorite,
} from 'services/favorites';

type AddForm = {
  title: string;
  author: string;
  price: string;
  about: string;
  free: boolean;
  condition: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  images: LocalBookImage[];
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
  publish: (form: AddForm) => Promise<Book>;
  chats: Chat[];
  openSellerChat: (book: Book) => Chat;
  send: (chatId: string, text: string) => void;
  toast: string;
  notify: (text: string) => void;
};

const AppStore = createContext<Store | null>(null);

function formatListingsCount(count: number) {
  const remainder10 = count % 10;
  const remainder100 = count % 100;
  const word =
    remainder10 >= 1 &&
    remainder10 <= 4 &&
    (remainder100 < 11 || remainder100 > 14)
      ? 'оголошення'
      : 'оголошень';

  return `${count} ${word}`;
}

export function AppStoreProvider({ children }: PropsWithChildren) {
  const { session, profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [favs, setFavs] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [chats, setChats] = useState(initialChats);
  const [toast, setToast] = useState('');
  const favsRef = useRef<string[]>([]);
  const favoritesRequest = useRef(0);
  const favoriteMutations = useRef(new Set<string>());

  const updateFavs = useCallback((updater: (current: string[]) => string[]) => {
    const next = updater(favsRef.current);
    favsRef.current = next;
    setFavs(next);
  }, []);

  const notify = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 2400);
  }, []);

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
            : 'Не вдалося завантажити обране.',
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

  const toggleFav = useCallback(
    async (id: string) => {
      const userId = session?.user.id;
      if (!userId) {
        notify('Увійди в акаунт, щоб зберігати обране');
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
            : 'Не вдалося оновити обране.',
        );
        notify('Не вдалося оновити обране');
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
        condition: row.condition,
        city: row.city,
        seller: sellerName || 'Користувач',
        rating: '—',
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

    if (!userId || !displayName) {
      return;
    }

    setBooks(current => {
      let changed = false;
      const next = current.map(book => {
        if (book.sellerId !== userId || book.seller === displayName) {
          return book;
        }

        changed = true;
        return { ...book, seller: displayName };
      });

      return changed ? next : current;
    });
  }, [profile?.display_name, session?.user.id]);

  const publish = useCallback(
    async (f: AddForm) => {
      if (!session) {
        throw new Error('Увійди в акаунт, щоб опублікувати книгу.');
      }
      if (f.latitude === null || f.longitude === null) {
        throw new Error('Не вдалося визначити координати міста.');
      }

      if (!f.images.length || f.images.length > 5) {
        throw new Error('Додай від одного до п’яти фото книги.');
      }

      const { data, error } = await supabase
        .from('book_listings')
        .insert({
          seller_id: session.user.id,
          seller_name:
            profile?.display_name ||
            session.user.email?.split('@')[0] ||
            'Користувач',
          title: f.title.trim(),
          author: f.author.trim(),
          price: f.free ? 0 : Number(f.price),
          category: 'Інше',
          condition: f.condition,
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
      let listing = data;
      try {
        const uploaded = await uploadBookImages(
          session.user.id,
          data.id,
          f.images,
        );
        uploadedPaths = uploaded.paths;
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
        await Promise.allSettled([
          removeBookImages(uploadedPaths),
          supabase.from('book_listings').delete().eq('id', data.id),
        ]);
        throw uploadError;
      }

      const book = toBook(listing);
      setBooks(current => [
        book,
        ...current.filter(item => item.id !== book.id),
      ]);
      return book;
    },
    [profile?.display_name, session, toBook],
  );

  const ads: Ad[] = useMemo(
    () =>
      books
        .filter(book => book.sellerId === session?.user.id)
        .map(book => ({
          id: book.id,
          title: book.title,
          price: book.price,
          status: book.status === 'sold' ? 'Продано' : 'Активне',
          stats: 'Опубліковано',
          tone: book.tone,
          imageUrls: book.imageUrls,
        })),
    [books, session?.user.id],
  );
  const openSellerChat = (book: Book) => {
    const found = chats.find(x => x.name === book.seller);
    if (found) return found;
    const chat: Chat = {
      id: `c${Date.now()}`,
      name: book.seller,
      about: `${book.title} · ${book.price ? `${book.price} ₴` : 'Даром'}`,
      time: 'зараз',
      unread: false,
      msgs: [],
    };
    setChats(v => [chat, ...v]);
    return chat;
  };
  const send = (chatId: string, text: string) =>
    setChats(v =>
      v.map(chat =>
        chat.id === chatId
          ? { ...chat, msgs: [...chat.msgs, { me: true, text }] }
          : chat,
      ),
    );
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
    publish,
    chats,
    openSellerChat,
    send,
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
