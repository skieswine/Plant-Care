// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { configureNotificationHandler } from '../utils/notificationUtils';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../hooks/useT';
import { useTheme } from '../hooks/useTheme';
import '../global.css';

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useT();

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.header} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: t('common.back'),
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="plant/add"
          options={{
            title: t('plant.newTitle'),
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="room/add"
          options={{
            title: t('room.newTitle'),
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
