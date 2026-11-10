import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../theme';

export interface CloseButtonProps {
  onPress: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
  accessibilityLabel?: string;
}

/**
 * Global shared CloseButton component.
 * Renders an accessible floating circular translucent close button for modals, sheets, and pages.
 */
export function CloseButton({
  onPress,
  className = '',
  style,
  iconSize = 22,
  iconColor,
  accessibilityLabel = 'Close',
}: CloseButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={10}
      style={style}
      className={`h-10 w-10 items-center justify-center rounded-full bg-white/20 active:opacity-70 ${className}`}
    >
      <X size={iconSize} color={iconColor ?? theme.colors.card} />
    </Pressable>
  );
}

export default CloseButton;

