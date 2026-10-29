import React from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Upload } from 'lucide-react-native';
import { ScanActionButton } from '../../components/ScanActionButton';
import { ScanExitButton } from '../../components/ScanExitButton';

export interface S1ScanOptionsProps {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onTakePhoto: () => void;
  onUploadPhoto: () => void;
  onDismiss: () => void;
}

/**
 * Container for Section 4.1 Scan Overlay options.
 * Renders a full-screen semi-transparent dimmed backdrop covering the entire screen
 * (including active screen, header, and bottom navigation bar).
 * Floating directly on top of the dim (and therefore completely un-dimmed):
 * - The Exit button positioned at the exact location of the bottom nav scan button
 * - The 2 photo action buttons ("Take a Photo", "Upload a Photo") floating above it.
 */
export const S1ScanOptions: React.FC<S1ScanOptionsProps> = ({
  fadeAnim,
  slideAnim,
  onTakePhoto,
  onUploadPhoto,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  // Align Exit button bottom edge with the center tab button elevation (matching green Scan button position)
  const exitButtonBottom = insets.bottom + 18;
  // Position action buttons 16px above the 80px Exit button
  const actionButtonsBottom = exitButtonBottom + 80 + 16;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 1. Full-screen Dimmed Backdrop (Tap to dismiss) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Dismiss scan overlay"
          onPress={onDismiss}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* 2. Animated Action Buttons Floating Above the Exit Button */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: actionButtonsBottom,
          transform: [{ translateY: slideAnim }],
        }}
        className="w-full max-w-md self-center px-6 items-center"
        pointerEvents="box-none"
      >
        <View className="w-full gap-y-3.5">
          <ScanActionButton
            label="Take a Photo"
            Icon={Camera}
            onPress={onTakePhoto}
            accessibilityLabel="Take a photo with camera"
          />

          <ScanActionButton
            label="Upload a Photo"
            Icon={Upload}
            onPress={onUploadPhoto}
            accessibilityLabel="Upload a photo from gallery"
          />
        </View>
      </Animated.View>

      {/* 3. Transformed Exit Button sitting at the exact center tab button position */}
      <View
        style={{
          position: 'absolute',
          bottom: exitButtonBottom,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
        pointerEvents="box-none"
      >
        <ScanExitButton onPress={onDismiss} />
      </View>
    </View>
  );
};


