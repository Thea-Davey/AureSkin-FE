import React, { useMemo } from 'react';
import {
  View,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { GalleryPhotoItem } from '../../model/scan_types';
import { PhotoGridTile } from '../components/PhotoGridTile';
import { DevicePickerTile } from '../components/DevicePickerTile';
import { PhotoGridEmpty } from '../components/PhotoGridEmpty';
import { theme } from '../../../../shared/theme';

export interface S2PhotoGridProps {
  photos: GalleryPhotoItem[];
  isLoading: boolean;
  isPicking: boolean;
  searchQuery: string;
  onSelectPhoto: (photoUri: string) => void;
  onPickSystemGallery: () => void;
  onClearSearch: () => void;
}

type GridItem =
  | { id: string; isPicker: true }
  | (GalleryPhotoItem & { isPicker?: false });

/**
 * 3-column portrait photo grid container for the Scan Upload screen (Section 4.3).
 * Incorporates:
 * - 1st-slot native device picker action tile
 * - 3-column scrollable grid of square portrait photos
 * - 9-tile loading skeleton / placeholder
 * - Zero-results empty state with reset and browse CTAs
 */
export const S2PhotoGrid: React.FC<S2PhotoGridProps> = ({
  photos,
  isLoading,
  isPicking,
  searchQuery,
  onSelectPhoto,
  onPickSystemGallery,
  onClearSearch,
}) => {
  const { width } = useWindowDimensions();
  const tileSize = Math.floor(width / 3);

  // Prepend device picker tile to the grid data
  const gridData = useMemo<GridItem[]>(() => {
    return [
      { id: '__device_picker__', isPicker: true },
      ...photos,
    ];
  }, [photos]);

  // Loading skeleton placeholder state
  if (isLoading) {
    return (
      <View className="flex-1 flex-row flex-wrap">
        {Array.from({ length: 9 }).map((_, index) => (
          <View
            key={`skeleton-${index}`}
            style={{ width: tileSize, height: tileSize }}
            className="border border-secondary/15 bg-neutral-card/5 items-center justify-center"
          >
            {index === 0 ? (
              <ActivityIndicator size="small" color={theme.colors.card} />
            ) : (
              <View className="w-12 h-12 rounded-card bg-neutral-card/10 opacity-40" />
            )}
          </View>
        ))}
      </View>
    );
  }

  // Zero-results empty search state
  if (photos.length === 0 && Boolean(searchQuery)) {
    return (
      <PhotoGridEmpty
        searchQuery={searchQuery}
        onClear={onClearSearch}
        onBrowse={onPickSystemGallery}
      />
    );
  }

  return (
    <FlatList
      data={gridData}
      keyExtractor={(item) => item.id}
      numColumns={3}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 32 }}
      renderItem={({ item }) => {
        if (item.isPicker) {
          return (
            <DevicePickerTile
              size={tileSize}
              isPicking={isPicking}
              onPress={onPickSystemGallery}
            />
          );
        }

        return (
          <PhotoGridTile
            size={tileSize}
            photo={item as GalleryPhotoItem}
            onSelect={onSelectPhoto}
          />
        );
      }}
    />
  );
};

export default S2PhotoGrid;

