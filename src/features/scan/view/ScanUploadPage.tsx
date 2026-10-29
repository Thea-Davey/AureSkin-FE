import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScanUpload } from '../viewmodel/useScanUpload';
import { S1UploadHeader } from './containers/upload/s1_UploadHeader';
import { S2PhotoGrid } from './containers/upload/s2_PhotoGrid';

/**
 * ScanUploadPage (Section 4.3).
 * Full-screen photo gallery picker interface allowing users to select an existing
 * facial photograph for AI skin analysis or browse files via system photo picker.
 */
export const ScanUploadPage: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    filteredPhotos,
    searchQuery,
    isLoading,
    isPicking,
    setSearchQuery,
    clearSearch,
    selectPhoto,
    pickFromSystemGallery,
    handleBack,
  } = useScanUpload();

  return (
    <View
      className="flex-1 bg-neutral-text"
      style={{
        paddingTop: Math.max(insets.top, 16),
      }}
    >
      <StatusBar style="light" />

      {/* Top Header with Back Button and Pill Search Bar */}
      <S1UploadHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={clearSearch}
        onBack={handleBack}
      />

      {/* 3-Column Scrollable Photo Grid with Device Picker Tile */}
      <S2PhotoGrid
        photos={filteredPhotos}
        isLoading={isLoading}
        isPicking={isPicking}
        searchQuery={searchQuery}
        onSelectPhoto={selectPhoto}
        onPickSystemGallery={pickFromSystemGallery}
        onClearSearch={clearSearch}
      />
    </View>
  );
};

export default ScanUploadPage;

