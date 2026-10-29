import { Redirect } from 'expo-router';
import { useAuthStore } from '../shared/store/authStore';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
