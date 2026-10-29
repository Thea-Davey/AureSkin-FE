import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { UserRound } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface FacePhotoCardProps {
  imageUri?: string | null;
}

/**
 * FacePhotoCard (Section 4.6).
 * Prominent full-width rounded card displaying the captured face photo
 * analyzed by the AI pipeline, with graceful error fallback.
 */
export const FacePhotoCard: React.FC<FacePhotoCardProps> = ({ imageUri }) => {
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  return (
    <View className="mx-4 mt-4 rounded-card overflow-hidden border border-border bg-card shadow-xs">
      <View className="aspect-[4/3] w-full items-center justify-center bg-background">
        {imageUri && !imageFailed ? (
          <Image
            source={{ uri: imageUri }}
            contentFit="cover"
            transition={200}
            onError={() => setImageFailed(true)}
            accessibilityLabel="Analyzed face photo"
            className="w-full h-full"
          />
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
