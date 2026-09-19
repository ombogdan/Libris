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
  review_count: number;
  rating_average: number;
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
  is_deleted: boolean;
  deleted_at: string | null;
  sold_at: string | null;
  sold_conversation_id: string | null;
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
  archived_at: string | null;
  archive_reason: 'sold' | 'deleted' | 'hidden' | null;
  review_enabled: boolean;
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
  rating_average: number;
  review_count: number;
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
  section: 'buying' | 'selling' | 'archive';
  archived_at: string | null;
  archive_reason: 'sold' | 'deleted' | 'hidden' | null;
  can_review: boolean;
  my_review_rating: number | null;
  created_at: string;
  updated_at: string;
};

export type BookListingImage = {
  listing_id: string;
  storage_path: string;
  public_url: string;
  position: number;
  created_at: string;
};

export type Review = {
  id: string;
  conversation_id: string | null;
  listing_id: string | null;
  listing_title: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type ProfileReviewSummary = {
  user_id: string;
  rating_average: number;
  review_count: number;
};

export type UserReviewDetail = {
  id: string;
  listing_title: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar_url: string | null;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<
          Profile,
          'created_at' | 'updated_at' | 'review_count' | 'rating_average'
        > & {
          review_count?: number;
          rating_average?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Pick<
            Profile,
            | 'display_name'
            | 'phone'
            | 'email'
            | 'avatar_url'
            | 'city'
            | 'latitude'
            | 'longitude'
            | 'onboarding_completed'
            | 'updated_at'
          >
        >;
        Relationships: [];
      };
      book_listings: {
        Row: BookListing;
        Insert: Omit<
          BookListing,
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'is_deleted'
          | 'deleted_at'
          | 'sold_at'
          | 'sold_conversation_id'
        > & {
          id?: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          sold_at?: string | null;
          sold_conversation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Pick<
            BookListing,
            | 'title'
            | 'author'
            | 'price'
            | 'category'
            | 'condition'
            | 'description'
            | 'city'
            | 'latitude'
            | 'longitude'
            | 'cover_url'
            | 'image_urls'
            | 'updated_at'
          >
        >;
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
      book_listing_images: {
        Row: BookListingImage;
        Insert: Omit<BookListingImage, 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Pick<BookListingImage, 'position' | 'public_url'>>;
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
          archived_at?: string | null;
          archive_reason?: 'sold' | 'deleted' | 'hidden' | null;
          review_enabled?: boolean;
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
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Pick<Review, 'rating' | 'comment' | 'updated_at'>>;
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
      profile_review_summaries: {
        Row: ProfileReviewSummary;
        Relationships: [];
      };
      user_review_details: {
        Row: UserReviewDetail;
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
      soft_delete_book_listing: {
        Args: { p_listing_id: string };
        Returns: undefined;
      };
      mark_book_listing_sold: {
        Args: {
          p_listing_id: string;
          p_conversation_id?: string | null;
        };
        Returns: undefined;
      };
      reactivate_book_listing: {
        Args: { p_listing_id: string };
        Returns: undefined;
      };
      submit_conversation_review: {
        Args: {
          p_conversation_id: string;
          p_rating: number;
          p_comment?: string;
        };
        Returns: Review;
      };
      claim_listing_purge_batch: {
        Args: { p_limit?: number };
        Returns: Array<{ listing_id: string; storage_paths: string[] }>;
      };
      record_listing_purge_failure: {
        Args: { p_listing_id: string; p_error: string };
        Returns: undefined;
      };
      finalize_listing_purge: {
        Args: { p_listing_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
