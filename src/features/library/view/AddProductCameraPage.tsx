import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from 'expo-router';
import { useAddProductCamera } from '../viewmodel/useAddProductCamera';
import { ProductCameraHelpModal } from './components/ProductCameraHelpModal';
import { S1ProductCameraViewfinder } from './containers/s1_ProductCameraViewfinder';
import { S2ProductCameraControls } from './containers/s2_ProductCameraControls';

export function AddProductCameraPage() {
  const camera = useAddProductCamera();
  const isFocused = useIsFocused();

  return (
    <View className="flex-1 justify-between bg-neutral-text">
      <StatusBar style="light" />
      <S1ProductCameraViewfinder
        facing={camera.facing}
        cameraRef={camera.cameraRef}
        isPermissionPending={camera.isPermissionPending}
        isPermissionGranted={camera.isPermissionGranted}
        canAskCameraPermission={camera.canAskCameraPermission}
        isCameraReady={camera.isCameraReady}
        isCapturing={camera.isCapturing}
        cameraError={camera.cameraError}
        isFocused={isFocused}
        onCameraReady={camera.actions.markCameraReady}
        onCameraError={camera.actions.reportCameraError}
        onRequestPermission={() => void camera.actions.requestCameraPermission()}
        onOpenSettings={() => void camera.actions.openSettings()}
        onOpenHelp={camera.actions.openHelp}
        onClose={camera.actions.closeCamera}
      />
      <S2ProductCameraControls
        recentThumbnailUri={camera.recentThumbnailUri}
        isCameraReady={camera.isCameraReady}
        isPermissionGranted={camera.isPermissionGranted}
        isCapturing={camera.isCapturing}
        isOpeningGallery={camera.isOpeningGallery}
        captureMessage={camera.captureMessage}
        galleryError={camera.galleryError}
        onContinue={camera.actions.continueToForm}
        onCapture={() => void camera.actions.capturePhoto()}
        onOpenGallery={() => void camera.actions.openGallery()}
        onSwitchCamera={camera.actions.switchCamera}
      />
      <ProductCameraHelpModal
        visible={camera.isHelpVisible}
        onClose={camera.actions.closeHelp}
      />
    </View>
  );
}
