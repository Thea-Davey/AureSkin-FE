import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

/**
 * SecurityPrivacyCard (Section 4.5).
 * Reassuring informational pill docked near screen bottom confirming
 * end-to-end encryption and user data safety.
 */
export const SecurityPrivacyCard: React.FC = () => {
  return (
    <View className="bg-neutral-text border border-neutral-muted/30 rounded-card p-4 mx-6 flex-row items-center justify-center shadow-sm">
      <ShieldCheck
        size={22}
        color={theme.colors.accent}
        aria-hidden={true}
      />
      <Text className="text-neutral-offwhite font-sans text-caption text-center flex-1 ml-2.5">
        Encrypted and processed securely making sure your data is safe.
      </Text>
    </View>
  );
};
