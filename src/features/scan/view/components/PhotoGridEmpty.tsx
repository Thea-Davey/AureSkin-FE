import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ImageOff, FolderOpen, RotateCcw } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface PhotoGridEmptyProps {
  searchQuery: string;
  onClear: () => void;
  onBrowse: () => void;
}

/**
 * Empty state component rendered when search results yield zero photo matches.
 * Offers options to reset search filters or invoke the device file picker.
 */
export const PhotoGridEmpty: React.FC<PhotoGridEmptyProps> = ({
  searchQuery,
  onClear,
  onBrowse,
}) => {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <View className="w-16 h-16 rounded-full bg-neutral-card/10 items-center justify-center mb-3">
        <ImageOff size={32} color={theme.colors.muted} />
      </View>

      <Text className="text-body-sm font-sans-medium text-neutral-white text-center">
        No matching photos found
      </Text>

      {searchQuery ? (
        <Text className="text-caption font-sans text-neutral-muted text-center mt-1 px-4">
          No portrait photos matching &ldquo;{searchQuery}&rdquo;.
        </Text>
      ) : (
        <Text className="text-caption font-sans text-neutral-muted text-center mt-1 px-4">
          No portrait photos are currently available in the gallery.
        </Text>
      )}

      <View className="flex-row items-center space-x-3 mt-6">
        {Boolean(searchQuery) && (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Reset search query"
            className="flex-row items-center bg-neutral-card/20 rounded-button px-4 py-2 active:opacity-80 mr-3"
          >
            <RotateCcw size={16} color={theme.colors.card} />
            <Text className="text-caption font-sans-semibold text-neutral-white ml-1.5">
              Clear Search
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onBrowse}
          accessibilityRole="button"
          accessibilityLabel="Browse device photos"
          className="flex-row items-center bg-secondary rounded-button px-4 py-2 active:opacity-80"
        >
          <FolderOpen size={16} color={theme.colors.text} />
          <Text className="text-caption font-sans-semibold text-neutral-text ml-1.5">
            Browse Files
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PhotoGridEmpty;

