import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ArrowDownUp, Image as ImageIcon } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { ProductCameraGalleryThumbnail } from '../components/ProductCameraGalleryThumbnail';

interface S2ProductCameraControlsProps {
  recentThumbnailUri: string | null;
  isCameraReady: boolean;
  isPermissionGranted: boolean;
  isCapturing: boolean;
  isOpeningGallery: boolean;
  captureMessage: string | null;
  galleryError: string | null;
  onContinue: () => void;
  onCapture: () => void;
  onOpenGallery: () => void;
  onSwitchCamera: () => void;
}

export function S2ProductCameraControls({
  recentThumbnailUri,
  isCameraReady,
  isPermissionGranted,
  isCapturing,
  isOpeningGallery,
  captureMessage,
  galleryError,
  onContinue,
  onCapture,
  onOpenGallery,
  onSwitchCamera,
}: S2ProductCameraControlsProps) {
  const isCameraActionDisabled = !isPermissionGranted || !isCameraReady || isCapturing;

  return (
    <View className="w-full items-center px-5 pb-5 pt-4">
      <View className="mb-6 bg-neutral-white px-5 py-1.5">
        <Text className="text-caption font-sans-semibold text-neutral-text">
          Take photo
        </Text>
      </View>

      {recentThumbnailUri ? (
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          className="mt-4 rounded-button bg-primary px-6 py-3 active:opacity-80"
        >
          <Text className="text-label font-sans-semibold text-neutral-white">
            Continue to product details
          </Text>
        </Pressable>
      ) : null}

      <View className="w-full max-w-[420px] flex-row items-center justify-between">
        <ProductCameraGalleryThumbnail
          uri={recentThumbnailUri}
          isLoading={isOpeningGallery}
          onPress={onOpenGallery}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capture product photo"
          accessibilityState={{ disabled: isCameraActionDisabled }}
          disabled={isCameraActionDisabled}
          onPress={onCapture}
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-white/40 active:scale-95"
          style={{ opacity: isCameraActionDisabled ? 0.5 : 1 }}
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-neutral-white">
            {isCapturing ? <ActivityIndicator color={theme.colors.text} /> : null}
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch camera"
          accessibilityState={{ disabled: !isPermissionGranted || isCapturing }}
          disabled={!isPermissionGranted || isCapturing}
          onPress={onSwitchCamera}
          className="h-14 w-14 items-center justify-center rounded-full active:bg-neutral-white/10 disabled:opacity-40"
        >
          <ArrowDownUp size={28} color={theme.colors.card} />
        </Pressable>
      </View>

      {captureMessage ? (
        <Text accessibilityRole="alert" className="mt-4 text-center text-body-sm font-sans text-neutral-white">
          {captureMessage}
        </Text>
      ) : null}
      {galleryError ? (
        <Text accessibilityRole="alert" className="mt-3 text-center text-body-sm font-sans text-neutral-white/80">
          {galleryError}
        </Text>
      ) : null}
      {isOpeningGallery ? (
        <View className="mt-3 flex-row items-center gap-2">
          <ImageIcon size={16} color={theme.colors.card} />
          <Text className="text-caption font-sans text-neutral-white">Opening photos...</Text>
        </View>
      ) : null}
    </View>
  );
}
