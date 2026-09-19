import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from 'types/navigation';
import type { LocalBookImage } from 'services/books';

export type AddBookScreenProps = BottomTabScreenProps<TabParamList, 'Add'>;

export type AddBookForm = {
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
