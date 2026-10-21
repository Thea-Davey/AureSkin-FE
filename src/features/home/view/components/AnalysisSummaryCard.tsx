import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '@/shared/theme';
import { LatestAnalysis } from '../../model/home_types';
import { HealthGauge } from './HealthGauge';

interface AnalysisSummaryCardProps {
  latestAnalysis: LatestAnalysis | null;
  isLoading: boolean;
  onScanPress: () => void;
}

export function AnalysisSummaryCard({
  latestAnalysis,
  isLoading,
  onScanPress,
}: AnalysisSummaryCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-row items-stretch gap-2">
        <View className="flex-1 bg-background rounded-card p-4 h-[126px] justify-center items-center">
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text className="text-muted text-caption font-sans-medium mt-2">
            Loading latest scan...
          </Text>
        </View>
        <View className="w-[124px] bg-background rounded-card h-[126px] items-center justify-center">
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!latestAnalysis) {
    return (
      <TouchableOpacity
        onPress={onScanPress}
        activeOpacity={0.85}
        className="bg-card rounded-card p-5 items-center justify-center border border-border shadow-xs"
      >
        <Text className="text-body font-sans-bold text-text mb-1">
          No Scans Yet
        </Text>
        <Text className="text-body-sm font-sans text-muted text-center mb-3">
          Tap to analyze your skin type, conditions, and health score!
        </Text>
        <View className="bg-primary py-2 px-4 rounded-button">
          <Text className="text-card text-caption font-sans-bold tracking-wide">
            START FIRST SCAN
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-stretch gap-2">
      {/* Left Block: Skin Type, Conditions, Date */}
      <View className="flex-1 flex-col gap-2">
        {/* Top row: Skin Type & Skin Condition/s */}
        <View className="flex-row gap-2 flex-1">
          {/* Skin Type Box (40% width) */}
          <View
            style={{ flex: 2 }}
            className="bg-secondary rounded-card p-2.5 justify-between"
          >
            <Text className="text-caption font-sans-semibold text-text">
              Skin Type:
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="text-h3 font-sans-bold text-card capitalize mt-0.5"
            >
              {latestAnalysis.skin_type}
            </Text>
          </View>

          {/* Conditions Box (60% width - longer than Skin Type) */}
          <View
            style={{ flex: 3 }}
            className="bg-background rounded-card p-2.5 justify-between"
          >
            <Text className="text-caption font-sans-semibold text-muted">
              Skin Condition/s:
            </Text>
            <View className="flex-row flex-wrap gap-1 mt-1">
              {latestAnalysis.conditions && latestAnalysis.conditions.length > 0 ? (
                latestAnalysis.conditions.slice(0, 2).map((condition, idx) => (
                  <View
                    key={idx}
                    className="bg-error px-2 py-0.5 rounded-badge"
                  >
                    <Text
                      numberOfLines={1}
                      className="text-caption font-sans-bold text-card"
                    >
                      {condition}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="bg-accent px-2 py-0.5 rounded-badge">
                  <Text className="text-caption font-sans-bold text-card">
                    Clear
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Bottom Row: Date Scanned Pill (Equal gap-2 from top row) */}
        <View className="bg-card rounded-button px-3.5 py-2 flex-row items-center justify-between border border-border shadow-xs">
          <Text className="text-caption font-sans-bold text-text">
            Date Scanned:
          </Text>
          <Text className="text-caption font-sans-medium text-muted">
            {formatDate(latestAnalysis.created_at)}
          </Text>
        </View>
      </View>

      {/* Right Block: Health Gauge in White Card */}
      <View className="w-[124px] bg-card rounded-card items-center justify-center p-2 border border-border shadow-xs">
        <HealthGauge percentage={latestAnalysis.health_score ?? 0} size={106} />
      </View>
    </View>
  );
}
