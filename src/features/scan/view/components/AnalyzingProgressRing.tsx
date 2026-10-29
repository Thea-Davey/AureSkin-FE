import React, { useEffect, useRef } from 'react';
import { View, Image, Text, Animated } from 'react-native';

interface AnalyzingProgressRingProps {
  imageUri: string;
  progress: number;
}

/**
 * AnalyzingProgressRing (Section 4.5).
 * Circular face container with an animated glowing green border
 * and docked percentage indicator badge tracking pipeline progress.
 */
export const AnalyzingProgressRing: React.FC<AnalyzingProgressRingProps> = ({
  imageUri,
  progress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Subtle breathing pulse effect on the glowing green ring
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim]);

  const displayPercent = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <View className="items-center justify-center my-6">
      <View className="relative items-center justify-center">
        {/* Animated Outer Glowing Progress Ring */}
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="w-64 h-64 rounded-full border-4 border-status-success items-center justify-center shadow-lg"
        >
          {/* Circular Face Photo Preview */}
          <View className="w-[236px] h-[236px] rounded-full overflow-hidden bg-neutral-muted/20 items-center justify-center">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel="Captured face preview"
            />
          </View>
        </Animated.View>

        {/* Docked Percentage Badge at Bottom-Center of Frame */}
        <View className="absolute -bottom-3 self-center bg-neutral-text border border-neutral-muted/40 rounded-badge px-3.5 py-1 flex-row items-center justify-center shadow-md">
          <View className="w-2 h-2 rounded-full bg-status-success mr-2" />
          <Text className="text-neutral-white font-sans-bold text-body-sm">
            {displayPercent}%
          </Text>
        </View>
      </View>
    </View>
  );
};
