import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { RotateCcw, ArrowRight } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { Button } from '../../../../shared/components/Button';

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
    <View className="w-full flex-row items-center px-6 pb-4 pt-2">
      {/* Left: Retake Button (shrink-0) */}
      <Button
        variant="ghost"
        size="sm"
        title="Retake"
        onPress={onRetake}
        accessibilityLabel="Retake or reselect photo"
        hitSlop={10}
        leftIcon={<RotateCcw size={22} color={theme.colors.card} />}
        className="shrink-0 py-2 px-1"
        textClassName="text-body-sm font-sans-semibold text-neutral-white"
      />

      {/* Right: Submit Photo Button (auto-expanding up to Retake button) */}
      <Button
        variant="white"
        shape="pill"
        size="md"
        onPress={onSubmit}
        disabled={isSubmitting}
        accessibilityLabel="Submit photo for skin analysis"
        className="flex-1 ml-5 justify-between pl-6 pr-3 py-3 shadow-sm active:opacity-90 active:scale-[0.98]"
      >
        <Text className="text-body-sm font-sans-bold font-bold text-neutral-text">
          Submit Photo
        </Text>

        {/* Circular Arrow Badge */}
        <View className="w-12 h-12 rounded-full bg-neutral-text items-center justify-center">
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.colors.card} />
          ) : (
            <ArrowRight size={24} color={theme.colors.card} />
          )}
        </View>
      </Button>
    </View>
  );
};

export default SubmitControls;

