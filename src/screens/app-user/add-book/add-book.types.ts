import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../navigation/types';
import type { LocalBookImage } from '../../services/books';

export type AddBookScreenProps = BottomTabScreenProps<TabParamList, 'Add'>;

export type AddBookForm = {
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
