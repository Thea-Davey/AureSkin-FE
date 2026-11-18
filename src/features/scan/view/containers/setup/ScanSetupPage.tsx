import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, BackHandler } from 'react-native';
import { useScanSetup } from '../../../viewmodel/useScanSetup';
import { SetupHeader } from '../../components/SetupHeader';
import { SetupSubmitFooter } from '../../components/SetupSubmitFooter';
import { AnalysisTypeCard } from '../../components/AnalysisTypeCard';
import { SkinTypeQuestionnaireCard } from '../../components/SkinTypeQuestionnaireCard';
import { ShotTypeCard } from '../../components/ShotTypeCard';
import { CapturePhotoCard } from '../../components/CapturePhotoCard';
import { PopUpDialog, PopUpDialogAction, FixedBackgroundPattern } from '@/shared/components';

/**
 * ScanSetupPage Container (Section 4.0 / Set Up Your Skin Analysis)
 * Layout matching Images 1, 2, and 3:
 * - Fixed top SetupHeader
 * - Scrollable middle cards: AnalysisTypeCard, SkinTypeQuestionnaireCard (conditional),
 *   ShotTypeCard, CapturePhotoCard
 * - Fixed bottom SetupSubmitFooter with real-time validation and submit action
 * - Exit confirmation PopUpDialog with Save as draft / Keep editing / Discard options
 */
export const ScanSetupPage: React.FC = () => {
  const {
    enhancedSkinAnalysis,
    shotType,
    photos,
    isQuestionnaireCompleted,
    requiredPhotosCount,
    uploadedCount,
    hasUploadedPhotos,
    canSubmit,
    footerStatus,
    toggleEnhancedAnalysis,
    selectShotType,
    handleUploadPhotos,
    handleTakePhotos,
    handleRetakePhoto,
    handleRetakeAll,
    handleClearAllPhotos,
    handleAnswerQuestionnaire,
    handleReviewAnswers,
    handleRetakeQuestionnaire,
    handleCancel,
    handleSubmit,
    isExitDialogOpen,
    openExitDialog,
    closeExitDialog,
    handleSaveAsDraft,
    handleDiscard,
  } = useScanSetup();

  // Intercept hardware back button on Android to prompt the exit dialog
  useEffect(() => {
    const onBackPress = () => {
      openExitDialog();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [openExitDialog]);

  const exitActions: PopUpDialogAction[] = useMemo(
    () => [
      {
        label: 'Save as draft',
        variant: 'primary',
        onPress: handleSaveAsDraft,
      },
      {
        label: 'Keep editing',
        variant: 'outline',
        onPress: closeExitDialog,
      },
      {
        label: 'Discard',
        variant: 'danger',
        onPress: handleDiscard,
      },
    ],
    [handleSaveAsDraft, closeExitDialog, handleDiscard]
  );

  return (
    <View className="flex-1 bg-primary relative">
      {/* Aligned Fixed Background Pattern */}
      <FixedBackgroundPattern />

      {/* Fixed Top Header */}
      <SetupHeader />

      {/* Scrollable Setup Options */}
      <ScrollView
        className="flex-1 px-5 pt-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Card 3: Shot Type */}
        <ShotTypeCard
          selectedType={shotType}
          onSelectType={selectShotType}
        />

        {/* Card 4: Capture Photo */}
        <CapturePhotoCard
          shotType={shotType}
          photos={photos}
          uploadedCount={uploadedCount}
          requiredCount={requiredPhotosCount}
          hasUploadedPhotos={hasUploadedPhotos}
          onUpload={handleUploadPhotos}
          onTakePhoto={handleTakePhotos}
          onRetakePhoto={handleRetakePhoto}
          onRetakeAll={handleRetakeAll}
          onClearAll={handleClearAllPhotos}
        />

        {/* Card 1: Analysis Type */}
        <AnalysisTypeCard
          enabled={enhancedSkinAnalysis}
          onToggle={toggleEnhancedAnalysis}
        />

        {/* Card 2: Skin Type Questionnaire (Visible only when enhanced analysis is enabled) */}
        {enhancedSkinAnalysis && (
          <SkinTypeQuestionnaireCard
            isCompleted={isQuestionnaireCompleted}
            onAnswer={handleAnswerQuestionnaire}
            onRetake={handleRetakeQuestionnaire}
            onReview={handleReviewAnswers}
          />
        )}

      </ScrollView>

      {/* Fixed Bottom Review / Submit Footer */}
      <SetupSubmitFooter
        isReady={footerStatus.isReady}
        statusHeader={footerStatus.header}
        statusSubtitle={footerStatus.subtitle}
        canSubmit={canSubmit}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

      {/* Exit Setup Confirmation Dialog */}
      <PopUpDialog
        visible={isExitDialogOpen}
        title="Leave Setup?"
        subtitle="You have unsaved setup progress."
        body="Would you like to save your captured photos and questionnaire as a draft, or discard changes?"
        onClose={closeExitDialog}
        actions={exitActions}
      />
    </View>
  );
};

export default ScanSetupPage;
