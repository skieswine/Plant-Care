// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { configureNotificationHandler } from '../utils/notificationUtils';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    configureNotificationHandler();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#f0faf5" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#f0faf5' },
          headerTintColor: '#2d4a30',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#faf8f3' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="plant/add"
          options={{
            title: 'Нова рослина 🌱',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="room/add"
          options={{
            title: 'Нова кімната',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
