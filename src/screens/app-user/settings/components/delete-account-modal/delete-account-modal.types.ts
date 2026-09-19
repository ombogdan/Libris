export type DeleteAccountModalProps = {
  visible: boolean;
  isDeleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};
