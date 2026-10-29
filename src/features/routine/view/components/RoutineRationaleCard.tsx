import { theme } from '@/shared/theme';
import { ShieldCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { RoutineSkinProfile } from '../../model/routine_types';

interface RoutineRationaleCardProps {
  rationale: string | null;
  skinProfile: RoutineSkinProfile | null;
}

export function RoutineRationaleCard({ rationale, skinProfile }: RoutineRationaleCardProps) {
  const fallback = skinProfile?.concerns.length
    ? `This routine is based on your latest skin analysis and saved goals, including ${skinProfile.concerns.join(', ')}.`
    : 'This routine is based on your latest skin analysis and its saved routine steps.';

  return (
    <View className="flex-row rounded-card border border-primary/20 bg-primary-light p-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-card">
        <ShieldCheck size={22} color={theme.colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-h3 font-sans-bold text-text">Why this routine?</Text>
        <Text className="text-body-sm font-sans text-text">{rationale || fallback}</Text>
      </View>
    </View>
  );
}