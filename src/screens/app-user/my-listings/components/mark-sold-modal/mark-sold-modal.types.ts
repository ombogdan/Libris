export type SaleConversationOption = {
  conversationId: string;
  name: string;
  avatarUrl: string | null;
};

export type MarkSoldModalProps = {
  visible: boolean;
  listingTitle: string;
  conversations: SaleConversationOption[];
  isSaving: boolean;
  onClose: () => void;
  onSelect: (conversationId: string | null) => void;
};
