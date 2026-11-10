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

function formatConditionName(condition: string): string {
  const normalized = condition.trim().toLowerCase();
  if (normalized === 'inflammatory acne') {
    return 'Acne';
  }
  if (normalized === 'enlarged pores') {
    return 'Pores';
  }
  return condition;
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
      <View className="w-full bg-card rounded-card p-5 h-[130px] justify-center items-center border border-border shadow-xs">
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text className="text-muted text-caption font-sans-medium mt-2">
          Loading latest scan...
        </Text>
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
        <Text className="text-body-sm font-sans text-muted text-center mb-0">
          Tap to analyze your skin type, conditions, and health score!
        </Text>
        {/* <View className="bg-primary py-2 px-4 rounded-button">
          <Text className="text-card text-caption font-sans-bold tracking-wide">
            START FIRST SCAN
          </Text>
        </View> */}
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-stretch gap-2">
      {/* Left Block: Skin Type & Skin Condition/s + Date Scanned */}
      <View className="flex-1 flex-col gap-2">
        {/* Top Row: Skin Type & Skin Condition/s Containers */}
        <View className="flex-row gap-2 flex-1">
          {/* Skin Type Box (tan background) */}
          <View
            style={{ flex: 1.1 }}
            className="bg-secondary rounded-card p-3 justify-between"
          >
            <Text className="text-caption font-sans-medium text-text">
              Skin Type:
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="text-h3 font-sans-bold font-bold text-card capitalize mt-1 -mb-2"
            >
              {latestAnalysis.skin_type}
            </Text>
          </View>

          {/* Skin Condition/s Box (light beige background with red bullet list) */}
          <View
            style={{ flex: 1.5 }}
            className="bg-neutral-beige rounded-card p-3 justify-start"
          >
            <Text className="text-caption font-sans-medium text-text mb-1">
              Skin Condition/s:
            </Text>
            <View className="gap-0.5">
              {latestAnalysis.conditions && latestAnalysis.conditions.length > 0 ? (
                latestAnalysis.conditions.map((condition, idx) => (
                  <View key={idx} className="flex-row items-center gap-1 py-0">
                    <View
                      style={{
                        backgroundColor: theme.colors.concern,
                        width: 4,           // <-- Change size here (e.g. 5, 6, or 7)
                        height: 4,          // <-- Keep same as width
                        borderRadius: 9999, // Keeps it perfectly circular
                      }}
                      className="h-2 w-2 rounded-full bg-concern"
                    />
                    <Text
                      numberOfLines={1}
                      style={{ color: theme.colors.concern }}
                      className="text-caption font-sans-bold text-concern flex-1"
                    >
                      {formatConditionName(condition)}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="flex-row items-center gap-1.5 py-0.5">
                  {/* <View className="h-2 w-2 rounded-full bg-accent" /> */}
                  <Text className="text-caption font-sans-bold text-muted">
                    none detected
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Bottom Row: Full-width white card pill for Date Scanned */}
        <View className="bg-card rounded-button px-4 py-1 flex-row items-center justify-between border border-border shadow-xs">
          <Text className="text-caption font-sans-bold text-muted">
            Date Scanned:
          </Text>
          <Text className="text-caption font-sans-medium text-text">
            {formatDate(latestAnalysis.created_at)}
          </Text>
        </View>
      </View>

      {/* Right Block: Health Gauge in Compact White Card */}
      <View
        style={{ width: 112 }}
        className="bg-card rounded-card items-center justify-center p-2 border border-border shadow-xs">
        <HealthGauge
          percentage={latestAnalysis.health_score ?? 0}
          size={94}
          strokeWidth={10}
        />
      </View>
    </View>
  );
}

export default AnalysisSummaryCard;
