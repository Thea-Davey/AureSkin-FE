import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface BootstrapProgressBarProps {
  progress: number; // 0 to 100
}

export function BootstrapProgressBar({ progress }: BootstrapProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(100, Math.max(0, progress)),
      duration: 250,
      useNativeDriver: false, // width interpolation requires JS driver
    }).start();
  }, [progress, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="w-full max-w-[280px] items-center">
      {/* Progress Track */}
      <View className="h-2.5 w-full overflow-hidden rounded-full bg-white/25 border border-white/20">
        <Animated.View
          style={{ width: widthInterpolation }}
          className="h-full rounded-full bg-accent"
        />
      </View>

      {/* Percentage Counter */}
      <Text className="mt-2 text-caption font-sans-bold text-neutral-white tracking-wider">
        {Math.round(progress)}%
      </Text>
    </View>
  );
}

