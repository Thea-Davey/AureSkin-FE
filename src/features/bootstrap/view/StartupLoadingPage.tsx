import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { theme } from '../../../shared/theme';
import { useStartupBootstrap } from '../viewmodel/useStartupBootstrap';
import { BootstrapProgressBar } from './components/BootstrapProgressBar';
import { BootstrapStatusTicker } from './components/BootstrapStatusTicker';

export function StartupLoadingPage() {
  const insets = useSafeAreaInsets();
  const { progress, currentLabel } = useStartupBootstrap();

  // Subtle pulsing animation for the center brand icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, [pulseAnim]);

  return (
    <View
      className="flex-1 bg-primary items-center justify-between px-6"
      style={{
        paddingTop: Math.max(insets.top, 32) + 40,
        paddingBottom: Math.max(insets.bottom, 24) + 24,
      }}
    >
      <StatusBar style="light" />

      {/* Decorative top spacer */}
      <View className="w-full" />

      {/* Center Hero: Brand Icon + App Name + Tagline */}
      <View className="items-center">
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-2 border-white/30 shadow-lg mb-5"
        >
          <Sparkles size={46} color={theme.colors.card} />
        </Animated.View>

        <Text className="font-heading text-display text-neutral-white tracking-wider">
          AureSkin
        </Text>
        <Text className="mt-1 font-sans-medium text-body-sm text-neutral-white/80">
          Personalized AI Skincare
        </Text>
      </View>

      {/* Bottom Area: Rotating Status Ticker + Progress Bar */}
      <View className="w-full items-center">
        <BootstrapStatusTicker label={currentLabel} />
        <BootstrapProgressBar progress={progress} />
      </View>
    </View>
  );
}

export default StartupLoadingPage;

