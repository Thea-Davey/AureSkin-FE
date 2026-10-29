import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { ScanResult } from '../../../model/scan_types';

interface S3CompatibilityTabProps {
  scanResult: ScanResult;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onIngredientPress?: (id?: string) => void;
}

/**
 * Container Section 3: Ingredient Compatibility Tab Content (Section 4.7).
 * Reverted to original clean card layout:
 * - Compatible Ingredients list with names and clinical reasons
 * - Incompatible Pairs cards with combined ingredient titles and interaction details
 */
export const S3CompatibilityTab: React.FC<S3CompatibilityTabProps> = ({
  scanResult,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
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
      {/* 1. Compatible Ingredients to Skin Type Section */}
      <View className="mt-4 mx-4">
        <View className="flex-row items-center mb-2.5">
          <CheckCircle2 size={18} color={theme.colors.accent} aria-hidden={true} />
          <Text className="ml-1.5 text-body font-sans-bold text-text">
            Compatible Ingredients to Skin Type
          </Text>
        </View>

        <View className="rounded-card border border-border bg-card p-4 shadow-xs">
          {scanResult.compatible_ingredients &&
          scanResult.compatible_ingredients.length > 0 ? (
            scanResult.compatible_ingredients.map((item, index) => (
              <View
                key={item.id || index}
                className={`py-3 ${
                  index !== 0 ? 'border-t border-border/40' : ''
                }`}
              >
                <Text className="text-body-sm font-sans-bold text-text">
                  {item.name}
                </Text>
                {item.reason ? (
                  <Text className="text-caption font-sans text-muted mt-1 leading-4">
                    {item.reason}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text className="text-body-sm font-sans text-muted">
              No specific ingredient matches found.
            </Text>
          )}
        </View>
      </View>

      {/* 2. Incompatible Ingredients to mix Section */}
      <View className="mt-6 mx-4">
        <View className="flex-row items-center mb-2.5">
          <AlertTriangle size={18} color={theme.colors.error} aria-hidden={true} />
          <Text className="ml-1.5 text-body font-sans-bold text-text">
            Incompatible Ingredients to mix
          </Text>
        </View>

        {scanResult.incompatible_pairs &&
        scanResult.incompatible_pairs.length > 0 ? (
          scanResult.incompatible_pairs.map((pair, index) => (
            <View
              key={index}
              className="rounded-card border border-border bg-card p-4 mb-3 shadow-xs"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-body-sm font-sans-bold text-error">
                  {pair.ingredient_a} + {pair.ingredient_b}
                </Text>
              </View>
              <Text className="text-body-sm font-sans text-muted mt-1.5 leading-5">
                {pair.reason}
              </Text>
            </View>
          ))
        ) : (
          <View className="rounded-card border border-border bg-card p-4 shadow-xs">
            <Text className="text-body-sm font-sans text-muted">
              No harmful active clashes detected.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
