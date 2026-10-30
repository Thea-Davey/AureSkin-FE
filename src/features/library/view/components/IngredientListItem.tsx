import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { Ingredient } from '../../model/library_types';
import { CompatibilityBadge } from './CompatibilityBadge';

interface IngredientListItemProps {
  ingredient: Ingredient;
  isFavorite: boolean;
  isCompatible?: boolean;
  isFirstInSection?: boolean;
  onPress: (id: string) => void;
  onFavoritePress: (id: string) => void;
}

export function IngredientListItem({
  ingredient,
  isFavorite,
  isCompatible = false,
  isFirstInSection = false,
  onPress,
  onFavoritePress,
}: IngredientListItemProps) {
  const previewText =
    ingredient.preview_description ??
    ingredient.description ??
    'Learn more about this ingredient in the detail view.';

  return (
    <Animated.View entering={FadeIn}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View details for ${ingredient.name}`}
        accessibilityHint="Opens ingredient details"
        onPress={() => onPress(ingredient.id)}
        className={`mx-5 mb-3 rounded-card border border-border bg-card px-5 py-4 shadow-sm active:opacity-80 ${
          isFirstInSection ? 'mt-3' : ''
        }`}
      >
        {/* Row 1: [Col 1: Ingredient Name] [Col 2: Compact Compatibility Badge + Favorite Button (Top Aligned)] */}
        <View className="flex-row items-start justify-between gap-3">
          <Text className="min-w-0 flex-1 text-body font-sans-bold text-text">
            {ingredient.name}
          </Text>

          {/* Right Action Container: Top-aligned Compact Compatibility Badge + Favorite Star */}
          <View className="flex-row items-center gap-2 shrink-0 self-start pt-0.5">
            {isCompatible ? (
              <CompatibilityBadge status="compatible" compact />
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite
                  ? `Remove ${ingredient.name} from favorites`
                  : `Add ${ingredient.name} to favorites`
              }
              accessibilityState={{ selected: isFavorite }}
              onPress={() => onFavoritePress(ingredient.id)}
              hitSlop={8}
              className="p-1 active:opacity-70"
            >
              <Animated.View key={String(isFavorite)} entering={ZoomIn.duration(160)}>
                <Star
                  size={20}
                  color={isFavorite ? theme.colors.secondary : theme.colors.text}
                  fill={isFavorite ? theme.colors.secondary : 'transparent'}
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* Row 2: Full-width Preview Description */}
        <Text
          numberOfLines={3}
          className="mt-2 text-body-sm font-sans text-muted leading-5"
        >
          {previewText}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
