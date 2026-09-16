import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStoreProvider, useAppStore } from './src/store/AppStore';
import { colors as c, shadow } from './src/theme';
import { AuthProvider } from './src/auth/AuthProvider';

function AppContent() {
  const { toast } = useAppStore();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={c.bg} />
      <RootNavigator />
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: c.bg },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 96,
    backgroundColor: c.violet800,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    ...shadow,
  },
  toastText: { fontSize: 13.5, color: c.n100, textAlign: 'center' },
});
