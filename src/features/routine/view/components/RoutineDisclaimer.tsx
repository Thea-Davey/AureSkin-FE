import { theme } from '@/shared/theme';
import { ShieldAlert } from 'lucide-react-native';
import { Text, View } from 'react-native';

export function RoutineDisclaimer() {
  return (
    <View className="flex-row rounded-card border border-status-warning/30 bg-status-warning/10 p-4">
      <ShieldAlert size={21} color={theme.colors.secondary} />
      <View className="ml-3 flex-1">
        <Text className="mb-1 text-body-sm font-sans-bold text-text">Disclaimer</Text>
        <Text className="text-caption font-sans text-text">
          This routine is AI-generated and is not a substitute for professional dermatological advice.
        </Text>
      </View>
    </View>
  );
}