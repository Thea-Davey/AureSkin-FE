import React from 'react';
import { View } from 'react-native';
import { SecurityPrivacyCard } from '../../components/SecurityPrivacyCard';
import { Button } from '@/shared/components';

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
      <Button
        variant="ghost"
        size="md"
        title="Cancel Analysis"
        onPress={onCancel}
        accessibilityLabel="Cancel skin analysis and return"
        className="mt-4 py-3 px-6 active:opacity-60"
        textClassName="text-neutral-muted font-sans-semibold text-body text-center"
      />
    </View>
  );
};
