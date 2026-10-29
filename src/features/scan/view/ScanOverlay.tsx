import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useScan } from '../viewmodel/useScan';
import { S1ScanOptions } from './containers/s1_ScanOptions';

/**
 * ScanOverlay component (Section 4.1).
 * Renders a full-screen dimmed overlay covering the entire screen (including nav bar)
 * with the "Take a Photo", "Upload a Photo", and "Exit" action buttons.
 */
export const ScanOverlay: React.FC = () => {
  const {
    visible,
    fadeAnim,
    slideAnim,
    handleTakePhoto,
    handleUploadPhoto,
    handleDismiss,
  } = useScan();

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: 40,
        },
      ]}
    >
      <S1ScanOptions
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        onTakePhoto={handleTakePhoto}
        onUploadPhoto={handleUploadPhoto}
        onDismiss={handleDismiss}
      />
    </View>
  );
};

export default ScanOverlay;
