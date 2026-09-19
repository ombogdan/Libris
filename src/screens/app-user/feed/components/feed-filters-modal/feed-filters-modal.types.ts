import type { FeedFilters } from 'services/books';

export type FeedFiltersModalProps = {
  visible: boolean;
  filters: FeedFilters;
  hasLocation: boolean;
  onClose: () => void;
  onApply: (filters: Partial<FeedFilters>) => void;
  onReset: () => void;
};
