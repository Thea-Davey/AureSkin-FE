import { Pressable, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ingredient } from '../../model/library_types';

interface IngredientListItemProps {
  ingredient: Ingredient;
  index: number;
  onPress: (id: string) => void;
}

export function IngredientListItem({
  ingredient,
  index,
  onPress,
}: IngredientListItemProps) {
  return (
    <Animated.View entering={FadeIn}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View details for ${ingredient.name}`}
        accessibilityHint="Opens ingredient details"
        onPress={() => onPress(ingredient.id)}
        className={`mb-3 rounded-card border border-border px-5 py-4 shadow-sm active:opacity-80 ${
          index % 2 === 0 ? 'bg-card' : 'bg-neutral-offwhite'
        }`}
      >
        <Text className="text-body-sm font-sans-medium text-text">
          {ingredient.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
