import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { ChevronRight, ShieldAlert, Baby, Clock } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card, FilterBadge, FilterSpecificBadge, PopUpPanel } from '@/shared/components';
import { ScanResult, FilteredIngredient } from '@/features/scan/model/scan_types';
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
 * - Container 1: Compatible Ingredients (with FilterBadge & interactive tap-to-detail)
 * - Container 2: Incompatible Combinations / Harmful Combinations (matching Reference Image 2:
 *   label inside container, horizontal rule, clickable pill badge wrappers with "+" operator, and clinical reasons)
 *
 * Clicking an ingredient opens the IngredientDetailPage modal.
 * Clicking FilterBadge opens PopUpPanel (Style 2) displaying clinical exclusions.
 */
export const S3CompatibilityTab: React.FC<S3CompatibilityTabProps> = ({
  scanResult,
  isRefreshing,
  onRefresh,
  onIngredientPress,
}) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const compatibleIngredients = scanResult.compatible_ingredients || [];
  const incompatiblePairs = scanResult.incompatible_pairs || [];
  const filteredIngredients: FilteredIngredient[] = scanResult.filtered_ingredients || [];

  const allergenFiltered = filteredIngredients.filter(
    (item) => item.filter_type?.toLowerCase() === 'allergen'
  );
  const pregnancyFiltered = filteredIngredients.filter(
    (item) => item.filter_type?.toLowerCase() === 'pregnancy' || item.filter_type?.toLowerCase() === 'pregnant'
  );
  const ageFiltered = filteredIngredients.filter(
    (item) => item.filter_type?.toLowerCase() === 'age'
  );
  const otherFiltered = filteredIngredients.filter(
    (item) =>
      !['allergen', 'pregnancy', 'pregnant', 'age'].includes(item.filter_type?.toLowerCase() || '')
  );

  const handleOpenIngredient = (idOrName: string) => {
    setSelectedIngredientId(idOrName);
    onIngredientPress?.(idOrName);
  };

  const renderFilteredItem = (item: FilteredIngredient, index: number) => {
    const targetKey = item.id || item.ingredient_id || `${item.name}-${index}`;
    return (
      <Pressable
        key={targetKey}
        onPress={() => handleOpenIngredient(item.name || item.ingredient_id)}
        accessibilityRole="button"
        accessibilityLabel={`View details for filtered ingredient ${item.name}`}
        className="mb-2.5 rounded-card border border-border/70 bg-neutral-offwhite/80 p-3.5 active:opacity-70"
      >
        <View className="flex-row items-center justify-between">
          <View className="mr-2 flex-1 flex-row items-center gap-2">
            <Text className="text-body-sm font-sans-bold text-text">
              {item.name}
            </Text>
            <FilterSpecificBadge type={item.filter_type} />
          </View>
          <ChevronRight size={16} color={theme.colors.muted} />
        </View>
        {item.reason ? (
          <Text className="mt-1.5 text-caption font-sans text-text leading-4">
            {item.reason}
          </Text>
        ) : null}
        {item.details ? (
          <Text className="mt-1 text-caption font-sans text-muted leading-4">
            {item.details}
          </Text>
        ) : null}
      </Pressable>
    );
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
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-caption font-sans-bold text-accent uppercase tracking-wide">
              COMPATIBLE INGREDIENTS
            </Text>
            {filteredIngredients.length > 0 ? (
              <FilterBadge
                count={filteredIngredients.length}
                onPress={() => setIsFilterPanelOpen(true)}
              />
            ) : null}
          </View>

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

      {/* PopUpPanel (Style 2: Content-only) for Filtered Ingredients */}
      <PopUpPanel
        visible={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        style={2}
        title="Filtered Ingredients"
        subtitle="Ingredients excluded based on your profile constraints"
        maxHeightClass="max-h-[85%]"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {/* Section 1: Allergen Sensitivities */}
          {allergenFiltered.length > 0 ? (
            <View className="mb-4">
              <View className="mb-2.5 flex-row items-center gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-concern/15">
                  <ShieldAlert size={14} color={theme.colors.concern} />
                </View>
                <Text className="text-body-sm font-sans-bold text-text">
                  Allergen Sensitivities ({allergenFiltered.length})
                </Text>
              </View>
              {allergenFiltered.map(renderFilteredItem)}
            </View>
          ) : null}

          {/* Section 2: Pregnancy Cautions */}
          {pregnancyFiltered.length > 0 ? (
            <View className="mb-4">
              <View className="mb-2.5 flex-row items-center gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-concern/15">
                  <Baby size={14} color={theme.colors.concern} />
                </View>
                <Text className="text-body-sm font-sans-bold text-text">
                  Pregnancy Cautions ({pregnancyFiltered.length})
                </Text>
              </View>
              {pregnancyFiltered.map(renderFilteredItem)}
            </View>
          ) : null}

          {/* Section 3: Age Group Restrictions */}
          {ageFiltered.length > 0 ? (
            <View className="mb-4">
              <View className="mb-2.5 flex-row items-center gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-concern/15">
                  <Clock size={14} color={theme.colors.concern} />
                </View>
                <Text className="text-body-sm font-sans-bold text-text">
                  Age Group Suitability ({ageFiltered.length})
                </Text>
              </View>
              {ageFiltered.map(renderFilteredItem)}
            </View>
          ) : null}

          {/* Fallback Section (Other/Custom) */}
          {otherFiltered.length > 0 ? (
            <View className="mb-4">
              <Text className="mb-2 text-body-sm font-sans-bold text-text">
                Other Profile Filters ({otherFiltered.length})
              </Text>
              {otherFiltered.map(renderFilteredItem)}
            </View>
          ) : null}

          {filteredIngredients.length === 0 ? (
            <Text className="py-6 text-center text-body-sm font-sans text-muted">
              No excluded ingredients recorded for this profile.
            </Text>
          ) : null}
        </ScrollView>
      </PopUpPanel>

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


