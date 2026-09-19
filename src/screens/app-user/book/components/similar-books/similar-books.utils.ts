import type { Book } from 'shared/data';

export const SIMILAR_BOOKS_LIMIT = 8;

// The author is the strongest signal for books (other volumes and editions),
// then the category; the rest only separates books that share one of them.
const WEIGHTS = {
  author: 5,
  category: 3,
  city: 2,
  language: 1,
  price: 1,
} as const;

const normalize = (value?: string | null) =>
  (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// The cheaper book costs at least half of the other; free matches free.
const hasSimilarPrice = (left: number, right: number) =>
  Math.min(left, right) * 2 >= Math.max(left, right);

const publishedAt = (book: Book) => Date.parse(book.createdAt ?? '') || 0;

function similarityScore(book: Book, other: Book) {
  const author = normalize(book.author);
  const sameAuthor = author !== '' && author === normalize(other.author);
  const sameCategory = book.cat === other.cat;

  // Being in the same city or price range does not make a book similar.
  if (!sameAuthor && !sameCategory) {
    return 0;
  }

  const city = normalize(book.city);
  let score = 0;

  if (sameAuthor) {
    score += WEIGHTS.author;
  }
  if (sameCategory) {
    score += WEIGHTS.category;
  }
  if (city !== '' && city === normalize(other.city)) {
    score += WEIGHTS.city;
  }
  if (book.language && book.language === other.language) {
    score += WEIGHTS.language;
  }
  if (hasSimilarPrice(book.price, other.price)) {
    score += WEIGHTS.price;
  }

  return score;
}

type FindSimilarBooksOptions = {
  excludeSellerId?: string;
  limit?: number;
};

export function findSimilarBooks(
  book: Book,
  candidates: Book[],
  {
    excludeSellerId,
    limit = SIMILAR_BOOKS_LIMIT,
  }: FindSimilarBooksOptions = {},
) {
  return candidates
    .filter(
      candidate =>
        candidate.id !== book.id &&
        (candidate.status ?? 'active') === 'active' &&
        (!excludeSellerId || candidate.sellerId !== excludeSellerId),
    )
    .map(candidate => ({ candidate, score: similarityScore(book, candidate) }))
    .filter(match => match.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        publishedAt(right.candidate) - publishedAt(left.candidate),
    )
    .slice(0, limit)
    .map(match => match.candidate);
}
