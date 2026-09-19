import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { LocalBookImage } from 'services/books';
import type { RootStackParamList } from 'types/navigation';

export type EditListingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditListing'
>;

export type EditListingForm = {
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
