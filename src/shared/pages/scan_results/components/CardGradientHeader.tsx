import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface CardGradientHeaderProps {
  /** Color token strictly passed from theme.colors.* */
  color: string;
  /** Opacity at start of gradient (offset 0%). Default: 0.18 */
  startOpacity?: number;
  /** Opacity at end of gradient (offset 100%). Default: 0 */
  stopOpacity?: number;
  /** Height of the gradient overlay. Default: '100%' (fills parent up to divider) */
  height?: number | string;
}

/**
 * CardGradientHeader
 * Renders a subtle hardware-accelerated linear gradient background header for card containers.
 * Strictly uses color tokens from theme.colors.* with SVG stopOpacity for alpha blending.
 * When height is '100%' or default, it dynamically expands to fill the header section down to the divider.
 */
export const CardGradientHeader: React.FC<CardGradientHeaderProps> = ({
  color,
  startOpacity = 0.18,
  stopOpacity = 0,
  height = '100%',
}) => {
  const gradientId = useId ? `grad-${useId()}` : `grad-${Math.random().toString(36).substring(2, 9)}`;
  const isFullHeight = height === '100%' || height === undefined;

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          overflow: 'hidden',
        },
        isFullHeight ? { bottom: 0 } : { height },
      ]}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity={startOpacity} />
            <Stop offset="100%" stopColor={color} stopOpacity={stopOpacity} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};

export default CardGradientHeader;
