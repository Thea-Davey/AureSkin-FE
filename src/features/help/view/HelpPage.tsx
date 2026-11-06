import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ModalHeader } from '@/shared/components/ModalHeader';
import { theme } from '@/shared/theme';
import { useHelp } from '../viewmodel/useHelp';
import { QuickGuideCard } from './components/QuickGuideCard';
import { DiagnosticCard } from './components/DiagnosticCard';
import { SupportCard } from './components/SupportCard';

export function HelpPage() {
  const {
    helpData,
    expandedGuideIds,
    isClearingCache,
    cacheClearedStatus,
    isLoading,
    refetch,
    toggleGuide,
    handleClearCache,
    handleContactSupport,
  } = useHelp();

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Help & Support" />

      {isLoading || !helpData ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                refetch();
              }}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Quick Guides Section (High contrast card background token as requested) */}
          <Text className="mb-3 text-h3 font-sans-bold text-text">
            Quick Guides & Best Practices
          </Text>

          {helpData.guides.map((guide) => (
            <QuickGuideCard
              key={guide.id}
              guide={guide}
              isExpanded={expandedGuideIds.includes(guide.id)}
              onToggle={toggleGuide}
            />
          ))}

          {/* Diagnostic & Storage Management Card */}
          <View className="mt-2">
            <DiagnosticCard
              diagnostics={helpData.diagnostics}
              isClearing={isClearingCache}
              clearedStatus={cacheClearedStatus}
              onClearCache={handleClearCache}
            />
          </View>

          {/* Contact Support Footer Card */}
          <SupportCard
            support={helpData.support}
            onContactSupport={handleContactSupport}
          />
        </ScrollView>
      )}
    </View>
  );
}

export default HelpPage;
