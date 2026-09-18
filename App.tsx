import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useStyles } from './App.styles';
import { AuthProvider } from 'providers/auth/AuthProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStoreProvider, useAppStore } from 'store/AppStore';
import { ThemeProvider, useTheme } from 'shared/theme';

function AppContent() {
  const styles = useStyles();
  const { theme } = useTheme();
  const { toast } = useAppStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.palette.background}
      />
      <RootNavigator />
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function ThemedApp() {
  const styles = useStyles();

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppStoreProvider>
            <AppContent />
          </AppStoreProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
