import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from './types';
import { colors as c } from '../theme';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { AddBookScreen } from '../screens/AddBookScreen';
import { ChatsScreen } from '../screens/ChatsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BookScreen } from '../screens/BookScreen';
import { ThreadScreen } from '../screens/ThreadScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../localization/i18n';
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const iconNames: { [K in keyof TabParamList]: [string, string] } = {
  Feed: ['home-outline', 'home'],
  Favorites: ['heart-outline', 'heart'],
  Add: ['add-circle-outline', 'add-circle'],
  Chats: ['chatbubble-ellipses-outline', 'chatbubble-ellipses'],
  Profile: ['person-outline', 'person'],
};
function Tabs() {
  const insets = useSafeAreaInsets();
  const labels: { [K in keyof TabParamList]: string } = {
    Feed: t('tabs.feed'),
    Favorites: t('tabs.favorites'),
    Add: t('tabs.add'),
    Chats: t('tabs.chats'),
    Profile: t('tabs.profile'),
  };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.n600,
        tabBarStyle: {
          height: 64 + insets.bottom,
          borderTopWidth: 0,
          borderRadius: 28,
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 0,
          paddingBottom: insets.bottom,
          backgroundColor: c.surface,
        },
        tabBarItemStyle: styles.tabItem,
        tabBarActiveBackgroundColor: c.accent100,
        tabBarLabelStyle: { fontSize: 10.5 },
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={iconNames[route.name][focused ? 1 : 0]}
            color={color}
            size={route.name === 'Add' ? 28 : 23}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ tabBarLabel: labels.Feed }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: labels.Favorites }}
      />
      <Tab.Screen
        name="Add"
        component={AddBookScreen}
        options={{ tabBarLabel: labels.Add }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{ tabBarLabel: labels.Chats }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: labels.Profile }}
      />
    </Tab.Navigator>
  );
}
const styles = StyleSheet.create({
  tabItem: { height: 64, borderRadius: 18, paddingTop: 7, paddingBottom: 6 },
});
export function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: c.bg,
          card: c.surface,
          text: c.text,
          border: c.divider,
          primary: c.accent,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Book" component={BookScreen} />
        <Stack.Screen name="Thread" component={ThreadScreen} />
        <Stack.Screen name="MyListings" component={MyListingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
