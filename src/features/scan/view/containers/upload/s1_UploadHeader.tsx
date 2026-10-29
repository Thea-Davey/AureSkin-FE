import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export interface S1UploadHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onBack: () => void;
}

/**
 * Header container for Scan Upload screen (Section 4.3).
 * Contains top navigation row with back button and screen title,
 * plus a pill-shaped search input for filtering gallery portraits.
 */
export const S1UploadHeader: React.FC<S1UploadHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onBack,
}) => {
  return (
    <View className="px-4 pt-2 pb-3 bg-neutral-text border-b border-secondary/20">
      {/* Top Navigation Bar */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to camera"
          hitSlop={12}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-white/10"
        >
          <ChevronLeft size={28} color={theme.colors.card} />
        </Pressable>

        <Text className="text-h3 font-sans-bold text-neutral-white">
          Upload a Photo
        </Text>

        {/* Symmetrical placeholder */}
        <View className="w-10 h-10" />
      </View>

      {/* Pill Search Bar */}
      <View className="w-full bg-neutral-muted/30 rounded-badge flex-row items-center px-4 py-2 mt-3 border border-neutral-white/10">
        <Search size={18} color={theme.colors.card} />

        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search..."
          placeholderTextColor="#B0B0B0"
          className="flex-1 ml-2.5 text-body-sm font-sans text-neutral-white py-0.5"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {Boolean(searchQuery) && (
          <Pressable
            onPress={onClearSearch}
            accessibilityRole="button"
            accessibilityLabel="Clear search input"
            hitSlop={8}
            className="p-1 rounded-full active:bg-neutral-white/20"
          >
            <X size={16} color={theme.colors.card} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default S1UploadHeader;

