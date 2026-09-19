export type Book = {
  id: string;
  title: string;
  author: string;
  year: string;
  price: number;
  cat: string;
  language?: string;
  condition: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  seller: string;
  rating: string;
  reviewsCount?: number;
  sellerAds: string;
  tone: 'accent' | 'accent2' | 'neutral';
  about: string;
  imageUrls?: string[];
  sellerId?: string;
  sellerAvatarUrl?: string | null;
  status?: 'active' | 'sold' | 'hidden';
  createdAt?: string;
  distanceKm?: number | null;
};
export const books: Book[] = [
  {
    id: 'b1',
    title: 'Кобзар',
    author: 'Тарас Шевченко',
    year: '2019',
    price: 180,
    cat: 'Художня',
    condition: 'Добрий',
    city: 'Полтава',
    seller: 'Оксана Д.',
    rating: '4,9',
    sellerAds: '12 оголошень',
    tone: 'accent',
    about:
      'Подарункове видання, тверда обкладинка. Читана раз, кілька закладок лишила всередині.',
  },
  {
    id: 'b2',
    title: 'Вища математика, ч.1',
    author: 'Дубовик, Юрик',
    year: '2021',
    price: 250,
    cat: 'Підручники',
    condition: 'Як нова',
    city: 'Київ',
    seller: 'Андрій М.',
    rating: '4,7',
    sellerAds: '5 оголошень',
    tone: 'accent2',
    about: 'Здав сесію — віддаю далі. Без записів олівцем, корінець цілий.',
  },
  {
    id: 'b3',
    title: 'Тигролови',
    author: 'Іван Багряний',
    year: '2018',
    price: 0,
    cat: 'Художня',
    condition: 'Читана',
    city: 'Харків',
    seller: 'Марта К.',
    rating: '5,0',
    sellerAds: '3 оголошення',
    tone: 'neutral',
    about:
      'Віддам даром, забирати біля метро. Сторінки трохи пожовкли, але все читабельне.',
  },
  {
    id: 'b4',
    title: 'Мікроекономіка',
    author: 'Пиндайк, Рубінфелд',
    year: '2020',
    price: 320,
    cat: 'Підручники',
    condition: 'Добрий',
    city: 'Львів',
    seller: 'Ігор В.',
    rating: '4,6',
    sellerAds: '9 оголошень',
    tone: 'accent2',
    about: 'Основний підручник курсу. Є маркер у двох розділах.',
  },
  {
    id: 'b5',
    title: 'Місто',
    author: 'Валер’ян Підмогильний',
    year: '2017',
    price: 140,
    cat: 'Художня',
    condition: 'Як нова',
    city: 'Полтава',
    seller: 'Ніна Л.',
    rating: '4,8',
    sellerAds: '6 оголошень',
    tone: 'accent',
    about: 'Кишенькове видання, ідеальний стан. Можу передати Новою поштою.',
  },
  {
    id: 'b6',
    title: 'Атлас анатомії',
    author: 'Синельников',
    year: '2015',
    price: 0,
    cat: 'Підручники',
    condition: 'Читана',
    city: 'Київ',
    seller: 'Тарас Б.',
    rating: '4,5',
    sellerAds: '2 оголошення',
    tone: 'neutral',
    about: 'Віддам студенту-медику даром. Обкладинка підклеєна скотчем.',
  },
];

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type Message = {
  id: string;
  me: boolean;
  text: string;
  createdAt: string;
  status: MessageStatus;
};

export type Chat = {
  id: string;
  listingId: string | null;
  otherUserId: string;
  name: string;
  avatarUrl: string | null;
  about: string;
  coverUrl: string | null;
  time: string;
  unread: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string | null;
  section: 'buying' | 'selling' | 'archive';
  archivedAt: string | null;
  archiveReason: 'sold' | 'deleted' | 'hidden' | null;
  canReview: boolean;
  myReviewRating: number | null;
  msgs: Message[];
  messagesLoaded: boolean;
  messagesLoading: boolean;
  messagesLoadingMore: boolean;
  hasMoreMessages: boolean;
  messagesError: string | null;
};

export type Ad = {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'sold';
  stats: string;
  tone: 'accent' | 'accent2' | 'neutral';
  imageUrls?: string[];
};
