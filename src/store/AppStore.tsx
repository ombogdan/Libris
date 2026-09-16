import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { Ad, Book, books, Chat, initialAds, initialChats } from '../data';

type AddForm = {
  title: string;
  author: string;
  price: string;
  about: string;
  free: boolean;
  condition: string;
};
type Store = {
  books: Book[];
  favs: string[];
  toggleFav: (id: string) => void;
  user: string;
  setUser: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  contact: string;
  setContact: (v: string) => void;
  ads: Ad[];
  publish: (form: AddForm) => void;
  chats: Chat[];
  openSellerChat: (book: Book) => Chat;
  send: (chatId: string, text: string) => void;
  toast: string;
  notify: (text: string) => void;
};

const AppStore = createContext<Store | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [favs, setFavs] = useState(['b5']);
  const [user, setUser] = useState('Оксана');
  const [city, setCity] = useState('Полтава');
  const [contact, setContact] = useState('');
  const [ads, setAds] = useState(initialAds);
  const [chats, setChats] = useState(initialChats);
  const [toast, setToast] = useState('');
  const toggleFav = (id: string) =>
    setFavs(v => (v.includes(id) ? v.filter(x => x !== id) : [...v, id]));
  const publish = (f: AddForm) =>
    setAds(v => [
      {
        id: `n${Date.now()}`,
        title: f.title,
        price: f.free ? 0 : Number(f.price) || 0,
        status: 'Активне',
        stats: 'Щойно опубліковано',
        tone: 'accent2',
      },
      ...v,
    ]);
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
