import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../shared/theme';
import { useScanResults } from '../viewmodel/useScanResults';
import { S1ResultsHeader } from './containers/results/s1_ResultsHeader';
import { S2ResultsTab } from './containers/results/s2_ResultsTab';
import { S3CompatibilityTab } from './containers/results/s3_CompatibilityTab';

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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary">
      <StatusBar style="light" />

      <View className="flex-1 bg-background">
        {/* Top Olive Header: Title, Close (X) & Dual Tab Switcher */}
        <S1ResultsHeader
          activeTab={activeTab}
          onSelectTab={setTab}
          onClose={handleClose}
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
    </SafeAreaView>
  );
};

export default ScanResultsPage;
