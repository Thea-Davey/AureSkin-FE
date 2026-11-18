import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { theme } from '@/shared/theme';
import { WarningNote } from '@/shared/components/WarningNote';
import { FixedBackgroundPattern } from '@/shared/components/FixedBackgroundPattern';
import { ScanResult } from '@/features/scan/model/scan_types';
import { FacePhotoCard } from '../components/FacePhotoCard';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { SkinTypeBanner } from '../components/SkinTypeBanner';
import { ConditionsCard } from '../components/ConditionsCard';
import { HistorySavedBanner } from '../components/HistorySavedBanner';

export interface S2ResultsTabProps {
  scanResult: ScanResult;
  imageUri: string;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  /** Controls visibility of the HistorySavedBanner (hidden by default since results require explicit Save) */
  showHistorySavedBanner?: boolean;
  /** Optional scroll listener for collapsible footer animations */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Bottom padding for scroll content (defaults to 48) */
  contentPaddingBottom?: number;
}

/**
 * Container Section 2: Results Tab Content (Section 4.6).
 * Shared across Scan and History detail screens.
 * Contains 6 ordered containers:
 * - Container 1: Submitted Face Photo preview
 * - Container 2: Skin Health Score Card with dynamic score-tier gradient & aligned circle
 * - Container 3: Skin Type Card with secondary token gradient & aligned confidence circle
 * - Container 4: Skin Conditions Card with red gradient, circular flame badges, & aligned score pills
 * - Container 5: History Saved confirmation banner (hidden by default)
 * - Container 6: Medical Disclaimer Callout (WarningNote)
 */
export const S2ResultsTab: React.FC<S2ResultsTabProps> = ({
  scanResult,
  imageUri,
  isRefreshing,
  onRefresh,
  showHistorySavedBanner = false,
  onScroll,
  contentPaddingBottom = 48,
}) => {
  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <FixedBackgroundPattern />
      <ScrollView
        className="flex-1 bg-transparent"
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Container 1: Analyzed Face Photo Preview Card */}
        <FacePhotoCard
          imageUri={imageUri || scanResult.image_url}
          fallbackUri={scanResult.image_url}
          shotType={scanResult.shot_type}
          imageUrls={scanResult.image_urls}
        />

        {/* Container 2: Skin Health Score Metric Card */}
        <HealthScoreCard
          healthScore={scanResult.health_score}
          summary={scanResult.summary}
        />

        {/* Container 3: Diagnosed Skin Type Classification Card */}
        <SkinTypeBanner
          skinType={scanResult.skin_type}
          confidence={scanResult.skin_type_confidence}
          description={scanResult.skin_type_description}
        />

        {/* Container 4: Detected Dermatological Conditions Card */}
        <ConditionsCard conditions={scanResult.conditions} />

        {/* Container 5: History Saved Confirmation Card (hidden by default) */}
        {showHistorySavedBanner && <HistorySavedBanner />}

        {/* Container 6: Medical Disclaimer Note */}
        <View className="mx-4 mt-4">
          <WarningNote
            style={2}
            title="Clinical Disclaimer"
            description="AureSkin analysis provides supportive cosmetic insights and ingredient compatibility guidance. It is not intended to replace formal dermatological diagnosis or medical prescriptions."
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default S2ResultsTab;
