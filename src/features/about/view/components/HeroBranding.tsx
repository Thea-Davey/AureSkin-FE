import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface HeroBrandingProps {
  version?: string;
  releaseDate?: string;
}

export function HeroBranding({
  version = '1.0.0',
  releaseDate = 'Release 2026.1',
}: HeroBrandingProps) {
  return (
    <View className="mb-6 items-center pt-2">
      <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary/20">
        <Sparkles size={36} color={theme.colors.primary} />
      </View>
      <Text className="text-display font-heading text-primary">
        AureSkin
      </Text>
      <Text className="mt-1 text-center text-body font-sans-medium text-text">
        Your Personal Skin Health Companion
      </Text>
      <View className="mt-3 rounded-badge bg-neutral-border px-3.5 py-1">
        <Text className="text-caption font-sans-semibold text-neutral-text">
          Version {version} ({releaseDate})
        </Text>
      </View>
    </View>
  );
}

