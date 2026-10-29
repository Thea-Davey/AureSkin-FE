import React from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { HelpCircle, X, CameraOff } from 'lucide-react-native';
import { CameraView } from 'expo-camera';
import { CameraFacing } from '../../model/scan_types';
import { theme } from '../../../../shared/theme';

export interface S1CameraViewfinderProps {
  facing: CameraFacing;
  cameraRef: React.RefObject<CameraView | null>;
  isPermissionGranted: boolean;
  isPermissionPending: boolean;
  flashAnim: Animated.Value;
  onRequestPermission: () => Promise<boolean>;
  onOpenGuidance: () => void;
  onClose: () => void;
}

/**
 * Container for the top header and camera viewfinder card (Section 4.2).
 * Houses Help (?), title "Analyze Skin", Close (X), and the live CameraView.
 */
export const S1CameraViewfinder: React.FC<S1CameraViewfinderProps> = ({
  facing,
  cameraRef,
  isPermissionGranted,
  isPermissionPending,
  flashAnim,
  onRequestPermission,
  onOpenGuidance,
  onClose,
}) => {
  return (
    <View className="w-full items-center">
      {/* 1. Top Header Bar */}
      <View className="w-full flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={onOpenGuidance}
          accessibilityRole="button"
          accessibilityLabel="Open skin test guidelines"
          className="p-2 -ml-2 rounded-full active:bg-neutral-white/10"
        >
          <HelpCircle size={26} color={theme.colors.card} />
        </Pressable>

        <Text className="text-h3 font-sans-bold text-neutral-white">
          Analyze Skin
        </Text>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          className="p-2 -mr-2 rounded-full active:bg-neutral-white/10"
        >
          <X size={26} color={theme.colors.card} />
        </Pressable>
      </View>

      {/* 2. Camera Viewfinder Card */}
      <View className="w-[92%] max-w-[360px] aspect-[4/5] rounded-card overflow-hidden bg-neutral-card/5 border border-neutral-white/15 items-center justify-center relative mt-2 shadow-2xl">
        {isPermissionPending ? (
          <View className="items-center justify-center p-6">
            <ActivityIndicator size="large" color={theme.colors.card} />
            <Text className="text-caption font-sans text-neutral-white/80 mt-3">
              Initializing camera...
            </Text>
          </View>
        ) : !isPermissionGranted ? (
          <View className="items-center justify-center p-6 text-center">
            <View className="w-14 h-14 rounded-full bg-neutral-white/10 items-center justify-center mb-3">
              <CameraOff size={28} color={theme.colors.card} />
            </View>
            <Text className="text-body-sm font-sans-bold text-neutral-white text-center mb-1">
              Camera Access Required
            </Text>
            <Text className="text-caption font-sans text-neutral-white/70 text-center mb-4 leading-4">
              AureSkin needs access to your camera to take a clear photo of your skin.
            </Text>
            <Pressable
              onPress={onRequestPermission}
              accessibilityRole="button"
              accessibilityLabel="Grant camera permission"
              className="bg-primary rounded-button px-5 py-2.5 active:bg-primary/90"
            >
              <Text className="text-caption font-sans-bold text-neutral-white">
                Grant Permission
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              facing={facing}
              style={StyleSheet.absoluteFill}
            />

            {/* Shutter Flash Animation Overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: theme.colors.card,
                  opacity: flashAnim,
                },
              ]}
            />
          </>
        )}
      </View>
    </View>
  );
};
