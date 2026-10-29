import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ScanResultsTab } from '../../model/scan_types';

interface ResultsTabSwitcherProps {
  activeTab: ScanResultsTab;
  onSelectTab: (tab: ScanResultsTab) => void;
}

/**
 * ResultsTabSwitcher (Section 4.6 & 4.7).
 * Segmented pill buttons in the header toggling between
 * "Results" and "Ingredient Compatibility" views.
 */
export const ResultsTabSwitcher: React.FC<ResultsTabSwitcherProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const isResults = activeTab === 'results';

  return (
    <View className="flex-row items-center justify-center mt-3 gap-2">
      {/* Results Tab Button */}
      <Pressable
        onPress={() => onSelectTab('results')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isResults }}
        accessibilityLabel="Show scan results findings"
        className={`px-4 py-1.5 rounded-badge active:opacity-80 ${
          isResults ? 'bg-secondary' : 'bg-transparent'
        }`}
      >
        <Text
          className={`text-caption ${
            isResults
              ? 'text-neutral-white font-sans-semibold'
              : 'text-neutral-white/80 font-sans'
          }`}
        >
          Results
        </Text>
      </Pressable>

      {/* Ingredient Compatibility Tab Button */}
      <Pressable
        onPress={() => onSelectTab('compatibility')}
        accessibilityRole="tab"
        accessibilityState={{ selected: !isResults }}
        accessibilityLabel="Show ingredient compatibility"
        className={`px-4 py-1.5 rounded-badge active:opacity-80 ${
          !isResults ? 'bg-secondary' : 'bg-transparent'
        }`}
      >
        <Text
          className={`text-caption ${
            !isResults
              ? 'text-neutral-white font-sans-semibold'
              : 'text-neutral-white/80 font-sans'
          }`}
        >
          Ingredient Compatibility
        </Text>
      </Pressable>
    </View>
  );
};
