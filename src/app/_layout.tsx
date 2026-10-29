import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LogBox, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import '../global.css';
import { useAuthStore } from '../shared/store/authStore';

// Silence development-only navigation registration warnings
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  "The action 'ROUTE_NAMES_CHANGED'",
]);

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isTermsScreen = segments[1] === 'terms';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup && !isTermsScreen) {
      // Redirect to home if authenticated and trying to access login/register (allow terms)
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-offwhite">
        <Text className="text-h3 text-neutral-text font-sans-medium">Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="history/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="favorites" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="about" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="help" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="scan/camera" options={{ animation: 'fade' }} />
      </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
