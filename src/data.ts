export type Book = {
  id: string;
  title: string;
  author: string;
  year: string;
  price: number;
  cat: string;
  condition: string;
  city: string;
  seller: string;
  rating: string;
  sellerAds: string;
  tone: 'accent' | 'accent2' | 'neutral';
  about: string;
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

export type Message = { me: boolean; text: string };
export type Chat = {
  id: string;
  name: string;
  about: string;
  time: string;
  unread: boolean;
  msgs: Message[];
};
export const initialChats: Chat[] = [
  {
    id: 'c1',
    name: 'Оксана Д.',
    about: 'Кобзар · 180 ₴',
    time: '12:40',
    unread: true,
    msgs: [
      { me: false, text: 'Вітаю! Книга ще актуальна 🙂' },
      { me: true, text: 'Так, є. Коли вам зручно забрати?' },
      { me: false, text: 'Можу сьогодні після 18:00, район вокзалу' },
    ],
  },
  {
    id: 'c2',
    name: 'Андрій М.',
    about: 'Вища математика · 250 ₴',
    time: 'Вчора',
    unread: false,
    msgs: [
      { me: true, text: 'Добрий день! Віддасте за 200?' },
      { me: false, text: 'За 220 і зустрінемось у центрі' },
    ],
  },
  {
    id: 'c3',
    name: 'Марта К.',
    about: 'Тигролови · Даром',
    time: 'Пн',
    unread: false,
    msgs: [{ me: false, text: 'Забрали книгу, дякую! Гарного читання' }],
  },
];

export type Ad = {
  id: string;
  title: string;
  price: number;
  status: string;
  stats: string;
  tone: 'accent' | 'accent2' | 'neutral';
};
export const initialAds: Ad[] = [
  {
    id: 'm1',
    title: 'Гаррі Поттер, том 1',
    price: 220,
    status: 'Активне',
    stats: '84 перегляди · 3 звернення',
    tone: 'accent',
  },
  {
    id: 'm2',
    title: 'Історія України, 10 клас',
    price: 0,
    status: 'Активне',
    stats: '31 перегляд · 1 звернення',
    tone: 'accent2',
  },
  {
    id: 'm3',
    title: 'Кайдашева сім’я',
    price: 90,
    status: 'Продано',
    stats: 'Продано 14 серпня',
    tone: 'neutral',
  },
];
