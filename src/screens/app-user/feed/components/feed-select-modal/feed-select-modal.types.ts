export type FeedSelectOption = {
  value: string | null;
  label: string;
};

export type FeedSelectModalProps = {
  visible: boolean;
  title: string;
  value: string | null;
  options: FeedSelectOption[];
  onClose: () => void;
  onSelect: (value: string | null) => void;
  customLabel?: string;
  customPlaceholder?: string;
  customValue?: string;
};
