import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useFocusEffect } from 'expo-router';
import { theme } from '@/shared/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HealthGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function HealthGauge({
  percentage = 0,
  size = 110,
  strokeWidth = 10,
}: HealthGaugeProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayNumber, setDisplayNumber] = useState(0);

  const validPercentage = Math.max(0, Math.min(100, isNaN(percentage) ? 0 : percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Listen to animated value to count up the center percentage number
  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayNumber(Math.round(value));
    });
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue]);

  // Animation trigger that resets and animates forward
  const runAnimation = useCallback(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: validPercentage,
      duration: 1100,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, validPercentage]);

  // Re-run animation every time the screen comes into focus or reloads
  useFocusEffect(
    useCallback(() => {
      runAnimation();
    }, [runAnimation])
  );

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center relative"
    >
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.accent}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>

      {/* Center Label (Counting up with the progress ring) */}
      <View className="absolute items-center justify-center">
        <Text className="text-h2 font-sans-bold text-accent tracking-tight">
          {displayNumber}%
        </Text>
        <Text className="text-caption font-sans-bold text-accent tracking-wider">
          HEALTHY
        </Text>
      </View>
    </View>
  );
}
