import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '../../../../shared/theme';

export interface ScanActionButtonProps {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * Reusable white pill button for Scan Overlay options ("Take a Photo", "Upload a Photo").
 * Strictly complies with AureSkin preset design tokens.
 */
export const ScanActionButton: React.FC<ScanActionButtonProps> = ({
  label,
  Icon,
  onPress,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="w-full bg-neutral-white rounded-card py-4 px-6 flex-row items-center justify-center shadow-md active:opacity-80"
    >
      <View className="mr-3">
        <Icon size={22} color={theme.colors.text} />
      </View>
      <Text className="text-body font-sans-bold text-neutral-text">
        {label}
      </Text>
    </Pressable>
  );
};
