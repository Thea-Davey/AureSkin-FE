import { theme } from '@/shared/theme';
import { TriangleAlert } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { HistoryIncompatiblePair } from '../../model/history_types';

interface IncompatiblePairCardProps {
  pair: HistoryIncompatiblePair;
}

export function IncompatiblePairCard({ pair }: IncompatiblePairCardProps) {
  return (
    <View className="mb-3 rounded-card border border-status-error/30 bg-card p-4">
      <View className="mb-2 flex-row items-start">
        <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-status-error/10">
          <TriangleAlert size={17} color={theme.colors.error} />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-caption font-sans-semibold text-error">INGREDIENTS TO USE WITH CARE</Text>
          <Text className="text-body font-sans-bold text-text">
            {pair.ingredient_a} + {pair.ingredient_b}
          </Text>
        </View>
      </View>
      <Text className="text-body-sm font-sans text-text">
        {pair.reason || 'No additional interaction details are available for this pair.'}
      </Text>
    </View>
  );
}