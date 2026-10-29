import { theme } from '@/shared/theme';
import { TriangleAlert } from 'lucide-react-native';
import { Text, View } from 'react-native';

export function RoutineDisclaimer() {
  return (
    <View className="flex-row items-start rounded-card border border-status-warning/30 bg-status-warning/10 p-4">
      <TriangleAlert color={theme.colors.secondary} size={20} />
      <View className="ml-3 flex-1">
        <Text className="text-body-sm font-sans-bold text-text">Disclaimer</Text>
        <Text className="mt-1 text-caption font-sans text-text">
          Your routine is AI-generated for general skincare guidance and is not a substitute for
          professional dermatological advice.
        </Text>
      </View>
    </View>
  );
}