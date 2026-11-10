import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image as RNImage } from 'react-native';
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
  const [retryKey, setRetryKey] = useState<number>(0);
  const [useFallbackImage, setUseFallbackImage] = useState<boolean>(false);

  useEffect(() => {
    setRetryKey(0);
    setUseFallbackImage(false);
  }, [imageUri]);

  const handleExpoImageError = (err: any) => {
    console.warn('[PhotoPreview] expo-image failed:', imageUri, err);
    if (retryKey < 2) {
      setTimeout(() => {
        setRetryKey((prev) => prev + 1);
      }, 200);
    } else {
      setUseFallbackImage(true);
    }
  };

  const handleRNImageError = (err: any) => {
    console.warn('[PhotoPreview] RN Image also failed:', imageUri, err);
    onImageError();
  };

  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* 1. Large Face Photo Preview Card */}
      <View
        className="w-[92%] max-w-[360px] aspect-[4/5] rounded-card overflow-hidden border border-neutral-white/20 items-center justify-center relative"
        style={{ backgroundColor: '#141414' }}
      >
        {!imageUri ? (
          <View className="items-center justify-center p-6">
            <ActivityIndicator size="large" color={theme.colors.card} />
            <Text className="text-caption font-sans text-neutral-white/80 mt-3">
              Loading photo preview...
            </Text>
          </View>
        ) : isImageError ? (
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
        ) : !useFallbackImage ? (
          <Image
            key={`expo-${imageUri}-${retryKey}`}
            source={{ uri: imageUri }}
            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
            contentFit="cover"
            transition={200}
            onError={handleExpoImageError}
          />
        ) : (
          <RNImage
            key={`rn-${imageUri}-${retryKey}`}
            source={{ uri: imageUri }}
            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
            resizeMode="cover"
            onError={handleRNImageError}
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

