import { theme } from '@/shared/theme';
import { Image } from 'expo-image';
import { Activity, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

interface HistoryAnalysisHeroProps {
  imageUrl: string | null;
  skinType: string | null;
  healthScore: number | null;
}

export function HistoryAnalysisHero({ imageUrl, skinType, healthScore }: HistoryAnalysisHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const score = typeof healthScore === 'number' && Number.isFinite(healthScore)
    ? `${Math.max(0, Math.min(100, healthScore)).toFixed(2)}%`
    : 'Unavailable';

  return (
    <View className="overflow-hidden rounded-card border border-border bg-card">
      <View className="aspect-[4/3] w-full items-center justify-center bg-background">
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            contentFit="cover"
            transition={180}
            onError={() => setImageFailed(true)}
            accessibilityLabel="Photo from this skin analysis"
            className="h-full w-full"
          />
        ) : (
          <View className="items-center justify-center">
            <UserRound size={58} color={theme.colors.muted} />
            <Text className="mt-2 text-body-sm font-sans text-muted">Scan photo unavailable</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between bg-secondary/25 px-5 py-4">
        <View className="mr-3 flex-1">
          <Text className="mb-1 text-body-sm font-sans-medium text-muted">Your Skin Type is</Text>
          <Text className="text-h2 font-sans-bold text-text">{skinType || 'Unknown'}</Text>
        </View>
        <View className="min-w-24 items-center rounded-card bg-card px-4 py-3">
          <Activity size={20} color={theme.colors.accent} />
          <Text className="mt-1 text-h3 font-sans-bold text-text">{score}</Text>
          <Text className="text-caption font-sans-medium text-muted">HEALTH SCORE</Text>
        </View>
      </View>
    </View>
  );
}