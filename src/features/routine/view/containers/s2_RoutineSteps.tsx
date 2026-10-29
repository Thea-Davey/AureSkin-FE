import { theme } from '@/shared/theme';
import { Moon, Sun } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { RoutineStep, SkincareRoutine } from '../../model/routine_types';
import { RoutineStepCard } from '../components/RoutineStepCard';

interface RoutineStepsProps {
  routine: SkincareRoutine;
  onEdit: (timeOfDay: 'morning' | 'evening', stepId?: string) => void;
}

function RoutineSection({
  title,
  steps,
  Icon,
  timeOfDay,
  onEdit,
}: {
  title: string;
  steps: RoutineStep[];
  Icon: typeof Sun;
  timeOfDay: 'morning' | 'evening';
  onEdit: (timeOfDay: 'morning' | 'evening', stepId?: string) => void;
}) {
  const orderedSteps = [...steps].sort((left, right) => left.step_number - right.step_number);

  return (
    <View className="overflow-hidden rounded-card border border-border bg-card">
      <View className="flex-row items-center bg-secondary/20 px-4 py-3">
        <Icon size={20} color={theme.colors.primary} />
        <View className="ml-2 flex-1">
          <Text className="text-h3 font-sans-bold text-text">{title}</Text>
          <Text className="text-caption font-sans text-muted">
            {timeOfDay === 'morning' ? 'Protect & hydrate your skin' : 'Repair & nourish your skin'}
          </Text>
        </View>
        <Pressable
          onPress={() => onEdit(timeOfDay)}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title.toLowerCase()}`}
          className="rounded-button bg-secondary/30 px-3 py-2 active:opacity-75"
        >
          <Text className="text-caption font-sans-bold text-text">EDIT</Text>
        </Pressable>
      </View>
      <View className="px-4 pt-4">
        {orderedSteps.length > 0 ? orderedSteps.map((step, index) => (
          <RoutineStepCard
            key={step.id}
            step={step}
            displayStepNumber={index + 1}
            position={orderedSteps.length === 1 ? 'only' : index === 0 ? 'first' : index === orderedSteps.length - 1 ? 'last' : 'middle'}
            onPress={() => onEdit(timeOfDay, step.id)}
          />
        )) : (
          <Text className="pb-4 text-body-sm font-sans text-muted">No steps were returned for this routine.</Text>
        )}
      </View>
    </View>
  );
}

export function S2RoutineSteps({ routine, onEdit }: RoutineStepsProps) {
  const morningSteps = routine.steps.filter((step) => step.time_of_day === 'morning' || step.time_of_day === 'both');
  const eveningSteps = routine.steps.filter((step) => step.time_of_day === 'evening' || step.time_of_day === 'both');

  return (
    <View className="gap-4">
      <View className="px-1">
        <Text className="text-h2 font-sans-bold text-neutral-white">Your Personalized Skincare Routine</Text>
        <Text className="mt-1 text-body-sm font-sans text-neutral-white/80">A simple routine tailored for your skin goals</Text>
      </View>
      <RoutineSection title="Morning Routine" steps={morningSteps} Icon={Sun} timeOfDay="morning" onEdit={onEdit} />
      <RoutineSection title="Night Routine" steps={eveningSteps} Icon={Moon} timeOfDay="evening" onEdit={onEdit} />
    </View>
  );
}