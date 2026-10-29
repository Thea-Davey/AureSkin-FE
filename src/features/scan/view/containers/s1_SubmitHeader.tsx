import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { HelpCircle, X } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface S1SubmitHeaderProps {
  onOpenGuidance: () => void;
  onClose: () => void;
}

/**
 * Top header container for Scan Submit screen (Section 4.4).
 * Houses:
 * - Help button (?) opening the Skin Test Guidelines modal.
 * - Centered screen title "Analyze Skin".
 * - Close button (X) discarding the scan and returning to Home.
 */
export const S1SubmitHeader: React.FC<S1SubmitHeaderProps> = ({
  onOpenGuidance,
  onClose,
}) => {
  return (
    <View className="w-full flex-row items-center justify-between px-6 py-4">
      {/* Help Icon Button */}
      <Pressable
        onPress={onOpenGuidance}
        accessibilityRole="button"
        accessibilityLabel="Open skin test guidelines"
        className="p-2 -ml-2 rounded-full active:bg-neutral-white/10"
      >
        <HelpCircle size={26} color={theme.colors.card} />
      </Pressable>

      {/* Screen Title */}
      <Text className="text-h3 font-sans-bold text-neutral-white">
        Analyze Skin
      </Text>

      {/* Close Icon Button */}
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Exit scan and return to home"
        className="p-2 -mr-2 rounded-full active:bg-neutral-white/10"
      >
        <X size={26} color={theme.colors.card} />
      </Pressable>
    </View>
  );
};

export default S1SubmitHeader;

