import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { theme } from '@/shared/theme';
import { ScanResult } from '../../../model/scan_types';
import { FacePhotoCard } from '../../components/FacePhotoCard';
import { SkinTypeBanner } from '../../components/SkinTypeBanner';
import { HealthScoreCard } from '../../components/HealthScoreCard';
import { ConditionDetailCard } from '../../components/ConditionDetailCard';

interface S2ResultsTabProps {
  scanResult: ScanResult;
  imageUri: string;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

/**
 * Container Section 2: Results Tab Content.
 * Scrollable presentation of the primary scan findings:
 * Analyzed Face Photo, Skin Type Banner with confidence badge,
 * Health Score meter, and stacked dermatological Concern/s cards.
 */
export const S2ResultsTab: React.FC<S2ResultsTabProps> = ({
  scanResult,
  imageUri,
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
      {/* 1. Analyzed Face Photo Preview Card */}
      <FacePhotoCard imageUri={imageUri || scanResult.image_url} />

      {/* 2. Diagnosed Skin Type Banner with Confidence Badge */}
      <SkinTypeBanner
        skinType={scanResult.skin_type}
        confidence={scanResult.skin_type_confidence}
      />

      {/* 3. Skin Health Score Metric Card */}
      <HealthScoreCard
        healthScore={scanResult.health_score}
        summary={scanResult.summary}
      />

      {/* 4. Concern/s Heading & Condition Detail Cards */}
      <View className="mt-5">
        <Text className="text-h3 font-sans-bold text-text mx-4 mb-3">
          Concern/s
        </Text>

        {scanResult.conditions && scanResult.conditions.length > 0 ? (
          scanResult.conditions.map((condition) => (
            <ConditionDetailCard
              key={condition.id}
              condition={condition}
            />
          ))
        ) : (
          <View className="mx-4 p-5 rounded-card bg-card border border-border shadow-xs">
            <Text className="text-body-sm font-sans text-muted text-center">
              No active skin conditions detected. Your skin barrier appears healthy and balanced.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
