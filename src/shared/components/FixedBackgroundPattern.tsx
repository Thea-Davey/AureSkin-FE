import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ImageResizeMode,
  Dimensions,
  useWindowDimensions,
} from 'react-native';

const BG_PATTERN: ImageSourcePropType = require('../../../assets/images/aureskin-bg-pattern.png');

/**
 * Global default opacity for the background pattern across all screens (0 to 1).
 * Modify this value to adjust the pattern intensity across the entire app at once.
 */
export const DEFAULT_PATTERN_OPACITY = 0.5;

/**
 * Global default pull-down offset (in dp) to adjust the vertical position of the pattern.
 * Shifts the pattern downwards so it comfortably covers the lower sections of all screens.
 */
export const DEFAULT_PULL_DOWN_OFFSET = 0;

export interface FixedBackgroundPatternProps {
  /** Optional Tailwind class name overrides for outer container */
  className?: string;
  /** Optional container style overrides */
  style?: StyleProp<ViewStyle>;
  /** Optional image style overrides */
  imageStyle?: StyleProp<ImageStyle>;
  /** Optional opacity override for the pattern (0 to 1, defaults to DEFAULT_PATTERN_OPACITY) */
  opacity?: number;
  /** Optional vertical pull-down offset in pixels (defaults to DEFAULT_PULL_DOWN_OFFSET) */
  topOffset?: number;
  /** Optional resize mode (defaults to 'cover') */
  resizeMode?: ImageResizeMode;
}

/**
 * FixedBackgroundPattern
 * Renders the AureSkin background pattern texture (aureskin-bg-pattern.png)
 * pinned to absolute fill so it remains completely stationary when page content scrolls.
 *
 * Uses physical screen dimensions plus pull-down offset to ensure the pattern
 * extends all the way through the bottom edge of all screens with zero empty gaps.
 */
export function FixedBackgroundPattern({
  className = '',
  style,
  imageStyle,
  opacity = DEFAULT_PATTERN_OPACITY,
  topOffset = DEFAULT_PULL_DOWN_OFFSET,
  resizeMode = 'cover',
}: FixedBackgroundPatternProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenDimensions = Dimensions.get('screen');

  // Use maximum dimensions between window and physical screen to ensure complete bottom coverage
  const screenWidth = Math.max(windowWidth, screenDimensions.width);
  const screenHeight = Math.max(windowHeight, screenDimensions.height);
  const imageCoverageHeight = screenHeight + Math.max(topOffset, 0) + 120;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style]}
      className={`overflow-hidden ${className}`.trim()}
    >
      <Image
        source={BG_PATTERN}
        style={[
          {
            position: 'absolute',
            top: topOffset,
            left: 0,
            width: screenWidth,
            height: imageCoverageHeight,
          },
          opacity !== undefined ? { opacity } : null,
          imageStyle,
        ]}
        resizeMode={resizeMode}
      />
    </View>
  );
}

export default FixedBackgroundPattern;
