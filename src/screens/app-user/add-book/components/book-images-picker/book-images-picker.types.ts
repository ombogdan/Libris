import type { LocalBookImage } from '../../../../services/books';

export type BookImagesPickerProps = {
  images: LocalBookImage[];
  onChange: (images: LocalBookImage[]) => void;
  onError: (message: string) => void;
};
