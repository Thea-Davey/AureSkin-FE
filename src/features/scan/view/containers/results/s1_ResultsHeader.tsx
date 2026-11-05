import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MoreHorizontal, X } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { ScanResultsTab } from '../../../model/scan_types';
import { ResultsCompatabilityToggle } from '../../components/ResultsCompatabilityToggle';

export interface S1ResultsHeaderProps {
  activeTab: ScanResultsTab;
  createdAt?: string | null;
  onSelectTab: (tab: ScanResultsTab) => void;
  onClose: () => void;
  onMorePress?: () => void;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Scan date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Scan date unavailable'
    : date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Container Section 1: Results Header.
 * Olive green top banner containing the "Skin Analysis: [date]" title,
 * 3-dot action menu, close button returning home, and the dual-tab segmented switcher.
 */
export const S1ResultsHeader: React.FC<S1ResultsHeaderProps> = ({
  activeTab,
  createdAt,
  onSelectTab,
  onClose,
  onMorePress,
}) => {
  const displayDate = formatDate(createdAt || new Date().toISOString());

  return (
    <View className="bg-primary px-4 pb-3 pt-2 shadow-sm">
      {/* Top Title, Date & Action Row */}
      <View className="-mb-1 min-h-12 flex-row items-center justify-between">
        {/* Title and Date: Skin Analysis: [date] */}
        <View className="min-w-0 flex-1 flex-row items-baseline pr-2">
          <Text numberOfLines={1} className="shrink text-h3 font-sans-bold text-neutral-white">
            Skin Analysis:
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            className="ml-2 min-w-0 flex-1 text-body-sm font-sans text-neutral-white/80"
          >
            {displayDate}
          </Text>
        </View>

        {/* Right Actions: 3-dot menu + Close (X) button */}
        <View className="flex-row items-center gap-1.5 shrink-0">
          {onMorePress ? (
            <Pressable
              onPress={onMorePress}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="More scan actions"
              className="h-9 w-9 items-center justify-center rounded-full active:opacity-75"
            >
              <MoreHorizontal size={22} color={theme.colors.white} />
            </Pressable>
          ) : null}

          {/* Close (✕) Dismiss Button */}
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close skin analysis results and return home"
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-75"
          >
            <X size={22} color={theme.colors.white} />
          </Pressable>
        </View>
      </View>

      {/* Results / Compatibility Toggle Button */}
      <ResultsCompatabilityToggle
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />
    </View>
  );
};

export default S1ResultsHeader;
