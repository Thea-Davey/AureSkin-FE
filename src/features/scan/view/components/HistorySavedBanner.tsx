import React from 'react';
import { View, Text } from 'react-native';
import { CheckSquare } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface HistorySavedBannerProps {
  message?: string;
}

/**
 * HistorySavedBanner (Container 5 in Section 4.6).
 * Reassures the user that their full scan analysis results have been logged
 * to their permanent Skin Analysis History to benchmark changes over time.
 */
export const HistorySavedBanner: React.FC<HistorySavedBannerProps> = ({
  message = 'These results have been saved to your skin analysis history so you can track your progress over time.',
}) => {
  return (
    <View className="mx-4 mt-4 rounded-card border border-border bg-card p-4 flex-row items-center gap-3.5 shadow-xs">
      <View className="w-9 h-9 rounded-full bg-neutral-offwhite items-center justify-center shrink-0 border border-border/50">
        <CheckSquare size={20} color={theme.colors.text} strokeWidth={2.2} />
      </View>
      <Text className="text-body-sm font-sans text-text flex-1 leading-5">
        {message}
      </Text>
    </View>
  );
};

export default HistorySavedBanner;

