import React from 'react';
import { View, Text } from 'react-native';

export interface SetupHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * SetupHeader Component (Section 4.0 / Set Up Your Skin Analysis)
 * Fixed top layer presenting the title and guiding subtitle over the primary theme background.
 */
export const SetupHeader: React.FC<SetupHeaderProps> = ({
  title = 'Set Up Your Skin Analysis',
  subtitle = "Choose how you'd like to analyze your skin.",
}) => {
  return (
    <View className="px-6 pt-12 pb-3 bg-transparent">
      <Text className="text-h3 font-sans-bold text-neutral-white">
        {title}
      </Text>
      <Text className="mt-0 text-caption font-sans text-neutral-white/90">
        {subtitle}
      </Text>
    </View>
  );
};

export default SetupHeader;

