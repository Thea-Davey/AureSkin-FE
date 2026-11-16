import React from 'react';
import { theme } from '../../../../shared/theme';
import { Button } from '../../../../shared/components/Button';

export interface ScanActionButtonProps {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * Reusable white pill button for Scan Overlay options ("Take a Photo", "Upload a Photo").
 * Strictly complies with AureSkin preset design tokens and uses global Button component.
 */
export const ScanActionButton: React.FC<ScanActionButtonProps> = ({
  label,
  Icon,
  onPress,
  accessibilityLabel,
}) => {
  return (
    <Button
      variant="white"
      shape="card"
      size="lg"
      fullWidth
      title={label}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      leftIcon={<Icon size={22} color={theme.colors.text} />}
      className="py-4 px-6 shadow-md active:opacity-80"
      textClassName="text-body font-sans-bold text-neutral-text"
    />
  );
};

export default ScanActionButton;
