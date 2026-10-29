import React from 'react';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { GalleryPhotoItem } from '../../model/scan_types';

export interface PhotoGridTileProps {
  photo: GalleryPhotoItem;
  onSelect: (photoUri: string) => void;
  size?: number;
}

/**
 * Square photo tile rendered inside the 3-column portrait gallery grid.
 * Provides tactile press feedback and invokes onSelect callback.
 */
export const PhotoGridTile: React.FC<PhotoGridTileProps> = ({
  photo,
  onSelect,
  size,
}) => {
  return (
    <Pressable
      onPress={() => onSelect(photo.uri)}
      accessibilityRole="button"
      accessibilityLabel={photo.filename || `Portrait photo ${photo.id}`}
      className="aspect-square border border-secondary/20 bg-neutral-card/10 overflow-hidden active:opacity-75 items-center justify-center"
      style={size ? { width: size, height: size } : { width: '33.333%', aspectRatio: 1 }}
    >
      <Image
        source={{ uri: photo.uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={150}
      />
    </Pressable>
  );
};

export default PhotoGridTile;

