import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Signup: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Book: { bookId: string };
  Thread: { chatId: string };
  MyListings: undefined;
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
