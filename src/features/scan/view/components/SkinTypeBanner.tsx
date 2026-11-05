import React from 'react';
import { View, Text } from 'react-native';
import {
  Droplets,
  Wind,
  Layers,
  AlertCircle,
  Smile,
  LucideIcon,
} from 'lucide-react-native';
import { CardGradientHeader } from './CardGradientHeader';
import { theme } from '../../../../shared/theme';

interface SkinTypeBannerProps {
  skinType: string;
  confidence: number;
  description?: string;
}

const SKIN_TYPE_ICONS: Record<string, LucideIcon> = {
  oily: Droplets,
  dry: Wind,
  combination: Layers,
  acneprone: AlertCircle,
  normal: Smile,
};

const SKIN_TYPE_DESCRIPTIONS: Record<string, string> = {
  oily: 'Characterized by excess sebum production, leading to a shiny finish and visible pores, particularly concentrated in the facial T-zone.',
  dry: 'Characterized by reduced natural lipid and moisture levels, often presenting as tightness, surface flaking, and rough texture.',
  combination: 'Features a mix of oily sebum production across the forehead, nose, and chin (T-zone) with normal or dry skin on the cheeks.',
  acneprone: 'Prone to recurrent blemishes, clogged sebaceous follicles, and active inflammation requiring soothing, non-comedogenic formulas.',
  normal: 'Maintains balanced sebum and hydration levels with smooth skin texture, refined pores, and minimal sensitivity.',
};

/**
 * SkinTypeBanner (Container 3 in Section 4.6).
 * Redesigned with:
 * - High-contrast "DIAGNOSED SKIN TYPE" badge indicator
 * - Prominent skin-type specific icon beside the type name
 * - Secondary color token gradient header
 * - Right-aligned circular confidence indicator matching Container 2
 * - Tightly balanced vertical spacing (eliminating large gaps)
 * - Structured "DERMAL CHARACTERISTICS" subtitle
 */
export const SkinTypeBanner: React.FC<SkinTypeBannerProps> = ({
  skinType,
  confidence,
  description,
}) => {
  const normType = (skinType || 'normal').toLowerCase();
  const formatSkinType = (type: string) => {
    if (type === 'acneprone') return 'Acne Prone';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const SkinTypeIcon = SKIN_TYPE_ICONS[normType] || Droplets;

  const displayConfidence =
    typeof confidence === 'number' && Number.isFinite(confidence)
      ? `${Math.round(confidence)}%`
      : '90%';

  const typeDescription =
    description ||
    SKIN_TYPE_DESCRIPTIONS[normType] ||
    'Your diagnosed skin type based on deep-learning facial analysis.';

  return (
    <View className="mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs">
      {/* Warm Secondary Color Token Gradient Header */}
      <CardGradientHeader color={theme.colors.secondary} height={80} startOpacity={0.25} />

      {/* Header Row: Label & Skin Type with Icon (Left) + Aligned Confidence Circle (Right) */}
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          {/* Eyebrow Label: High-contrast & clear */}
          <View className="flex-row items-center gap-1.5 mb-1">
            <View className="w-2 h-2 rounded-full bg-secondary" />
            <Text className="text-caption font-sans-bold text-secondary-dark uppercase tracking-wider">
              SKIN TYPE
            </Text>
          </View>

          {/* Skin Type Name with Representative Icon */}
          <View className="flex-row items-center gap-2 mt-0.5">
            <View className="w-7 h-7 rounded-full bg-secondary-dark items-center justify-center shrink-0">
              <SkinTypeIcon size={15} color={theme.colors.white} strokeWidth={2.4} />
            </View>
            <Text className="text-h2 font-sans-bold text-text font-bold capitalize">
              {formatSkinType(normType)}
            </Text>
          </View>
        </View>

        {/* Aligned Right Confidence Circle - Exactly matching Container 2's size and positioning */}
        <View
          style={{ borderColor: theme.colors.secondary }}
          className="w-16 h-16 rounded-full border-4 items-center justify-center bg-card shadow-xs"
        >
          <Text className="text-body font-sans-bold text-secondary-dark">
            {displayConfidence}
          </Text>
        </View>
      </View>

      {/* Subtle Horizontal Divider */}
      <View className="border-b border-border/30 mx-4" />

      {/* Dermal Characteristics Body */}
      <View className="px-4 pt-3 pb-4">
        <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider mb-1">
          CHARACTERISTICS
        </Text>
        <Text className="text-body-sm font-sans text-text leading-5">
          {typeDescription}
        </Text>
      </View>
    </View>
  );
};

export default SkinTypeBanner;
