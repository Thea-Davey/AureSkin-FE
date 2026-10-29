import React from 'react';
import { View, Text } from 'react-native';
import { CameraShutterButton } from '../components/CameraShutterButton';
import { CameraGalleryThumbnail } from '../components/CameraGalleryThumbnail';
import { CameraFlipButton } from '../components/CameraFlipButton';

export interface S2CameraControlsProps {
  recentThumbnail?: string | null;
  isCapturing: boolean;
  onCapture: () => void;
  onFlip: () => void;
  onNavigateToUpload: () => void;
}

/**
 * Container for the prompt label and bottom camera controls (Section 4.2).
 * Houses the "Take photo" badge, Gallery thumbnail, Shutter button, and Lens flip button.
 */
export const S2CameraControls: React.FC<S2CameraControlsProps> = ({
  recentThumbnail,
  isCapturing,
  onCapture,
  onFlip,
  onNavigateToUpload,
}) => {
  return (
    <View className="w-full items-center mt-4 mb-4">
      {/* 1. "Take photo" Prompt Badge */}
      <View className="bg-neutral-white rounded-button px-5 py-1.5 shadow-sm mb-6">
        <Text className="text-caption font-sans-bold text-neutral-text">
          Take photo
        </Text>
      </View>

      {/* 2. Bottom Controls Row */}
      <View className="w-full max-w-[360px] flex-row items-center justify-between px-6">
        {/* Left: Gallery Thumbnail */}
        <CameraGalleryThumbnail
          thumbnailUri={recentThumbnail}
          onPress={onNavigateToUpload}
        />

        {/* Center: Large Shutter Button */}
        <CameraShutterButton onPress={onCapture} isCapturing={isCapturing} />

        {/* Right: Camera Lens Flip Button */}
        <CameraFlipButton onFlip={onFlip} />
      </View>
    </View>
  );
};
