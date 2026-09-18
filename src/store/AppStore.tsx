import React, {
  useCallback,
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Ad, Book, Chat, initialChats } from '../data';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../services/supabase';
import type { BookListing } from '../services/supabase/database.types';
import { removeBookImages, uploadBookImages } from '../services/books';
import type { LocalBookImage } from '../services/books';

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
  toggleFav: (id: string) => void;
  user: string;
  setUser: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  contact: string;
  setContact: (v: string) => void;
  ads: Ad[];
  publish: (form: AddForm) => Promise<Book>;
  chats: Chat[];
  openSellerChat: (book: Book) => Chat;
  send: (chatId: string, text: string) => void;
  toast: string;
  notify: (text: string) => void;
};

const AppStore = createContext<Store | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const { session, profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [favs, setFavs] = useState<string[]>([]);
  const [user, setUser] = useState('Оксана');
  const [city, setCity] = useState('Полтава');
  const [contact, setContact] = useState('');
  const [chats, setChats] = useState(initialChats);
  const [toast, setToast] = useState('');
  const toggleFav = (id: string) =>
    setFavs(v => (v.includes(id) ? v.filter(x => x !== id) : [...v, id]));
  const toBook = useCallback((row: BookListing): Book => {
    const tones: Book['tone'][] = ['accent', 'accent2', 'neutral'];
    const tone = tones[row.id.charCodeAt(0) % tones.length];

    return {
      id: row.id,
      title: row.title,
      author: row.author,
      year: '',
      price: row.price,
      cat: row.category,
      condition: row.condition,
      city: row.city,
      seller: row.seller_name,
      rating: '—',
      sellerAds: 'оголошення продавця',
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
  }, []);

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
      setBooks((data ?? []).map(toBook));
    }
    setBooksLoading(false);
  }, [session, toBook]);

  useEffect(() => {
    reloadBooks();
  }, [reloadBooks]);

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
  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 2400);
  };
  const value: Store = {
    books,
    booksLoading,
    booksError,
    reloadBooks,
    favs,
    toggleFav,
    user,
    setUser,
    city,
    setCity,
    contact,
    setContact,
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
