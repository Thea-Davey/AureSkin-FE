import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button } from '@/shared/components/Button';

interface HeroCardProps {
  onScanPress: () => void;
}

export function HeroCard({ onScanPress }: HeroCardProps) {
  return (
    <View className="bg-background rounded-card p-5 border border-border shadow-xs overflow-visible relative mb-4">
      {/* Row 1: Title */}
      <Text className="text-h3 font-sans-bold text-text mb-2.5">
        How is your skin today?
      </Text>

      {/* Row 2: Two Columns */}
      <View className="flex-row items-center justify-between overflow-visible">
        {/* Col 1: [row 1: subtext] [row 2: button] */}
        <View className="flex-1 pr-3 z-10">
          {/* Row 1 of Col 1: Subtext */}
          <Text className="text-body-sm font-sans text-muted mb-4">
            Want to check how your skin is doing?
          </Text>

          {/* Row 2 of Col 1: Button */}
          <Button
            onPress={onScanPress}
            variant="secondary"
            size="md"
            title="SCAN SKIN NOW!"
            className="self-start py-3 px-5 shadow-sm"
            textClassName="text-card text-label font-sans-bold tracking-wider"
          />
        </View>

        {/* Col 2: The Image (hanging outside bottom edge) */}
        <View className="w-[130px] h-[90px] relative overflow-visible items-end justify-end">
          <Image
            source={require('@/assets/images/home-img1.png')}
            style={{
              position: 'absolute',
              right: -12,
              bottom: -55.69,
              width: 172,
              height: 172,
              zIndex: 20,
            }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
