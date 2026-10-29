import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScanSubmit } from '../viewmodel/useScanSubmit';
import { S1SubmitHeader } from './containers/s1_SubmitHeader';
import { S2PhotoPreview } from './containers/s2_PhotoPreview';
import { SubmitControls } from './components/SubmitControls';
import { SkinGuidanceModal } from './components/SkinGuidanceModal';

/**
 * ScanSubmitPage (Section 4.4).
 * Photo review and confirmation screen before deep learning analysis.
 * Allows users to inspect their face photo, retake/reselect, or submit to the analysis pipeline.
 */
export const ScanSubmitPage: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    imageUri,
    isGuidanceVisible,
    guidanceTips,
    isImageError,
    isSubmitting,
    openGuidanceModal,
    closeGuidanceModal,
    handleRetake,
    handleSubmit,
    handleClose,
    handleImageError,
  } = useScanSubmit();

  return (
    <View
      className="flex-1 bg-neutral-text justify-between"
      style={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <StatusBar style="light" />

      {/* Top Header: Help (?), Title "Analyze Skin", Close (X) */}
      <S1SubmitHeader
        onOpenGuidance={openGuidanceModal}
        onClose={handleClose}
      />

      {/* Center: Face Photo Preview & Guidance Banner */}
      <S2PhotoPreview
        imageUri={imageUri}
        isImageError={isImageError}
        onImageError={handleImageError}
      />

      {/* Bottom: Retake and Submit Photo Action Controls */}
      <SubmitControls
        isSubmitting={isSubmitting}
        onRetake={handleRetake}
        onSubmit={handleSubmit}
      />

      {/* Slide-up Skin Test Guidelines Modal */}
      <SkinGuidanceModal
        visible={isGuidanceVisible}
        onClose={closeGuidanceModal}
        tips={guidanceTips}
      />
    </View>
  );
};

export default ScanSubmitPage;

