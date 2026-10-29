import { RefObject } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraOff, HelpCircle, X } from 'lucide-react-native';
import { CameraView } from 'expo-camera';
import { theme } from '../../../../shared/theme';
import { ProductCameraFacing } from '../../model/library_types';

interface S1ProductCameraViewfinderProps {
  facing: ProductCameraFacing;
  cameraRef: RefObject<CameraView | null>;
  isPermissionPending: boolean;
  isPermissionGranted: boolean;
  canAskCameraPermission: boolean;
  isCameraReady: boolean;
  isCapturing: boolean;
  cameraError: string | null;
  isFocused: boolean;
  onCameraReady: () => void;
  onCameraError: (message: string) => void;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onClose: () => void;
}

export function S1ProductCameraViewfinder({
  facing,
  cameraRef,
  isPermissionPending,
  isPermissionGranted,
  canAskCameraPermission,
  isCameraReady,
  isCapturing,
  cameraError,
  isFocused,
  onCameraReady,
  onCameraError,
  onRequestPermission,
  onOpenSettings,
  onOpenHelp,
  onClose,
}: S1ProductCameraViewfinderProps) {
  return (
    <View className="flex-1 items-center">
      <View className="w-full flex-row items-center justify-between px-5 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open product photo tips"
          onPress={onOpenHelp}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-white/10"
        >
          <HelpCircle size={23} color={theme.colors.card} />
        </Pressable>
        <Text className="text-h3 font-sans-bold text-neutral-white">
          Ingredient Extractor
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close product camera"
          onPress={onClose}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-white/10"
        >
          <X size={25} color={theme.colors.card} />
        </Pressable>
      </View>

      <View className="my-auto w-[92%] max-w-[420px] aspect-[4/5] overflow-hidden rounded-card bg-neutral-white/10">
        {isPermissionPending ? (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="large" color={theme.colors.card} />
            <Text className="text-body-sm font-sans text-neutral-white">
              Checking camera access...
            </Text>
          </View>
        ) : !isPermissionGranted ? (
          <View className="flex-1 items-center justify-center px-6">
            <CameraOff size={32} color={theme.colors.card} />
            <Text className="mt-4 text-center text-h3 font-sans-semibold text-neutral-white">
              Camera access needed
            </Text>
            <Text className="mt-2 text-center text-body-sm font-sans text-neutral-white/80">
              Allow camera access to photograph a product or ingredient label.
            </Text>
            {canAskCameraPermission ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRequestPermission}
                className="mt-5 rounded-button bg-primary px-5 py-3 active:opacity-80"
              >
                <Text className="text-label font-sans-semibold text-neutral-white">
                  Allow camera
                </Text>
              </Pressable>
            ) : !isFocused ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={theme.colors.card} />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={onOpenSettings}
                className="mt-5 rounded-button bg-primary px-5 py-3 active:opacity-80"
              >
                <Text className="text-label font-sans-semibold text-neutral-white">
                  Open Settings
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              facing={facing}
              onCameraReady={onCameraReady}
              onMountError={(event) => {
                onCameraError(event.message);
              }}
              style={StyleSheet.absoluteFill}
            />
            {!isCameraReady || isCapturing ? (
              <View className="absolute inset-0 items-center justify-center bg-neutral-text/50">
                <ActivityIndicator size="large" color={theme.colors.card} />
              </View>
            ) : null}
          </>
        )}
      </View>

      {cameraError ? (
        <View accessibilityRole="alert" className="mx-5 mt-3 rounded-button bg-status-error/20 p-3">
          <Text className="text-center text-body-sm font-sans-medium text-neutral-white">
            {cameraError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
