import React from 'react';
import { View, Text, Image } from 'react-native';

const AURESKIN_LOGO = require('@/assets/images/aureskin-logo.png');

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
      <Image
        source={AURESKIN_LOGO}
        style={{ width: 90, height: 90 }}
        className="mb-3"
        resizeMode="contain"
        accessibilityLabel="AureSkin Logo"
      />
      <Text className="text-display font-brand tracking-wider">
        <Text className="text-primary">Aure</Text>
        <Text className="text-secondary">Skin</Text>
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

export default HeroBranding;
