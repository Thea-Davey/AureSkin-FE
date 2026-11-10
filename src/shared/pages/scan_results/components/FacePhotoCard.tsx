import React, { useState, useEffect } from 'react';
import { View, Text, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { UserRound } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export interface FacePhotoCardProps {
  imageUri?: string | null;
  fallbackUri?: string | null;
}

/**
 * FacePhotoCard (Section 4.6).
 * Prominent full-width rounded card displaying the captured face photo
 * analyzed by the AI pipeline, with dual-layer expo-image and RNImage fallback.
 */
export const FacePhotoCard: React.FC<FacePhotoCardProps> = ({ imageUri, fallbackUri }) => {
  const [useFallbackUri, setUseFallbackUri] = useState<boolean>(false);
  const [useRNImage, setUseRNImage] = useState<boolean>(false);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const cleanPrimary = (imageUri || '').trim().replace(/\?$/, '');
  const cleanFallback = (fallbackUri || '').trim().replace(/\?$/, '');

  const activeUri = (useFallbackUri || !cleanPrimary) ? cleanFallback : cleanPrimary;

  useEffect(() => {
    setUseFallbackUri(false);
    setUseRNImage(false);
    setImageFailed(false);
  }, [cleanPrimary, cleanFallback]);

  const handleExpoError = (err: any) => {
    console.warn('[FacePhotoCard] expo-image error on:', activeUri, err);
    if (!useFallbackUri && cleanFallback && cleanFallback !== cleanPrimary) {
      setUseFallbackUri(true);
      return;
    }
    if (!useRNImage) {
      setUseRNImage(true);
      return;
    }
    setImageFailed(true);
  };

  const handleRNError = (err: any) => {
    console.warn('[FacePhotoCard] RNImage error on:', activeUri, err);
    if (!useFallbackUri && cleanFallback && cleanFallback !== cleanPrimary) {
      setUseFallbackUri(true);
      setUseRNImage(false);
      return;
    }
    setImageFailed(true);
  };

  return (
    <View className="mx-4 mt-4 rounded-card overflow-hidden border border-border bg-card shadow-xs">
      <View className="aspect-[4/3] w-full items-center justify-center bg-background overflow-hidden relative">
        {activeUri && !imageFailed ? (
          !useRNImage ? (
            <Image
              key={`expo-${activeUri}`}
              source={{ uri: activeUri }}
              contentFit="cover"
              transition={200}
              style={{ width: '100%', height: '100%' }}
              onError={handleExpoError}
              accessibilityLabel="Analyzed face photo"
            />
          ) : (
            <RNImage
              key={`rn-${activeUri}`}
              source={{ uri: activeUri }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              onError={handleRNError}
              accessibilityLabel="Analyzed face photo"
            />
          )
        ) : (
          <View className="items-center justify-center py-10">
            <UserRound size={56} color={theme.colors.muted} />
            <Text className="mt-2 text-body-sm font-sans text-muted">
              Scan photo unavailable
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FacePhotoCard;

