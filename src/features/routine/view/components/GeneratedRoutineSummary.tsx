import { Moon, Sun } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { theme } from '@/shared/theme';
import { Routine, RoutineTimeOfDay } from '../../model/routine_types';

interface GeneratedRoutineSummaryProps {
  routine: Routine;
}

const periods: Array<{
  label: string;
  timeOfDay: RoutineTimeOfDay;
  subtitle: string;
  Icon: typeof Sun;
}> = [
  { label: 'Morning Routine', timeOfDay: 'morning', subtitle: 'Protect & hydrate your skin', Icon: Sun },
  { label: 'Night Routine', timeOfDay: 'evening', subtitle: 'Repair & nourish your skin', Icon: Moon },
];

export function GeneratedRoutineSummary({ routine }: GeneratedRoutineSummaryProps) {
  return (
    <View className="gap-4">
      <View className="items-center px-2 py-2">
        <Text className="text-h2 font-sans-bold text-text">Your Routine Is Ready</Text>
        <Text className="mt-1 text-center text-body-sm font-sans text-muted">
          Here is your personalized starting point.
        </Text>
      </View>

      {periods.map(({ label, timeOfDay, subtitle, Icon }) => {
        const steps = routine.steps
          .filter((step) => step.time_of_day === timeOfDay || step.time_of_day === 'both')
          .sort((first, second) => first.step_number - second.step_number);

        return (
          <View key={timeOfDay} className="rounded-card border border-border bg-card p-4">
            <View className="mb-4 flex-row items-center border-b border-border pb-3">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                <Icon color={theme.colors.primary} size={21} />
              </View>
              <View className="flex-1">
                <Text className="text-h3 font-sans-bold text-text">{label}</Text>
                <Text className="text-caption font-sans text-muted">{subtitle}</Text>
              </View>
            </View>
            {steps.length ? (
              <View className="gap-4">
                {steps.map((step) => (
                  <View key={step.id} className="flex-row">
                    <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-primary">
                      <Text className="text-caption font-sans-bold text-neutral-white">
                        {step.step_number}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-body-sm font-sans-bold text-text">{step.step_name}</Text>
                      <Text className="mt-1 text-caption font-sans text-muted">
                        {step.description}
                      </Text>
                      {step.product ? (
                        <Text className="mt-1 text-caption font-sans-medium text-primary">
                          {step.product.brand ? `${step.product.brand} · ` : ''}{step.product.name}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-body-sm font-sans text-muted">
                No steps were provided for this part of your routine.
              </Text>
            )}
          </View>
        );
      })}

      {routine.rationale ? (
        <View className="rounded-card bg-accent/10 p-4">
          <Text className="text-body-sm font-sans-bold text-text">Why this routine?</Text>
          <Text className="mt-1 text-body-sm font-sans text-text">{routine.rationale}</Text>
        </View>
      ) : null}
    </View>
  );
}