import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { t } from '../localization/i18n';
import {
  AddBookScreen,
  BookScreen,
  ChatsScreen,
  CompleteProfileScreen,
  FavoritesScreen,
  FeedScreen,
  MyListingsScreen,
  ProfileScreen,
  SignupScreen,
  ThreadScreen,
  WelcomeScreen,
} from '../screens';
import { useTheme } from '../theme';
import { useStyles } from './RootNavigator.styles';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const iconNames: { [K in keyof TabParamList]: [string, string] } = {
  Feed: ['home-outline', 'home'],
  Favorites: ['heart-outline', 'heart'],
  Add: ['add-circle-outline', 'add-circle'],
  Chats: ['chatbubble-ellipses-outline', 'chatbubble-ellipses'],
  Profile: ['person-outline', 'person'],
};

type TabIconProps = {
  focused: boolean;
  color: string;
};

function TabIcon({
  routeName,
  focused,
  color,
}: TabIconProps & { routeName: keyof TabParamList }) {
  const styles = useStyles();

  return (
    <Ionicons
      name={iconNames[routeName][focused ? 1 : 0]}
      color={color}
      size={
        routeName === 'Add' ? styles.iconSizes.add : styles.iconSizes.default
      }
    />
  );
}

const tabIconRenderers: {
  [K in keyof TabParamList]: (props: TabIconProps) => React.ReactNode;
} = {
  Feed: props => <TabIcon {...props} routeName="Feed" />,
  Favorites: props => <TabIcon {...props} routeName="Favorites" />,
  Add: props => <TabIcon {...props} routeName="Add" />,
  Chats: props => <TabIcon {...props} routeName="Chats" />,
  Profile: props => <TabIcon {...props} routeName="Profile" />,
};

function Tabs() {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
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
        tabBarActiveTintColor: theme.palette.text,
        tabBarInactiveTintColor: theme.palette.neutral600,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveBackgroundColor: theme.palette.accent100,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: tabIconRenderers[route.name],
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

export function RootNavigator() {
  const styles = useStyles();
  const { theme } = useTheme();
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.palette.accent} />
      </View>
    );
  }

  const needsProfile = Boolean(session && !profile?.onboarding_completed);

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.palette.background,
          card: theme.palette.white,
          text: theme.palette.text,
          border: theme.palette.divider,
          primary: theme.palette.accent,
        },
      }}
    >
      <Stack.Navigator
        key={needsProfile ? 'profile' : session ? 'signed-in' : 'signed-out'}
        initialRouteName={
          needsProfile ? 'CompleteProfile' : session ? 'Tabs' : 'Welcome'
        }
        screenOptions={{
          headerShown: false,
          contentStyle: styles.content,
        }}
      >
        {needsProfile ? (
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
          />
        ) : (
          <>
            {!session && (
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )}
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Book" component={BookScreen} />
            <Stack.Screen name="Thread" component={ThreadScreen} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
