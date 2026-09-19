import type { ReactNode } from 'react';

export type ListRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
  isLast?: boolean;
  // Defaults to true for pressable rows.
  showChevron?: boolean;
  // Rendered after the value, e.g. a switch or a check mark.
  accessory?: ReactNode;
};
