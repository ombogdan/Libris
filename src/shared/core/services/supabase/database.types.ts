export type Profile = {
  id: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type BookListing = {
  id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  author: string;
  price: number;
  category: string;
  condition: string;
  description: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  cover_url: string | null;
  image_urls: string[];
  status: 'active' | 'sold' | 'hidden';
  created_at: string;
  updated_at: string;
};

export type BookFavorite = {
  user_id: string;
  listing_id: string;
  created_at: string;
};

export type ChatConversation = {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  listing_title: string;
  listing_price: number;
  listing_cover_url: string | null;
  last_message_text: string | null;
  last_message_sender_id: string | null;
  last_message_at: string | null;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ListingSellerProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  listings_count: number;
};

export type ChatConversationSummary = {
  conversation_id: string;
  listing_id: string | null;
  listing_title: string;
  listing_price: number;
  listing_cover_url: string | null;
  buyer_id: string;
  seller_id: string;
  other_user_id: string;
  other_user_display_name: string;
  other_user_avatar_url: string | null;
  last_message_text: string | null;
  last_message_sender_id: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
        Relationships: [];
      };
      book_listings: {
        Row: BookListing;
        Insert: Omit<BookListing, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BookListing, 'id' | 'seller_id' | 'created_at'>>;
        Relationships: [];
      };
      book_favorites: {
        Row: BookFavorite;
        Insert: Omit<BookFavorite, 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Pick<BookFavorite, 'created_at'>>;
        Relationships: [];
      };
      chat_conversations: {
        Row: ChatConversation;
        Insert: {
          id?: string;
          listing_id?: string | null;
          buyer_id: string;
          seller_id: string;
          listing_title: string;
          listing_price: number;
          listing_cover_url?: string | null;
          last_message_text?: string | null;
          last_message_sender_id?: string | null;
          last_message_at?: string | null;
          buyer_unread_count?: number;
          seller_unread_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ChatConversation>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<ChatMessage, 'id' | 'conversation_id' | 'sender_id'>
        >;
        Relationships: [];
      };
    };
    Views: {
      listing_seller_profiles: {
        Row: ListingSellerProfile;
        Relationships: [];
      };
      chat_conversation_summaries: {
        Row: ChatConversationSummary;
        Relationships: [];
      };
    };
    Functions: {
      get_chat_other_participant_profile: {
        Args: { p_conversation_id: string };
        Returns: Array<Pick<Profile, 'id' | 'display_name' | 'avatar_url'>>;
      };
      get_or_create_listing_conversation: {
        Args: { p_listing_id: string };
        Returns: ChatConversation[];
      };
      mark_chat_conversation_read: {
        Args: { p_conversation_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
