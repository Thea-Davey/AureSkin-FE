import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ScanResultsTab } from '../../model/scan_types';

export interface ResultsCompatabilityToggleProps {
  /** Currently active tab ('results' | 'compatibility') */
  activeTab: ScanResultsTab;
  /** Callback fired when user selects a tab */
  onSelectTab: (tab: ScanResultsTab) => void;
  /**
   * Layout style:
   * 1 = Original design: Centered pill buttons with spacing between them
   * 2 = Unified toggle button: Full-width outer container in bg-primary-dark with equal-width tabs
   * Default: 2
   */
  style?: 1 | 2;
  /** Optional container styling */
  className?: string;
}

/**
 * ResultsCompatabilityToggle component for Scan Results findings dashboard.
 * Supports Style 1 (original pill buttons) and Style 2 (integrated toggle bar with bg-primary-dark container).
 */
export const ResultsCompatabilityToggle: React.FC<ResultsCompatabilityToggleProps> = ({
  activeTab,
  onSelectTab,
  style = 2,
  className = '',
}) => {
  const isResults = activeTab === 'results';

  // ── STYLE 1: Current/Original Design (Centered separate pills) ───────────
  if (style === 1) {
    return (
      <View className={`flex-row items-center justify-center mt-3 gap-2 ${className}`}>
        {/* Results Tab Button */}
        <Pressable
          onPress={() => onSelectTab('results')}
          accessibilityRole="tab"
          accessibilityState={{ selected: isResults }}
          accessibilityLabel="Show scan results findings"
          className={`px-4 py-1.5 rounded-badge active:opacity-80 ${isResults ? 'bg-secondary' : 'bg-transparent'
            }`}
        >
          <Text
            className={`text-caption ${isResults
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
          className={`px-4 py-1.5 rounded-badge active:opacity-80 ${!isResults ? 'bg-secondary' : 'bg-transparent'
            }`}
        >
          <Text
            className={`text-caption ${!isResults
              ? 'text-neutral-white font-sans-semibold'
              : 'text-neutral-white/80 font-sans'
              }`}
          >
            Ingredient Compatibility
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── STYLE 2: Integrated Full-Width Toggle Bar (bg-primary-dark wrapper) ───
  return (
    <View
      className={`mt-3 w-full flex-row items-center rounded-button bg-primary-dark p-1 ${className}`}
    >
      {/* Results Tab Button (Strict Equal Width: 50% flexBasis 0) */}
      <Pressable
        onPress={() => onSelectTab('results')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isResults }}
        accessibilityLabel="Show scan results findings"
        style={{ flex: 1, flexBasis: 0, width: '50%' }}
        className={`h-10 items-center justify-center rounded-button px-2 active:opacity-80 ${
          isResults ? 'bg-secondary' : 'bg-transparent'
        }`}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          className={`text-caption ${
            isResults
              ? 'text-neutral-white font-sans-semibold'
              : 'text-neutral-white/80 font-sans'
          }`}
        >
          Results
        </Text>
      </Pressable>

      {/* Ingredient Compatibility Tab Button (Strict Equal Width: 50% flexBasis 0) */}
      <Pressable
        onPress={() => onSelectTab('compatibility')}
        accessibilityRole="tab"
        accessibilityState={{ selected: !isResults }}
        accessibilityLabel="Show ingredient compatibility"
        style={{ flex: 1, flexBasis: 0, width: '50%' }}
        className={`h-10 items-center justify-center rounded-button px-2 active:opacity-80 ${
          !isResults ? 'bg-secondary' : 'bg-transparent'
        }`}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
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

