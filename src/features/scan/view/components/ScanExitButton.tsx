import React from 'react';
import { Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface ScanExitButtonProps {
  onPress: () => void;
}

/**
 * Circular CTA exit button at the bottom of the Scan Overlay.
 * Displays a white "X" icon (cross only, symbols only, no text label) inside a status-error circle
 * with a 4px white border, matching bottom nav styling.
 */
export const ScanExitButton: React.FC<ScanExitButtonProps> = ({ onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Exit scan overlay"
      className="w-20 h-20 rounded-full bg-status-error items-center justify-center shadow-xl border-4 border-neutral-white active:opacity-80"
    >
      <X size={32} color={theme.colors.white} strokeWidth={2.8} />
    </Pressable>
  );
};
