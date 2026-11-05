import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../shared/theme';
import { DeleteDialog } from '@/shared/components';
import { deleteHistoryEntry } from '../../history/model/history_api';
import { useScanResults } from '../viewmodel/useScanResults';
import { S1ResultsHeader } from './containers/results/s1_ResultsHeader';
import { PopUpScanActionPanel } from './components/PopUpScanActionPanel';
import { S2ResultsTab } from '@/shared/pages/scan_results/containers/s2_ResultsTab';
import { S3CompatibilityTab } from '@/shared/pages/scan_results/containers/s3_CompatibilityTab';

/**
 * ScanResultsPage (Section 4.6 & 4.7).
 * Primary findings dashboard displaying analyzed face photo, predicted skin type
 * with classification confidence, health score metric, detected dermatological conditions,
 * and ingredient compatibility tabs.
 */
export const ScanResultsPage: React.FC = () => {
  const {
    scanResult,
    displayImageUri,
    activeTab,
    isLoading,
    isRefreshing,
    error,
    setTab,
    handleClose,
    handleIngredientPress,
    onRefresh,
    retry,
  } = useScanResults();

  const [isActionPanelVisible, setIsActionPanelVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    if (scanResult?.id) {
      try {
        await deleteHistoryEntry(scanResult.id);
      } catch {
        // ignore error in mock/dev
      }
    }
    handleClose();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary">
      <StatusBar style="light" />

      <View className="flex-1 bg-background">
        {/* Top Olive Header: Title with Date, 3-Dot Menu, Close (X) & Dual Tab Switcher */}
        <S1ResultsHeader
          activeTab={activeTab}
          createdAt={scanResult?.created_at}
          onSelectTab={setTab}
          onClose={handleClose}
          onMorePress={() => setIsActionPanelVisible(true)}
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
          /* Populated Findings View */
          activeTab === 'results' ? (
            <S2ResultsTab
              scanResult={scanResult}
              imageUri={displayImageUri}
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          ) : (
            <S3CompatibilityTab
              scanResult={scanResult}
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              onIngredientPress={handleIngredientPress}
            />
          )
        ) : null}
      </View>

      {/* PopUp Scan Action Panel (triggered by 3-dots) */}
      <PopUpScanActionPanel
        visible={isActionPanelVisible}
        onClose={() => setIsActionPanelVisible(false)}
        onDeletePress={() => setIsDeleteDialogOpen(true)}
      />

      {/* Discard / Delete Dialog */}
      <DeleteDialog
        visible={isDeleteDialogOpen}
        title="Delete Scan Record"
        body="Are you sure you want to delete this scan record? This action cannot be undone."
        boldPhrase="delete this scan record"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </SafeAreaView>
  );
};

export default ScanResultsPage;
