import { theme } from '@/shared/theme';
import { ArrowRight, Check, FlaskConical } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const BENEFITS = [
  'Step-by-step AM & PM guide',
  'Ingredient safety match',
  'Adaptive product suggestions',
];

interface RoutineGenerationCardProps {
  isGenerating: boolean;
  error: string | null;
  canGenerate: boolean;
  onGenerate: () => void;
  onDismissError: () => void;
}

export function RoutineGenerationCard({
  isGenerating,
  error,
  canGenerate,
  onGenerate,
  onDismissError,
}: RoutineGenerationCardProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <View className="rounded-card border border-border bg-secondary/10 p-5">
      <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <FlaskConical size={25} color={theme.colors.primary} />
      </View>
      <Text className="mb-2 text-h2 font-sans-bold text-text">Ready for Your Custom Regimen?</Text>
      <Text className="mb-5 text-body-sm font-sans text-muted">
        Create a morning and evening routine based on your skin profile and goals.
      </Text>

      <View className="mb-5 gap-3">
        {BENEFITS.map((benefit) => (
          <View key={benefit} className="flex-row items-center">
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-status-success/15">
              <Check size={15} color={theme.colors.accent} />
            </View>
            <Text className="flex-1 text-body-sm font-sans-medium text-text">{benefit}</Text>
          </View>
        ))}
      </View>

      {error && (
        <Pressable onPress={onDismissError} accessibilityRole="alert" className="mb-3 rounded-button bg-status-error/10 p-3">
          <Text className="text-body-sm font-sans text-error">{error}</Text>
        </Pressable>
      )}

      <Pressable
        onPress={onGenerate}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={!canGenerate || isGenerating}
        accessibilityRole="button"
        accessibilityLabel="Generate personalized skincare routine"
        accessibilityState={{ disabled: !canGenerate || isGenerating, busy: isGenerating }}
        className={`min-h-12 flex-row items-center justify-center rounded-button bg-primary px-4 py-3 ${pressed ? 'opacity-80' : ''} disabled:opacity-50`}
      >
        {isGenerating ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            <Text className="mr-2 text-label font-sans-bold text-neutral-white">GENERATE SKINCARE ROUTINE</Text>
            <ArrowRight size={18} color={theme.colors.white} />
          </>
        )}
      </Pressable>
      {!canGenerate && !isGenerating && (
        <Text className="mt-2 text-center text-caption font-sans text-muted">A completed skin scan is needed first.</Text>
      )}
    </View>
  );
}