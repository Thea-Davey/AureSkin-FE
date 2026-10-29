import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export interface S2PhotoPreviewProps {
  imageUri: string;
  isImageError: boolean;
  onImageError: () => void;
}

/**
 * Preview container for Scan Submit screen (Section 4.4).
 * Displays:
 * - High-resolution face photo preview inside a rounded-card frame.
 * - Error fallback card if the image file cannot be resolved.
 * - Static guidance prompt pill ("Make sure your face is evenly lit and in focus").
 */
export const S2PhotoPreview: React.FC<S2PhotoPreviewProps> = ({
  imageUri,
  isImageError,
  onImageError,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* 1. Large Face Photo Preview Card */}
      <View className="w-[92%] max-w-[360px] aspect-[4/5] rounded-card overflow-hidden bg-neutral-card/5 border border-neutral-white/15 items-center justify-center relative shadow-2xl">
        {isImageError ? (
          <View className="items-center justify-center p-6 text-center">
            <View className="w-14 h-14 rounded-full bg-neutral-white/10 items-center justify-center mb-3">
              <ImageOff size={28} color={theme.colors.card} />
            </View>
            <Text className="text-body-sm font-sans-bold text-neutral-white text-center mb-1">
              Photo Unavailable
            </Text>
            <Text className="text-caption font-sans text-neutral-white/70 text-center leading-4 px-2">
              The selected photo could not be loaded. Please tap Retake below to choose another.
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            onError={onImageError}
          />
        )}
      </View>

      {/* 2. Static Guidance Prompt Pill */}
      <View className="bg-neutral-white rounded-button px-5 py-2 mt-5 items-center justify-center shadow-md">
        <Text className="text-caption font-sans-bold text-neutral-text text-center">
          Make sure your face is evenly lit and in focus
        </Text>
      </View>
    </View>
  );
};

export default S2PhotoPreview;

