import React from 'react';
import { Pressable, View, Image } from 'react-native';
import { ImageIcon } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface CameraGalleryThumbnailProps {
  thumbnailUri?: string | null;
  onPress: () => void;
}

/**
 * Square rounded thumbnail at the bottom-left of the camera viewfinder (Section 4.2).
 * Shows the most recent photo preview or a placeholder, linking to Scan Upload (4.3).
 */
export const CameraGalleryThumbnail: React.FC<CameraGalleryThumbnailProps> = ({
  thumbnailUri,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open gallery photo picker"
      className="w-14 h-14 rounded-input border border-neutral-white/30 overflow-hidden bg-neutral-card/20 items-center justify-center active:opacity-80"
    >
      {thumbnailUri ? (
        <Image
          source={{ uri: thumbnailUri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-secondary/30 items-center justify-center">
          <ImageIcon size={22} color={theme.colors.card} />
        </View>
      )}
    </Pressable>
  );
};
