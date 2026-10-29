import React from 'react';
import { Pressable, Text } from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface ScanExitButtonProps {
  onPress: () => void;
}

/**
 * Circular CTA exit button at the bottom of the Scan Overlay.
 * Displays a white "X" icon with an "Exit" caption inside a coral circle
 * with a white border, matching Figma specifications.
 */
export const ScanExitButton: React.FC<ScanExitButtonProps> = ({ onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Exit scan overlay"
      className="w-20 h-20 rounded-full bg-status-error items-center justify-center shadow-xl border-4 border-neutral-white active:opacity-80"
    >
      <X size={26} color={theme.colors.white} strokeWidth={2.5} />
      <Text className="text-caption font-sans-bold text-neutral-white mt-0.5">
        Exit
      </Text>
    </Pressable>
  );
};
