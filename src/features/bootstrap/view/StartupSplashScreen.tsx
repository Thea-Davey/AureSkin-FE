import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const AURESKIN_LOGO = require('@/assets/images/aureskin-logo.png');

export interface StartupSplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

/**
 * StartupSplashScreen
 * Initial branded startup splash screen displayed when the user first opens AureSkin.
 * Features a clean white background, the official colored AureSkin logo,
 * and the two-tone "AureSkin" brand typography (Aure in primary olive, Skin in secondary beige).
 */
export function StartupSplashScreen({
  onFinish,
  durationMs = 2500,
}: StartupSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    // Subtle smooth entrance scale
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Flash timer: after durationMs, smoothly fade out then transition to loading screen
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onFinish, fadeAnim, scaleAnim]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-1 bg-neutral-white items-center justify-center px-6"
    >
      <StatusBar style="dark" />

      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className="items-center justify-center"
      >
        <Image
          source={AURESKIN_LOGO}
          style={{ width: 140, height: 140 }}
          resizeMode="contain"
          accessibilityLabel="AureSkin Logo"
        />

        <Text className="font-heading text-display mt-5 tracking-wider">
          <Text className="text-primary">Aure</Text>
          <Text className="text-secondary">Skin</Text>
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export default StartupSplashScreen;

