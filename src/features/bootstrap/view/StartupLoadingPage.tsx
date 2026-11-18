import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FixedBackgroundPattern } from '@/shared/components/FixedBackgroundPattern';
import { useStartupBootstrap } from '../viewmodel/useStartupBootstrap';
import { BootstrapProgressBar } from './components/BootstrapProgressBar';
import { BootstrapStatusTicker } from './components/BootstrapStatusTicker';

const LOGO_WHITE = require('@/assets/images/logo-white.png');

/**
 * StartupLoadingPage
 * Application bootstrap and resource prefetching loading screen.
 * Displays the white AureSkin brand logo pulsing on an olive primary background
 * textured with the global brand background pattern, alongside a live status ticker
 * and dynamic progress bar.
 */
export function StartupLoadingPage() {
  const insets = useSafeAreaInsets();
  const { progress, currentLabel } = useStartupBootstrap();

  // Subtle entrance fade-in for smooth transition from splash screen
  const entranceAnim = useRef(new Animated.Value(0)).current;

  // Gentle pulsing animation for the white brand logo
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in when loading screen mounts
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [entranceAnim, pulseAnim]);

  return (
    <View className="flex-1 bg-primary relative overflow-hidden">
      {/* Global stationary background pattern */}
      <FixedBackgroundPattern />
      <StatusBar style="light" />

      <Animated.View
        style={{
          opacity: entranceAnim,
          paddingTop: Math.max(insets.top, 32) + 40,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        className="flex-1 items-center justify-between px-6 z-10"
      >
        {/* Decorative top spacer */}
        <View className="w-full" />

        {/* Center Hero: Pulsing White Logo + App Name */}
        <View className="items-center">
          <Animated.Image
            source={LOGO_WHITE}
            style={{
              transform: [{ scale: pulseAnim }],
              width: 120,
              height: 120,
            }}
            className="mb-4"
            resizeMode="contain"
            accessibilityLabel="AureSkin White Logo"
          />

          <Text className="font-heading text-display text-neutral-white tracking-wider">
            AureSkin
          </Text>
        </View>

        {/* Bottom Area: Rotating Status Ticker + Progress Bar */}
        <View className="w-full items-center">
          <BootstrapStatusTicker label={currentLabel} />
          <BootstrapProgressBar progress={progress} />
        </View>
      </Animated.View>
    </View>
  );
}

export default StartupLoadingPage;
