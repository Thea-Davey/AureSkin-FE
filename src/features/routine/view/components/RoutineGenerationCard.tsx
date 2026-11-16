import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowRight, Check, FlaskConical, Star } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Button } from '@/shared/components/Button';

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
  return (
    <View className="items-center rounded-card border border-neutral-border bg-neutral-offwhite p-6 shadow-xs">
      {/* Centered Beaker / Flask Icon with Star Badge */}
      <View className="relative mb-3 h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-white bg-neutral-card shadow-xs">
        <FlaskConical size={34} color={theme.colors.primary} />
        {/* Star Badge */}
        <View className="absolute -top-1 -right-1 h-6 w-6 items-center justify-center rounded-full border border-border/40 bg-neutral-white shadow-xs">
          <Star size={12} color={theme.colors.secondary} fill={theme.colors.secondary} />
        </View>
      </View>

      {/* Heading */}
      <Text className="text-center text-h2 font-sans-bold text-text">
        Ready for Your Custom Regimen?
      </Text>

      {/* General Body Text */}
      <Text className="mt-2 mb-5 px-2 text-center text-body-sm font-sans text-muted leading-5">
        Our dermatological engine will formulate an AM & PM routine perfectly balanced for your unique skin.
      </Text>

      {/* 3 Checklist Items Wrapped in White Container Cards */}
      <View className="w-full gap-2.5 mb-6">
        {BENEFITS.map((benefit) => (
          <View
            key={benefit}
            className="flex-row items-center rounded-button border border-border/40 bg-neutral-white p-3 shadow-xs"
          >
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-note-positive">
              <Check size={14} color={theme.colors.note.positive.icon} strokeWidth={2.5} />
            </View>
            <Text className="flex-1 text-body-sm font-sans-medium text-text">
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      {/* Error Message */}
      {error && (
        <Pressable
          onPress={onDismissError}
          accessibilityRole="alert"
          className="mb-3 w-full rounded-button bg-status-error/10 p-3"
        >
          <Text className="text-center text-body-sm font-sans text-error">{error}</Text>
        </Pressable>
      )}

      {/* Primary CTA Button: GENERATE SKINCARE ROUTINE (Secondary Color Token) */}
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        title="GENERATE SKINCARE ROUTINE"
        onPress={onGenerate}
        isLoading={isGenerating}
        disabled={!canGenerate}
        accessibilityLabel="Generate personalized skincare routine"
        rightIcon={<ArrowRight size={18} color={theme.colors.white} strokeWidth={2.2} />}
        className="min-h-12 py-3.5 px-4 shadow-md"
        textClassName="mr-2 text-label font-sans-bold text-neutral-white tracking-wide"
      />

      {!canGenerate && !isGenerating && (
        <Text className="mt-2 text-center text-caption font-sans text-muted">
          A completed skin scan is needed first.
        </Text>
      )}
    </View>
  );
}
