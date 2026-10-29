import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { FolderOpen } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface DevicePickerTileProps {
  onPress: () => void;
  isPicking?: boolean;
  size?: number;
}

/**
 * 1st-slot action tile in the Scan Upload grid.
 * Allows the user to trigger the system photo picker (expo-image-picker)
 * to browse files from device albums.
 */
export const DevicePickerTile: React.FC<DevicePickerTileProps> = ({
  onPress,
  isPicking = false,
  size,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={isPicking}
      accessibilityRole="button"
      accessibilityLabel="Browse photos from device gallery"
      className="aspect-square bg-secondary/15 border border-secondary/30 items-center justify-center active:bg-secondary/25"
      style={size ? { width: size, height: size } : { width: '33.333%', aspectRatio: 1 }}
    >
      {isPicking ? (
        <ActivityIndicator size="small" color={theme.colors.card} />
      ) : (
        <>
          <FolderOpen size={26} color={theme.colors.card} />
          <Text className="text-caption font-sans-semibold text-neutral-white mt-1">
            Browse Files
          </Text>
        </>
      )}
    </Pressable>
  );
};

export default DevicePickerTile;

