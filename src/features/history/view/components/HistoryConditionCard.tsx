import { theme } from '@/shared/theme';
import { CircleAlert } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { HistoryCondition } from '../../model/history_types';

interface HistoryConditionCardProps {
  condition: HistoryCondition;
}

export function HistoryConditionCard({ condition }: HistoryConditionCardProps) {
  return (
    <View className="mb-3 rounded-card border border-border bg-card p-4">
      <View className="mb-2 flex-row items-start">
        <CircleAlert size={20} color={theme.colors.secondary} />
        <Text className="ml-2 flex-1 text-h3 font-sans-bold text-text">{condition.display_name}</Text>
        {typeof condition.confidence === 'number' && (
          <Text className="ml-2 text-caption font-sans-medium text-muted">
            {Math.max(0, Math.min(100, condition.confidence)).toFixed(0)}%
          </Text>
        )}
      </View>
      {condition.description ? (
        <Text className="text-body-sm font-sans text-text">{condition.description}</Text>
      ) : (
        <Text className="text-body-sm font-sans text-muted">No additional description is available for this finding.</Text>
      )}
    </View>
  );
}