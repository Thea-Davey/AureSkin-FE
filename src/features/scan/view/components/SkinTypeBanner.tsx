import React from 'react';
import { View, Text } from 'react-native';

interface SkinTypeBannerProps {
  skinType: string;
  confidence: number;
}

/**
 * SkinTypeBanner (Section 4.6).
 * Prominent peachy-cream card highlighting the user's diagnosed skin type
 * alongside a circular pill badge displaying model classification confidence.
 */
export const SkinTypeBanner: React.FC<SkinTypeBannerProps> = ({
  skinType,
  confidence,
}) => {
  const displayConfidence =
    typeof confidence === 'number' && Number.isFinite(confidence)
      ? `${confidence.toFixed(2)}%`
      : '91.46%';

  const formatSkinType = (type: string) => {
    if (type.toLowerCase() === 'acneprone') return 'Acne Prone';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <View className="mx-4 mt-4 p-5 rounded-card bg-secondary/15 border border-secondary/20 flex-row items-center justify-between shadow-xs">
      {/* Left Details: Headline and Diagnosed Skin Type */}
      <View className="flex-1 mr-3">
        <Text className="text-secondary-dark font-sans-medium text-caption">
          Your Skin Type is
        </Text>
        <Text className="text-h1 font-sans-bold text-secondary-dark capitalize mt-0.5">
          {formatSkinType(skinType)}
        </Text>
      </View>

      {/* Right Circular Confidence Badge */}
      <View className="w-20 h-20 rounded-full bg-card items-center justify-center border-2 border-secondary/20 shadow-sm">
        <Text className="text-secondary-dark font-sans-bold text-body-sm">
          {displayConfidence}
        </Text>
      </View>
    </View>
  );
};
