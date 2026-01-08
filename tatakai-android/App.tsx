import React, { useEffect } from 'react';
import { StatusBar, View, StyleSheet, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/lib/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  useEffect(() => {
    // Set status bar style
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(colors.background);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.background}
            translucent={false}
          />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
