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
  // Known values to suggest as the custom field is typed (e.g. cities that
  // actually have listings), filtered client-side against the input text.
  suggestions?: string[];
};
