import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScanCamera } from '../viewmodel/useScanCamera';
import { S1CameraViewfinder } from './containers/s1_CameraViewfinder';
import { S2CameraControls } from './containers/s2_CameraControls';
import { SkinGuidanceModal } from './components/SkinGuidanceModal';

/**
 * ScanCameraPage (Section 4.2).
 * Dedicated full-screen live camera viewfinder layout shell for facial skin capture.
 */
export const ScanCameraPage: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    facing,
    cameraRef,
    isPermissionGranted,
    isPermissionPending,
    isCapturing,
    flashAnim,
    recentThumbnail,
    isGuidanceVisible,
    guidanceTips,
    toggleCameraFacing,
    requestCameraPermission,
    capturePhoto,
    openGuidanceModal,
    closeGuidanceModal,
    navigateToUpload,
    handleClose,
  } = useScanCamera();

  return (
    <View
      className="flex-1 bg-neutral-text justify-between"
      style={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <StatusBar style="light" />

      {/* Top Header & Live Camera Viewfinder */}
      <S1CameraViewfinder
        facing={facing}
        cameraRef={cameraRef}
        isPermissionGranted={isPermissionGranted}
        isPermissionPending={isPermissionPending}
        flashAnim={flashAnim}
        onRequestPermission={requestCameraPermission}
        onOpenGuidance={openGuidanceModal}
        onClose={handleClose}
      />

      {/* "Take photo" Prompt Badge & Controls Row */}
      <S2CameraControls
        recentThumbnail={recentThumbnail}
        isCapturing={isCapturing}
        onCapture={capturePhoto}
        onFlip={toggleCameraFacing}
        onNavigateToUpload={navigateToUpload}
      />

      {/* Skin Test Guidance Modal (Triggered via Help icon ?) */}
      <SkinGuidanceModal
        visible={isGuidanceVisible}
        onClose={closeGuidanceModal}
        tips={guidanceTips}
      />
    </View>
  );
};

export default ScanCameraPage;
