import { theme } from '@/shared/theme';
import { Image } from 'expo-image';
import { ChevronRight, Package } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RoutineStep } from '../../model/routine_types';

type TimelinePosition = 'first' | 'middle' | 'last' | 'only';

interface RoutineStepCardProps {
  step: RoutineStep;
  displayStepNumber: number;
  position: TimelinePosition;
  onPress: () => void;
}

export function RoutineStepCard({ step, displayStepNumber, position, onPress }: RoutineStepCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [step.product?.image_url]);

  return (
    <View className="min-h-24 flex-row">
      <View className="w-10 items-center">
        {position !== 'first' && position !== 'only' && <View className="absolute left-5 top-0 h-2 w-px bg-border" />}
        <View className="z-10 mt-2 h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Text className="text-caption font-sans-bold text-primary">{displayStepNumber}</Text>
        </View>
        {position !== 'last' && position !== 'only' && <View className="absolute bottom-0 left-5 top-12 w-px bg-border" />}
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Edit step ${displayStepNumber}, ${step.step_name}`}
        className="mb-3 ml-2 flex-1 rounded-button bg-card p-3 active:opacity-75"
      >
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="text-body-sm font-sans-bold text-text">{step.step_name}</Text>
            <Text className="mt-1 text-caption font-sans text-muted">{step.description}</Text>
          </View>
          <ChevronRight size={17} color={theme.colors.muted} />
        </View>
        {step.product && (
          <View className="mt-3 flex-row items-center border-t border-border/70 pt-3">
            <View className="h-11 w-11 overflow-hidden rounded-input bg-card items-center justify-center">
              {step.product.image_url && !imageFailed ? (
                <Image
                  source={{ uri: step.product.image_url }}
                  contentFit="cover"
                  transition={150}
                  onError={() => setImageFailed(true)}
                  accessibilityLabel={`${step.product.name} product image`}
                  className="h-full w-full"
                />
              ) : (
                <Package size={19} color={theme.colors.muted} />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-caption font-sans-semibold text-text">{step.product.name}</Text>
              <Text className="text-caption font-sans text-muted">
                {[step.product.brand, step.product.category].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}