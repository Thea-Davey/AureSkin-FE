import React from 'react';
import { View } from 'react-native';
import { ScanResultsTab } from '../../../model/scan_types';
import { ResultsCompatabilityToggle } from '../../components/ResultsCompatabilityToggle';

export interface S1ResultsHeaderProps {
  activeTab: ScanResultsTab;
  onSelectTab: (tab: ScanResultsTab) => void;
}

/**
 * Container Section 1: Results Header (Scan Results screen).
 * Streamlined olive green top header housing only the Results / Ingredient Compatibility
 * dual-tab switcher. Back button, "Skin Analysis: [date]", and 3-dot menu are reserved
 * exclusively for HistoryDetailHeader.
 */
export const S1ResultsHeader: React.FC<S1ResultsHeaderProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <View className="bg-primary px-4 pb-3 pt-0 shadow-sm">
      {/* Results / Compatibility Toggle Button */}
      <ResultsCompatabilityToggle
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        className="mt-0"
      />
    </View>
  );
};

export default S1ResultsHeader;
