import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

interface BootstrapStatusTickerProps {
  label: string;
}

export function BootstrapStatusTicker({ label }: BootstrapStatusTickerProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Quick fade cross when label changes
    fadeAnim.setValue(0.3);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [label, fadeAnim]);

  return (
    <View className="items-center justify-center min-h-[24px] mb-3 px-4">
      <Animated.Text
        style={{ opacity: fadeAnim }}
        className="text-caption font-sans text-neutral-white/90 text-center"
      >
        {label}
      </Animated.Text>
    </View>
  );
}

