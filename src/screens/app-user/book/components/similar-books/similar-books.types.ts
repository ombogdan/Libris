import type { Book } from 'shared/data';

export type SimilarBooksProps = {
  book: Book;
  // Everything the app has loaded; the closest matches are picked from it.
  books: Book[];
  // Listings of this seller (the signed-in user) are never suggested.
  excludeSellerId?: string;
  onOpen: (bookId: string) => void;
};
