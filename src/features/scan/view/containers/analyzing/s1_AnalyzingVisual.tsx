import React from 'react';
import { View, Text } from 'react-native';
import { AnalyzingProgressRing } from '../../components/AnalyzingProgressRing';

interface S1AnalyzingVisualProps {
  imageUri: string;
  progress: number;
}

/**
 * Container Section 1: Visual Presentation.
 * Displays the static "Analyzing Skin" screen title and the central
 * circular face preview container with the glowing progress ring.
 */
export const S1AnalyzingVisual: React.FC<S1AnalyzingVisualProps> = ({
  imageUri,
  progress,
}) => {
  return (
    <View className="items-center w-full pt-4">
      {/* Centered Static Screen Header */}
      <Text className="text-h2 font-sans-bold text-neutral-white text-center">
        Analyzing Skin
      </Text>

      {/* Central Circular Face Preview with Animated Glowing Green Ring */}
      <AnalyzingProgressRing
        imageUri={imageUri}
        progress={progress}
      />
    </View>
  );
};
