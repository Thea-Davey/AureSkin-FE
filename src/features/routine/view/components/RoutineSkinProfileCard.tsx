import { theme } from '@/shared/theme';
import { Activity, Droplet, ScanFace, UserRound } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { RoutineSkinProfile } from '../../model/routine_types';

interface RoutineSkinProfileCardProps {
  profile: RoutineSkinProfile | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onStartScan: () => void;
}

export function RoutineSkinProfileCard({
  profile,
  isLoading,
  error,
  onRetry,
  onStartScan,
}: RoutineSkinProfileCardProps) {
  const metrics = [
    { label: 'Skin Type', value: profile?.skin_type ?? 'Not available', Icon: Droplet },
    { label: 'Concerns', value: profile?.concerns.length ? profile.concerns.join(', ') : 'None detected', Icon: ScanFace },
    {
      label: 'Skin Condition',
      value: typeof profile?.health_score === 'number' ? `${profile.health_score.toFixed(0)}% score` : 'Not available',
      Icon: Activity,
    },
  ];

  return (
    <View className="rounded-card border border-border bg-card p-4">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UserRound size={25} color={theme.colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-h3 font-sans-bold text-text">Your Skin Profile</Text>
          <Text className="text-caption font-sans text-muted">Based on your latest skin analysis</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="min-h-20 items-center justify-center">
          <ActivityIndicator color={theme.colors.primary} />
          <Text className="mt-2 text-caption font-sans text-muted">Loading your profile...</Text>
        </View>
      ) : error ? (
        <View className="rounded-button bg-status-error/10 p-3">
          <Text accessibilityRole="alert" className="mb-2 text-body-sm font-sans text-error">{error}</Text>
          <Pressable onPress={onRetry} accessibilityRole="button" className="self-start py-1">
            <Text className="text-label font-sans-semibold text-primary">Retry</Text>
          </Pressable>
        </View>
      ) : profile ? (
        <>
          <View className="flex-row">
            {metrics.map(({ label, value, Icon }) => (
              <View key={label} className="min-w-0 flex-1 items-center px-1">
                <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Icon size={18} color={theme.colors.primary} />
                </View>
                <Text className="mb-1 text-center text-caption font-sans-medium text-muted">{label}</Text>
                <Text className="text-center text-body-sm font-sans-semibold text-text" numberOfLines={2}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View className="items-center rounded-button bg-background px-4 py-4">
          <Text className="mb-2 text-center text-body-sm font-sans text-muted">
            Complete a skin scan to personalize your routine.
          </Text>
          <Pressable onPress={onStartScan} accessibilityRole="button" className="rounded-button bg-primary px-4 py-2.5 active:opacity-80">
            <Text className="text-label font-sans-bold text-neutral-white">Start a skin scan</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}