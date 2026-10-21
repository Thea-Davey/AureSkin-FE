import React from 'react';
import { View, Text } from 'react-native';
import { RoutineStep } from '../../model/home_types';

interface RoutineStepItemProps {
  step: RoutineStep;
  index: number;
  isLast: boolean;
}

export function RoutineStepItem({ step, index, isLast }: RoutineStepItemProps) {
  return (
    <View className="flex-row items-start">
      {/* Left: Number Badge + Connector Line */}
      <View className="items-center mr-3.5">
        <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
          <Text className="text-caption font-sans-bold text-primary">
            {step.step_number || index + 1}
          </Text>
        </View>
        {!isLast && (
          <View className="w-[1.5px] h-7 bg-primary/20 my-0.5" />
        )}
      </View>

      {/* Right: Step Title & Description */}
      <View className="flex-1 pb-2">
        <Text className="text-body-sm font-sans-bold text-text">
          {step.title}
        </Text>
        <Text className="text-caption font-sans text-muted mt-0.5">
          {step.description}
        </Text>
      </View>
    </View>
  );
}
