import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useFocusEffect } from 'expo-router';
import { theme } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface HealthGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showSublabel?: boolean;
  sublabel?: string;
  textColor?: string;
  duration?: number;
  textClassName?: string;
}

/**
 * HealthGauge
 * Shared animated circular SVG health gauge.
 * Features a background track, animated progress ring fill, and animated counting percentage.
 * Usable across Home (hero summary), Scan (skin health score card), and History list items.
 */
export function HealthGauge({
  percentage = 0,
  size = 110,
  strokeWidth = 10,
  color = theme.colors.accent,
  showSublabel,
  sublabel = 'HEALTHY',
  textColor,
  duration,
  textClassName,
}: HealthGaugeProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayNumber, setDisplayNumber] = useState(0);

  const validPercentage = Math.max(0, Math.min(100, isNaN(percentage) ? 0 : percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const isTiny = size <= 36;
  const isMini = size <= 52;
  const isCompact = size < 80;
  const shouldShowSublabel = showSublabel !== undefined ? showSublabel : !isCompact;
  const animDuration = duration ?? (isMini ? 500 : 1100);

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
      duration: animDuration,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, validPercentage, animDuration]);

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
            stroke={color}
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
        <Text
          style={[
            textColor ? { color: textColor } : isCompact ? undefined : { color },
            isTiny ? { fontSize: 10.5, lineHeight: 13 } : undefined,
          ]}
          className={
            textClassName ??
            (isMini
              ? 'text-caption font-sans-bold text-text tracking-tight'
              : isCompact
                ? 'text-body font-sans-bold text-text tracking-tight'
                : 'text-h2 font-sans-bold tracking-tight')
          }
        >
          {displayNumber}%
        </Text>
        {shouldShowSublabel ? (
          <Text
            style={{ color }}
            className="text-caption font-sans-bold tracking-wider"
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default HealthGauge;
