import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScanAnalyzing } from '../viewmodel/useScanAnalyzing';
import { S1AnalyzingVisual } from './containers/analyzing/s1_AnalyzingVisual';
import { S2AnalyzingStatus } from './containers/analyzing/s2_AnalyzingStatus';
import { S3AnalyzingFooter } from './containers/analyzing/s3_AnalyzingFooter';
import { AnalysisErrorModal } from './components/AnalysisErrorModal';

/**
 * ScanAnalyzingPage (Section 4.5).
 * Full-screen animated AI analysis processing state.
 * Displays real-time progress percentage, circular face preview with glowing green ring,
 * multi-phase pipeline stage transitions, and encrypted data safety reassurance.
 */
export const ScanAnalyzingPage: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    imageUri,
    progress,
    currentStage,
    isError,
    errorMessage,
    handleCancel,
    handleRetry,
    handleDismissError,
  } = useScanAnalyzing();

  return (
    <View
      className="flex-1 bg-neutral-text justify-between"
      style={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      <StatusBar style="light" />

      {/* Top Visual: Screen Title & Circular Face Preview with Animated Glowing Ring */}
      <S1AnalyzingVisual
        imageUri={imageUri}
        progress={progress}
      />

      {/* Center Status: Dynamic Pipeline Stage Headline & Subtext */}
      <S2AnalyzingStatus stage={currentStage} />

      {/* Bottom Actions: Security & Privacy Reassurance + Cancel Analysis Button */}
      <S3AnalyzingFooter onCancel={handleCancel} />

      {/* Error Recovery Modal */}
      <AnalysisErrorModal
        visible={isError}
        message={errorMessage}
        onRetry={handleRetry}
        onCancel={handleDismissError}
      />
    </View>
  );
};

export default ScanAnalyzingPage;
