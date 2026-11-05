import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';

export interface ProfileFormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}

/**
 * ProfileFormField
 * Standardized two-row form field container for Edit Profile:
 * Row 1: Label (strictly styled with text-caption font-sans-medium text-text)
 * Row 2: Input field / select buttons / dropdown (passed as children)
 */
export function ProfileFormField({
  label,
  children,
  className = 'mb-3.5',
  labelClassName = '',
}: ProfileFormFieldProps) {
  return (
    <View className={className}>
      {/* Row 1: Label (use caption preset) */}
      <Text className={`text-caption font-sans-medium text-text mb-1.5 ${labelClassName}`}>
        {label}
      </Text>

      {/* Row 2: Input field / select buttons / dropdown */}
      {children}
    </View>
  );
}

export default ProfileFormField;

