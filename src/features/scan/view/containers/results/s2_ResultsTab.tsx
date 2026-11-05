import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { theme } from '@/shared/theme';
import { WarningNote } from '@/shared/components/WarningNote';
import { ScanResult } from '../../../model/scan_types';
import { FacePhotoCard } from '../../components/FacePhotoCard';
import { HealthScoreCard } from '../../components/HealthScoreCard';
import { SkinTypeBanner } from '../../components/SkinTypeBanner';
import { ConditionsCard } from '../../components/ConditionsCard';
import { HistorySavedBanner } from '../../components/HistorySavedBanner';

interface S2ResultsTabProps {
  scanResult: ScanResult;
  imageUri: string;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

/**
 * Container Section 2: Results Tab Content (Section 4.6).
 * Redesigned to strictly match Reference Image 1 with 6 ordered containers:
 * - Container 1: Submitted Face Photo preview
 * - Container 2: Skin Health Score Card with dynamic score-tier gradient & aligned circle
 * - Container 3: Skin Type Card with secondary token gradient & aligned confidence circle
 * - Container 4: Skin Conditions Card with red gradient, circular flame badges, & aligned score pills
 * - Container 5: History Saved confirmation banner
 * - Container 6: Medical Disclaimer Callout (WarningNote)
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
      {/* Container 1: Analyzed Face Photo Preview Card */}
      <FacePhotoCard imageUri={imageUri || scanResult.image_url} />

      {/* Container 2: Skin Health Score Result Card (Score-tier gradient + aligned circle) */}
      <HealthScoreCard
        healthScore={scanResult.health_score}
        summary={scanResult.summary}
      />

      {/* Container 3: Skin Type Result Card (Secondary token gradient + aligned circle) */}
      <SkinTypeBanner
        skinType={scanResult.skin_type}
        confidence={scanResult.skin_type_confidence}
      />

      {/* Container 4: Skin Conditions / Concerns Card (Red gradient + flame badges + aligned pills) */}
      <ConditionsCard conditions={scanResult.conditions} />

      {/* Container 5: Saved to History Confirmation Notice */}
      <HistorySavedBanner />

      {/* Container 6: Medical Disclaimer Note */}
      <WarningNote
        style={2}
        className="mx-4 mt-4"
        title="Disclaimer"
        description="This analysis is intended for educational and informational purposes only and should not be used for the self-diagnosis or treatment of any medical skin condition. If you have concerns about your skin health, please consult a board-certified dermatologist."
      />
    </ScrollView>
  );
};

export default S2ResultsTab;
