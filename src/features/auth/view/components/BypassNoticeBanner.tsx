import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export function BypassNoticeBanner() {
  return (
    <View className="bg-status-error/10 border border-status-error rounded-card p-3 mb-4">
      <View className="flex-row items-center gap-2 mb-1">
        <AlertCircle size={16} color={theme.colors.error} />
        <Text className="text-body-sm font-sans-bold text-status-error">
          Dev Bypass Mode Active
        </Text>
      </View>
      <Text className="text-caption font-sans text-status-error/90">
        Backend authentication is bypassed for offline UI development. You do not need to enter credentials—simply tap &quot;Sign in&quot; below to enter the app.
      </Text>
    </View>
  );
}
