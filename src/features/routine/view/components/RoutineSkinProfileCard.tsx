import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Droplet } from 'lucide-react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { theme } from '@/shared/theme';
import { RoutineSkinProfile } from '../../model/routine_types';

interface RoutineSkinProfileCardProps {
  profile: RoutineSkinProfile | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onStartScan: () => void;
}

export function RoutineSkinProfileCard({
  profile,
  isLoading,
  error,
  onRetry,
  onStartScan,
}: RoutineSkinProfileCardProps) {
  const analysisDate = profile?.analysis_date;
  const skinType = profile?.skin_type ?? 'Not available';
  const concernsList = profile?.concerns && profile.concerns.length > 0
    ? profile.concerns
    : ['None detected'];
  const healthScore = typeof profile?.health_score === 'number'
    ? Math.round(profile.health_score)
    : 89;

  // SVG Gauge calculations matching Home HealthGauge (size 92, strokeWidth 8)
  const gaugeSize = 92;
  const strokeWidth = 8;
  const radius = (gaugeSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * healthScore) / 100;

  return (
    <View className="rounded-card border border-neutral-border bg-card p-3.5 shadow-xs">
      {/* Row 1: Smaller Title & Subtitle */}
      <View className="mb-3">
        <Text className="text-body-sm font-sans-bold text-text">Your Skin Profile</Text>
        {analysisDate ? (
          <Text className="mt-0.5 text-caption font-sans text-muted">
            Based on your latest skin analysis: {analysisDate}
          </Text>
        ) : null}
      </View>

      {/* Row 2: Content States */}
      {isLoading ? (
        <View className="min-h-24 items-center justify-center">
          <ActivityIndicator color={theme.colors.primary} />
          <Text className="mt-2 text-caption font-sans text-muted">Loading your skin profile...</Text>
        </View>
      ) : error ? (
        <View className="rounded-button bg-status-error/10 p-3">
          <Text accessibilityRole="alert" className="mb-2 text-body-sm font-sans text-error">
            {error}
          </Text>
          <Pressable onPress={onRetry} accessibilityRole="button" className="self-start py-1">
            <Text className="text-label font-sans-semibold text-primary">Retry</Text>
          </Pressable>
        </View>
      ) : profile ? (
        <View className="flex-row items-center justify-between">
          {/* Left Column: Type & Concerns (Labels styled smaller for more content room) */}
          <View className="flex-1 mr-3 gap-2">
            {/* Row 1: Type */}
            <View className="flex-row items-center justify-between rounded-badge bg-primary/10 px-3 py-1.5">
              <View className="flex-row items-center">
                <Droplet size={14} color={theme.colors.primary} />
                <Text className="ml-1 text-caption font-sans text-muted">Type</Text>
              </View>
              <Text className="text-body-sm font-sans-bold text-text">{skinType}</Text>
            </View>

            {/* Row 2: Concerns */}
            <View className="flex-row items-start justify-between rounded-card bg-primary/10 px-3 py-2">
              <View className="flex-row items-center mt-0.5">
                <Droplet size={14} color={theme.colors.primary} />
                <Text className="ml-1 text-caption font-sans text-muted">Concerns</Text>
              </View>
              <View className="flex-1 items-end pl-2">
                {concernsList.map((concern, index) => (
                  <Text
                    key={`${concern}-${index}`}
                    className="text-right text-caption font-sans-bold text-text leading-4"
                  >
                    {concern}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Right Column: Health Gauge matching Home (Transparent inner background, thick stroke, text inside circle) */}
          <View
            style={{ width: gaugeSize, height: gaugeSize }}
            className="items-center justify-center relative"
          >
            <Svg width={gaugeSize} height={gaugeSize}>
              <G rotation="-90" origin={`${gaugeSize / 2}, ${gaugeSize / 2}`}>
                {/* Background Ring (Thick stroke, transparent fill) */}
                <Circle
                  cx={gaugeSize / 2}
                  cy={gaugeSize / 2}
                  r={radius}
                  stroke={theme.colors.border}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress Ring (Accent green, transparent fill) */}
                <Circle
                  cx={gaugeSize / 2}
                  cy={gaugeSize / 2}
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

            {/* Center Label inside the circle */}
            <View className="absolute items-center justify-center">
              <Text className="text-h3 font-sans-bold text-accent tracking-tight">
                {healthScore}%
              </Text>
              <Text className="text-caption font-sans-bold text-accent tracking-wider">
                HEALTHY
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="items-center rounded-button bg-neutral-card px-4 py-4 border border-border">
          <Text className="mb-2 text-center text-body-sm font-sans text-muted">
            Complete a skin scan to personalize your routine.
          </Text>
          <Pressable
            onPress={onStartScan}
            accessibilityRole="button"
            className="rounded-button bg-primary px-4 py-2.5 active:opacity-80"
          >
            <Text className="text-label font-sans-bold text-neutral-white">Start a skin scan</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
