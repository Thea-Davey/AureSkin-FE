import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface HeroCardProps {
  onScanPress: () => void;
}

export function HeroCard({ onScanPress }: HeroCardProps) {
  return (
    <View className="bg-background rounded-card p-5 border border-border shadow-xs overflow-visible relative mb-6">
      {/* Row 1: Title */}
      <Text className="text-h2 font-sans-bold text-text mb-2.5">
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
          <TouchableOpacity
            onPress={onScanPress}
            activeOpacity={0.8}
            className="bg-secondary py-3 px-5 rounded-button self-start shadow-sm flex-row items-center justify-center"
          >
            <Text className="text-card text-label font-sans-bold tracking-wider">
              SCAN SKIN NOW!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Col 2: The Image (hanging outside bottom edge) */}
        <View className="w-[130px] h-[90px] relative overflow-visible items-end justify-end">
          <Image
            source={require('@/assets/images/home-img1.png')}
            style={{
              position: 'absolute',
              right: -16,
              bottom: -56,
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
