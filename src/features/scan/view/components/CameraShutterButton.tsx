import React from 'react';
import { Pressable, View } from 'react-native';

export interface CameraShutterButtonProps {
  onPress: () => void;
  isCapturing?: boolean;
}

/**
 * Large circular white shutter button (Section 4.2).
 * Styled with an outer translucent ring and a solid white core button.
 */
export const CameraShutterButton: React.FC<CameraShutterButtonProps> = ({
  onPress,
  isCapturing = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={isCapturing}
      accessibilityRole="button"
      accessibilityLabel="Capture photo"
      className="items-center justify-center active:scale-95"
    >
      {/* Outer Ring */}
      <View className="w-20 h-20 rounded-full border-4 border-neutral-white/40 items-center justify-center">
        {/* Inner Solid White Shutter Circle */}
        <View className="w-16 h-16 rounded-full bg-neutral-white shadow-lg" />
      </View>
    </Pressable>
  );
};
