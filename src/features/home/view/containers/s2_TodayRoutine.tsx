import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/shared/theme';
import { RoutineStep } from '../../model/home_types';
import { TodaysRoutineCard } from '../components/TodaysRoutineCard';

interface S2TodayRoutineProps {
  steps: RoutineStep[];
  routineLabel?: string;
  subtitle?: string;
  isLoading: boolean;
}

export function S2TodayRoutine({
  steps,
  routineLabel = 'Morning Routine',
  isLoading,
}: S2TodayRoutineProps) {
  const router = useRouter();
  const isMorning = routineLabel.toLowerCase().includes('morning');

  return (
    <View className="mb-5">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-h3 font-sans-bold text-card tracking-wide">
          Today's Skincare Routine
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/routine')}
          activeOpacity={0.7}
          className="flex-row items-center"
        >
          <Text className="text-body-sm font-sans-medium text-card/90 mr-0.5">
            See Routine
          </Text>
          <ChevronRight size={16} color={theme.colors.card} />
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      {isLoading ? (
        <View className="bg-card rounded-card p-6 h-[180px] items-center justify-center border border-border shadow-xs">
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text className="text-muted text-caption font-sans-medium mt-2">
            Loading today's routine...
          </Text>
        </View>
      ) : (
        <TodaysRoutineCard
          styleType={isMorning ? 'morning' : 'night'}
          steps={steps}
          onPressCard={() => router.push('/(tabs)/routine')}
        />
      )}
    </View>
  );
}

export default S2TodayRoutine;
