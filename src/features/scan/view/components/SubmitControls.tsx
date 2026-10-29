import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { RotateCcw, ArrowRight } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface SubmitControlsProps {
  isSubmitting: boolean;
  onRetake: () => void;
  onSubmit: () => void;
}

/**
 * Bottom control row for the Scan Submit screen (Section 4.4).
 * Houses:
 * - "Retake" button on the left with circular arrows icon.
 * - "Submit Photo" primary CTA pill button on the right with dark enclosed arrow badge.
 */
export const SubmitControls: React.FC<SubmitControlsProps> = ({
  isSubmitting,
  onRetake,
  onSubmit,
}) => {
  return (
    <View className="w-full flex-row items-center justify-between px-6 pb-4 pt-2">
      {/* Left: Retake Button */}
      <Pressable
        onPress={onRetake}
        accessibilityRole="button"
        accessibilityLabel="Retake or reselect photo"
        hitSlop={10}
        className="flex-row items-center active:opacity-70 py-2 px-1"
      >
        <RotateCcw size={22} color={theme.colors.card} />
        <Text className="text-body-sm font-sans-semibold text-neutral-white ml-2">
          Retake
        </Text>
      </Pressable>

      {/* Right: Submit Photo Button */}
      <Pressable
        onPress={onSubmit}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Submit photo for skin analysis"
        className="flex-row items-center bg-neutral-white rounded-full pl-5 pr-2 py-2 active:opacity-90 active:scale-[0.98]"
      >
        <Text className="text-body-sm font-sans-bold text-neutral-text mr-3">
          Submit Photo
        </Text>

        {/* Circular Arrow Badge */}
        <View className="w-8 h-8 rounded-full bg-neutral-text items-center justify-center">
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.colors.card} />
          ) : (
            <ArrowRight size={18} color={theme.colors.card} />
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default SubmitControls;

