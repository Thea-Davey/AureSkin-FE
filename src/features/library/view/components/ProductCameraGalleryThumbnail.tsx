import { ActivityIndicator, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Image as ImageIcon } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface ProductCameraGalleryThumbnailProps {
  uri: string | null;
  isLoading: boolean;
  onPress: () => void;
}

export function ProductCameraGalleryThumbnail({
  uri,
  isLoading,
  onPress,
}: ProductCameraGalleryThumbnailProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Choose a photo from your gallery"
      onPress={onPress}
      className="h-16 w-16 items-center justify-center overflow-hidden rounded-input border border-neutral-white/30 bg-neutral-white/10 active:opacity-80"
    >
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel="Recent gallery photo"
        />
      ) : isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.card} />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <ImageIcon size={22} color={theme.colors.card} />
        </View>
      )}
    </Pressable>
  );
}
