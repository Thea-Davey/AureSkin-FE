import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SecurityPrivacyCard } from '../../components/SecurityPrivacyCard';

interface S3AnalyzingFooterProps {
  onCancel: () => void;
}

/**
 * Container Section 3: Analyzing Footer.
 * Hosts the encrypted data reassurance card and the secondary "Cancel Analysis" button.
 */
export const S3AnalyzingFooter: React.FC<S3AnalyzingFooterProps> = ({
  onCancel,
}) => {
  return (
    <View className="w-full pb-4 items-center">
      {/* Security and Privacy Assurance Card */}
      <SecurityPrivacyCard />

      {/* Cancel Analysis Secondary Action Button */}
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel skin analysis and return"
        className="mt-4 py-3 px-6 active:opacity-60"
      >
        <Text className="text-neutral-muted font-sans-semibold text-body text-center">
          Cancel Analysis
        </Text>
      </Pressable>
    </View>
  );
};
