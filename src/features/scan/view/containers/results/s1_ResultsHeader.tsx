import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { ScanResultsTab } from '../../../model/scan_types';
import { ResultsTabSwitcher } from '../../components/ResultsTabSwitcher';

interface S1ResultsHeaderProps {
  activeTab: ScanResultsTab;
  onSelectTab: (tab: ScanResultsTab) => void;
  onClose: () => void;
}

/**
 * Container Section 1: Results Header.
 * Olive green top banner containing the "Skin Analysis" title,
 * close button returning to the Home tab, and the dual-tab segmented switcher.
 */
export const S1ResultsHeader: React.FC<S1ResultsHeaderProps> = ({
  activeTab,
  onSelectTab,
  onClose,
}) => {
  return (
    <View className="bg-primary pt-3 pb-3 px-4 shadow-sm">
      {/* Top Title & Close Row */}
      <View className="flex-row items-center justify-between">
        {/* Placeholder to balance the centered title */}
        <View className="w-8" />

        {/* Centered Screen Title */}
        <Text className="text-neutral-white font-sans-bold text-body text-center flex-1">
          Skin Analysis
        </Text>

        {/* Close (✕) Dismiss Button */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close skin analysis results and return home"
          hitSlop={10}
          className="w-8 items-end active:opacity-70"
        >
          <X size={24} color={theme.colors.white} aria-hidden={true} />
        </Pressable>
      </View>

      {/* Dual Tab Segmented Switcher */}
      <ResultsTabSwitcher
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />
    </View>
  );
};
