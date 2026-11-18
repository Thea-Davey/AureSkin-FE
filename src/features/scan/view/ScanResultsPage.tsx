import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../shared/theme';
import { DeleteDialog, NotifDialog } from '@/shared/components';
import { useScanResults } from '../viewmodel/useScanResults';
import { S1ResultsHeader } from './containers/results/s1_ResultsHeader';
import { S2ResultsTab } from '@/shared/pages/scan_results/containers/s2_ResultsTab';
import { S3CompatibilityTab } from '@/shared/pages/scan_results/containers/s3_CompatibilityTab';
import { SaveFooter } from '@/shared/pages/scan_results/components/SaveFooter';

/**
 * ScanResultsPage (Section 4.6 & 4.7).
 * Primary findings dashboard displaying analyzed face photo, predicted skin type
 * with classification confidence, health score metric, detected dermatological conditions,
 * ingredient compatibility tabs, and the sticky SaveFooter (Discard / Save).
 */
export const ScanResultsPage: React.FC = () => {
  const {
    scanResult,
    displayImageUri,
    activeTab,
    isLoading,
    isRefreshing,
    isDiscarding,
    isSaveSuccessOpen,
    isDiscardDialogOpen,
    isFooterVisible,
    error,
    setTab,
    handleIngredientPress,
    handleSavePress,
    handleSuccessGoHome,
    handleSuccessViewHistory,
    openDiscardDialog,
    closeDiscardDialog,
    handleConfirmDiscard,
    handleScroll,
    onRefresh,
    retry,
  } = useScanResults();

  // Intercept Android hardware back press so user chooses Save or Discard explicitly
  useEffect(() => {
    const onBackPress = () => {
      if (isSaveSuccessOpen) {
        handleSuccessGoHome();
        return true;
      }
      if (isDiscardDialogOpen) {
        closeDiscardDialog();
        return true;
      }
      openDiscardDialog();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [
    isSaveSuccessOpen,
    isDiscardDialogOpen,
    handleSuccessGoHome,
    closeDiscardDialog,
    openDiscardDialog,
  ]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary">
      <StatusBar style="light" />

      <View className="flex-1 bg-background">
        {/* Top Olive Header: Dual Tab Switcher Only */}
        <S1ResultsHeader
          activeTab={activeTab}
          onSelectTab={setTab}
        />

        {/* Loading State Placeholder */}
        {isLoading && !scanResult ? (
          <View className="flex-1 items-center justify-center p-6 bg-background">
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text className="mt-4 text-body-sm font-sans text-muted">
              Loading skin analysis results...
            </Text>
          </View>
        ) : error && !scanResult ? (
          /* Error State Fallback */
          <View className="flex-1 items-center justify-center p-6 bg-background">
            <Text className="text-body font-sans-bold text-text text-center">
              Unable to Load Results
            </Text>
            <Text className="text-body-sm font-sans text-muted text-center mt-2 mb-6">
              {error}
            </Text>
            <Pressable
              onPress={retry}
              className="bg-primary px-6 py-3 rounded-button active:opacity-80"
            >
              <Text className="text-neutral-white font-sans-bold text-body-sm">
                Retry
              </Text>
            </Pressable>
          </View>
        ) : scanResult ? (
          /* Populated Findings View + Collapsible Overlay Save Footer */
          <View className="flex-1 relative">
            {activeTab === 'results' ? (
              <S2ResultsTab
                scanResult={scanResult}
                imageUri={displayImageUri}
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
                showHistorySavedBanner={false}
                onScroll={handleScroll}
                contentPaddingBottom={160}
              />
            ) : (
              <S3CompatibilityTab
                scanResult={scanResult}
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
                onIngredientPress={handleIngredientPress}
                onScroll={handleScroll}
                contentPaddingBottom={160}
              />
            )}

            {/* Collapsible Bottom Save / Discard Footer */}
            <SaveFooter
              visible={isFooterVisible}
              onDiscard={openDiscardDialog}
              onSave={handleSavePress}
              isDiscarding={isDiscarding}
            />
          </View>
        ) : null}
      </View>

      {/* Save Success Popup */}
      <NotifDialog
        visible={isSaveSuccessOpen}
        icon="success"
        title="Analysis Saved!"
        subtitle="Added to your scan history"
        body="Your skin analysis results have been saved. You can review your findings and ingredient compatibility anytime in History."
        boldPhrase="saved"
        cancelLabel="Go Home"
        confirmLabel="View History"
        onCancel={handleSuccessGoHome}
        onConfirm={handleSuccessViewHistory}
        onClose={handleSuccessGoHome}
        testID="scan-save-success-dialog"
      />

      {/* Discard Confirmation Dialog */}
      <DeleteDialog
        visible={isDiscardDialogOpen}
        title="Discard Analysis?"
        body="Are you sure you want to discard this skin analysis? Your results will not be saved to your history."
        boldPhrase="discard this skin analysis"
        cancelLabel="Keep Viewing"
        confirmLabel="Discard"
        onCancel={closeDiscardDialog}
        onConfirm={handleConfirmDiscard}
        onClose={closeDiscardDialog}
        testID="scan-discard-dialog"
      />
    </SafeAreaView>
  );
};

export default ScanResultsPage;
