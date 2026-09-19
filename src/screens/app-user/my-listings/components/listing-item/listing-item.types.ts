import type { Ad } from 'shared/data';

export type ListingItemProps = {
  ad: Ad;
  disabled?: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
};
