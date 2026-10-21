import { Check, FlaskConical, ScanFace } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { theme } from '@/shared/theme';

interface GenerateRoutineCardProps {
  canGenerate: boolean;
  isGenerating: boolean;
  errorMessage: string | null;
  onGenerate: () => void;
  onScanPress: () => void;
}

const benefits = [
  'Step-by-step AM & PM guide',
  'Ingredient safety match',
  'Adaptive product suggestions',
];

export function GenerateRoutineCard({
  canGenerate,
  isGenerating,
  errorMessage,
  onGenerate,
  onScanPress,
}: GenerateRoutineCardProps) {
  return (
    <View className="rounded-card border border-border bg-card p-5 shadow-sm">
      <View className="mb-4 items-center">
        <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-accent/15">
          <FlaskConical color={theme.colors.primary} size={25} />
        </View>
        <Text className="text-center text-h2 font-sans-bold text-text">
          Ready for Your Custom Regimen?
        </Text>
        <Text className="mt-2 text-center text-body-sm font-sans text-muted">
          Get a personalized morning and evening routine built around your skin profile.
        </Text>
      </View>

      <View className="mb-5 gap-3">
        {benefits.map((benefit) => (
          <View key={benefit} className="flex-row items-start">
            <View className="mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-status-success/15">
              <Check color={theme.colors.accent} size={13} strokeWidth={3} />
            </View>
            <Text className="flex-1 text-body-sm font-sans-medium text-text">{benefit}</Text>
          </View>
        ))}
      </View>

      {errorMessage ? (
        <View
          accessibilityRole="alert"
          className="mb-3 rounded-button border border-error/30 bg-error/10 px-3 py-2"
        >
          <Text className="text-body-sm font-sans-medium text-error">{errorMessage}</Text>
        </View>
      ) : null}

      {canGenerate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Generate personalized skincare routine"
          accessibilityState={{ disabled: isGenerating, busy: isGenerating }}
          disabled={isGenerating}
          onPress={onGenerate}
          className={`min-h-12 flex-row items-center justify-center rounded-button px-4 py-3 ${
            isGenerating ? 'bg-primary/60' : 'bg-primary active:opacity-80'
          }`}
        >
          {isGenerating ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text className="text-center text-label font-sans-bold text-neutral-white">
              GENERATE SKINCARE ROUTINE
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start a skin scan"
          onPress={onScanPress}
          className="min-h-12 flex-row items-center justify-center rounded-button bg-primary px-4 py-3 active:opacity-80"
        >
          <ScanFace color={theme.colors.white} size={19} />
          <Text className="ml-2 text-center text-label font-sans-bold text-neutral-white">
            START A SKIN SCAN
          </Text>
        </Pressable>
      )}

      {!canGenerate ? (
        <Text className="mt-2 text-center text-caption font-sans text-muted">
          A recent skin scan is needed to personalize your routine.
        </Text>
      ) : null}
    </View>
  );
}