import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight, Sun, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/shared/theme';
import { RoutineStep } from '../../model/home_types';
import { RoutineStepItem } from '../components/RoutineStepItem';

interface S2TodayRoutineProps {
  steps: RoutineStep[];
  routineLabel?: string;
  subtitle?: string;
  isLoading: boolean;
}

export function S2TodayRoutine({
  steps,
  routineLabel = 'Morning Routine',
  subtitle = 'Protect & hydrate your skin',
  isLoading,
}: S2TodayRoutineProps) {
  const router = useRouter();
  const isMorning = routineLabel.toLowerCase().includes('morning');

  const displaySteps = steps && steps.length > 0 ? steps.slice(0, 3) : [];

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
        <View className="bg-card rounded-card overflow-hidden border border-border shadow-xs">
          {/* Header Banner (Sun/Moon + Routine Title) */}
          <View className="bg-background px-4 py-3 flex-row items-center border-b border-border">
            <View className="mr-3 p-1.5 rounded-full bg-secondary/20">
              {isMorning ? (
                <Sun size={20} color={theme.colors.secondary} />
              ) : (
                <Moon size={20} color={theme.colors.primary} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-bold text-text">
                {routineLabel}
              </Text>
              <Text className="text-caption font-sans text-muted">
                {subtitle}
              </Text>
            </View>
          </View>

          {/* Ordered Timeline Steps using RoutineStepItem */}
          <View className="px-5 py-4">
            {displaySteps.length === 0 ? (
              <View className="py-2 items-center justify-center">
                <Text className="text-body-sm font-sans text-muted text-center mb-2.5">
                  No routine steps generated yet.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/routine')}
                  activeOpacity={0.8}
                  className="bg-primary py-2 px-3.5 rounded-button"
                >
                  <Text className="text-card text-caption font-sans-bold tracking-wide">
                    VIEW ROUTINES
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              displaySteps.map((step, index) => (
                <RoutineStepItem
                  key={step.step_number || index}
                  step={step}
                  index={index}
                  isLast={index === displaySteps.length - 1}
                />
              ))
            )}
          </View>
        </View>
      )}
    </View>
  );
}
