import React, { useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import { ArrowDownUp } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface CameraFlipButtonProps {
  onFlip: () => void;
}

/**
 * Camera flip toggle button at bottom-right (Section 4.2).
 * Toggles between front (selfie) and rear cameras with a subtle rotation animation.
 */
export const CameraFlipButton: React.FC<CameraFlipButtonProps> = ({ onFlip }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    onFlip();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Switch camera lens"
      className="w-14 h-14 rounded-full items-center justify-center active:bg-neutral-white/10"
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <ArrowDownUp size={28} color={theme.colors.card} />
      </Animated.View>
    </Pressable>
  );
};
