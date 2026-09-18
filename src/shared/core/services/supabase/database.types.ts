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

export type ListingSellerProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  listings_count: number;
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
    };
    Views: {
      listing_seller_profiles: {
        Row: ListingSellerProfile;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
