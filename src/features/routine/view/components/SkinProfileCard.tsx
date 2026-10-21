import { Droplet, ScanFace, Sparkles, UserRound } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { theme } from '@/shared/theme';
import { RoutineSkinProfile } from '../../model/routine_types';

interface SkinProfileCardProps {
  profile: RoutineSkinProfile | null;
}

export function SkinProfileCard({ profile }: SkinProfileCardProps) {
  const metrics = [
    {
      label: 'Skin Type',
      value: profile?.skinType ?? 'Not available',
      Icon: Droplet,
    },
    {
      label: 'Concerns',
      value: profile?.concerns.length ? profile.concerns.join(', ') : 'None detected',
      Icon: ScanFace,
    },
    {
      label: 'Skin Condition',
      value: profile?.healthScore == null ? 'Not available' : `${Math.round(profile.healthScore)}%`,
      Icon: Sparkles,
    },
  ];

  return (
    <View className="rounded-card border border-border bg-card p-4 shadow-sm">
      <View className="mb-4 flex-row items-center">
        <View
          accessibilityLabel="Skin profile illustration"
          className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-secondary/20"
        >
          <UserRound color={theme.colors.primary} size={30} strokeWidth={1.7} />
        </View>
        <View className="flex-1">
          <Text className="text-h3 font-sans-bold text-text">Your Skin Profile</Text>
          <Text className="text-body-sm font-sans text-muted">
            Based on your latest skin analysis
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {metrics.map(({ label, value, Icon }) => (
          <View
            key={label}
            className="min-h-28 flex-1 items-center rounded-button bg-background px-2 py-3"
          >
            <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Icon color={theme.colors.primary} size={19} />
            </View>
            <Text className="text-center text-caption font-sans-medium text-muted">{label}</Text>
            <Text
              numberOfLines={2}
              className="mt-1 text-center text-body-sm font-sans-semibold text-text"
            >
              {value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}