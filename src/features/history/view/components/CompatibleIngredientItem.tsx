import { theme } from '@/shared/theme';
import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { HistoryCompatibleIngredient } from '../../model/history_types';

interface CompatibleIngredientItemProps {
  ingredient: HistoryCompatibleIngredient;
  index: number;
}

export function CompatibleIngredientItem({ ingredient, index }: CompatibleIngredientItemProps) {
  return (
    <View className={`flex-row items-start border-b border-border/60 px-4 py-3.5 ${index % 2 === 0 ? 'bg-background/70' : 'bg-card'}`}>
      <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-status-success/15">
        <Check size={15} color={theme.colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-body font-sans-semibold text-text">{ingredient.name}</Text>
        {ingredient.reason && (
          <Text className="mt-1 text-body-sm font-sans text-muted">{ingredient.reason}</Text>
        )}
      </View>
    </View>
  );
}