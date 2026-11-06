import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components';
import { ScanResult } from '@/features/scan/model/scan_types';
import { IngredientDetailPage } from '@/shared/components/IngredientDetailPage';

export interface S3CompatibilityTabProps {
  scanResult: ScanResult;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onIngredientPress?: (id?: string) => void;
}

/**
 * Container Section 3: Ingredient Compatibility Tab Content (Section 4.7).
 * Shared across Scan and History detail screens.
 * Strictly formatted into 2 clean containers:
 * - Container 1: Compatible Ingredients (with label inside container & interactive tap-to-detail)
 * - Container 2: Incompatible Combinations / Harmful Combinations (matching Reference Image 2:
 *   label inside container, horizontal rule, clickable pill badge wrappers with "+" operator, and clinical reasons)
 *
 * Clicking an ingredient in either container opens the IngredientDetailPage modal.
 */
export const S3CompatibilityTab: React.FC<S3CompatibilityTabProps> = ({
  scanResult,
  isRefreshing,
  onRefresh,
  onIngredientPress,
}) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);

  const compatibleIngredients = scanResult.compatible_ingredients || [];
  const incompatiblePairs = scanResult.incompatible_pairs || [];

  const handleOpenIngredient = (idOrName: string) => {
    setSelectedIngredientId(idOrName);
    onIngredientPress?.(idOrName);
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* ── CONTAINER 1: COMPATIBLE INGREDIENTS (Label inside container) ── */}
        <Card style={2} className="mx-4 mt-4 p-5 items-stretch">
          <Text className="text-caption mb-2 font-sans-bold text-accent uppercase tracking-wide">
            COMPATIBLE INGREDIENTS
          </Text>

          {compatibleIngredients.length > 0 ? (
            compatibleIngredients.map((item, index) => (
              <Pressable
                key={item.id || index}
                onPress={() => handleOpenIngredient(item.id || item.name)}
                className={`py-3 active:opacity-60 ${index !== 0 ? 'border-t border-border/40' : ''}`}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${item.name}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1 mr-2">
                    <View className="w-2 h-2 rounded-full bg-accent" />
                    <Text className="text-body-sm font-sans-bold text-text">
                      {item.name}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={theme.colors.muted} />
                </View>
                {item.reason ? (
                  <Text className="text-caption font-sans text-muted mt-1 leading-4 pl-4">
                    {item.reason}
                  </Text>
                ) : null}
              </Pressable>
            ))
          ) : (
            <Text className="text-body-sm font-sans text-muted py-3">
              No specific compatible ingredient matches found for this profile.
            </Text>
          )}
        </Card>

        {/* ── CONTAINER 2: HARMFUL COMBINATIONS (Replicating Reference Image 2) ── */}
        <Card style={2} className="mx-4 mt-4 mb-6 p-5 items-stretch">
          <Text className="text-caption mb-4 font-sans-bold text-error uppercase tracking-wide">
            HARMFUL COMBINATIONS
          </Text>

          {incompatiblePairs.length > 0 ? (
            incompatiblePairs.map((pair, index) => (
              <View key={index}>
                {/* Badges Row: [Ingredient A Badge] + [Ingredient B Badge] */}
                <View className="flex-row flex-wrap items-center gap-y-2">
                  {/* Ingredient A Badge - Clickable */}
                  <Pressable
                    onPress={() => handleOpenIngredient(pair.ingredient_a)}
                    className="rounded-badge bg-concern border border-concern px-3.5 py-1.5 self-start active:opacity-60"
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${pair.ingredient_a}`}
                  >
                    <Text className="text-body-sm font-sans-medium text-white">
                      {pair.ingredient_a}
                    </Text>
                  </Pressable>

                  {/* Operator Plus */}
                  <Text className="text-body font-sans-bold text-text mx-2.5">
                    +
                  </Text>

                  {/* Ingredient B Badge - Clickable */}
                  <Pressable
                    onPress={() => handleOpenIngredient(pair.ingredient_b)}
                    className="rounded-badge bg-concern border border-concern px-3.5 py-1.5 self-start active:opacity-60"
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${pair.ingredient_b}`}
                  >
                    <Text className="text-body-sm font-sans-medium text-white">
                      {pair.ingredient_b}
                    </Text>
                  </Pressable>
                </View>

                <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider mt-4 mb-1">
                  Explanation
                </Text>

                {/* Rationale / Clinical Conflict Explanation */}
                <Text className="text-body-sm font-sans text-text leading-5">
                  {pair.reason}
                </Text>

                {/* Divider between consecutive pairs */}
                {index < incompatiblePairs.length - 1 ? (
                  <View className="border-b border-border/50 my-4" />
                ) : null}
              </View>
            ))
          ) : (
            <Text className="text-body-sm font-sans text-muted py-2">
              No harmful active clashes or incompatible combinations detected.
            </Text>
          )}
        </Card>
      </ScrollView>

      {/* Ingredient Detail Page Modal */}
      {selectedIngredientId ? (
        <IngredientDetailPage
          visible={Boolean(selectedIngredientId)}
          ingredientId={selectedIngredientId}
          onClose={() => setSelectedIngredientId(null)}
        />
      ) : null}
    </>
  );
};

export default S3CompatibilityTab;

