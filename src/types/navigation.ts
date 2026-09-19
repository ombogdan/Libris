import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Signup: undefined;
  CompleteProfile: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Book: { bookId: string };
  Thread: { chatId: string };
  MyListings: undefined;
  EditListing: { bookId: string };
  UserReviews: { userId: string; displayName?: string };
  UserProfile: { userId: string; displayName?: string };
};
export type TabParamList = {
  Feed: undefined;
  Favorites: undefined;
  Add: undefined;
  Chats: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
