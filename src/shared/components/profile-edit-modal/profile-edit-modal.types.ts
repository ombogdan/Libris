export type EditableProfileField = 'display_name' | 'city' | 'phone';

export type ProfileEditModalProps = {
  visible: boolean;
  field: EditableProfileField | null;
  initialValue: string;
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onSave: (value: string) => void;
};
