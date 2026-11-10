import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import { theme } from '../theme';
import { Card } from './Card';
import { CompatibilityBadge } from './CompatibilityBadge';
import { Ingredient } from '../../features/library/model/library_types';

export interface IngredientCardProps {
  ingredient: Ingredient;
  isFavorite: boolean;
  isCompatible?: boolean;
  isFirstInSection?: boolean;
  onPress: (id: string) => void;
  onFavoritePress: (id: string) => void;
  className?: string;
}

/**
 * IngredientCard
 * Global shared card component for rendering an ingredient row with preview text,
 * compact compatibility badge, and favorite toggle action.
 */
export function IngredientCard({
  ingredient,
  isFavorite,
  isCompatible = false,
  isFirstInSection = false,
  onPress,
  onFavoritePress,
  className = '',
}: IngredientCardProps) {
  const previewText =
    ingredient.preview_description ??
    ingredient.description ??
    'Learn more about this ingredient in the detail view.';

  return (
    <Card
      style={2}
      className={`mx-5 mb-3 px-5 py-4 self-stretch items-stretch ${
        isFirstInSection ? 'mt-3' : ''
      } ${className}`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View details for ${ingredient.name}`}
        accessibilityHint="Opens ingredient details"
        onPress={() => onPress(ingredient.id)}
        className="w-full active:opacity-85"
      >
        {/* Row 1: [Col 1: Ingredient Name] [Col 2: Compact Compatibility Badge + Favorite Button (Top Aligned)] */}
        <View className="w-full flex-row items-start justify-between gap-3">
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
              className="active:opacity-70"
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
          className="w-full mt-2 text-body-sm font-sans text-muted leading-5"
        >
          {previewText}
        </Text>
      </Pressable>
    </Card>
  );
}

export default IngredientCard;

