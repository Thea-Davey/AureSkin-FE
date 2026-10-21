import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/shared/theme';
import { LatestAnalysis } from '../../model/home_types';
import { AnalysisSummaryCard } from '../components/AnalysisSummaryCard';

interface S1LatestAnalysisProps {
  latestAnalysis: LatestAnalysis | null;
  isLoading: boolean;
}

export function S1LatestAnalysis({ latestAnalysis, isLoading }: S1LatestAnalysisProps) {
  const router = useRouter();

  return (
    <View className="mb-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-h3 font-sans-bold text-card tracking-wide">
          Latest Result
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/history')}
          activeOpacity={0.7}
          className="flex-row items-center"
        >
          <Text className="text-body-sm font-sans-medium text-card/90 mr-0.5">
            See Results
          </Text>
          <ChevronRight size={16} color={theme.colors.card} />
        </TouchableOpacity>
      </View>

      {/* Summary Card with Health Gauge */}
      <AnalysisSummaryCard
        latestAnalysis={latestAnalysis}
        isLoading={isLoading}
        onScanPress={() => router.push('/(tabs)/scan')}
      />
    </View>
  );
}
