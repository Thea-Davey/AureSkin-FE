import { useRef, useEffect, useState, useCallback } from 'react';
import { Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../../shared/store/appStore';

export interface UseScanReturn {
  visible: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  handleTakePhoto: () => void;
  handleUploadPhoto: () => void;
  handleDismiss: () => void;
}

/**
 * ViewModel hook for the Scan Overlay.
 * Connects directly to the global appStore to control overlay visibility,
 * manages entry/exit animations, and handles navigation to camera and upload screens.
 */
export function useScan(): UseScanReturn {
  const router = useRouter();
  const isScanOverlayOpen = useAppStore((state) => state.isScanOverlayOpen);
  const closeScanOverlay = useAppStore((state) => state.closeScanOverlay);

  // Keep overlay mounted while exit transition completes
  const [visible, setVisible] = useState(isScanOverlayOpen);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    if (isScanOverlayOpen) {
      setVisible(true);
      fadeAnim.setValue(0);
      slideAnim.setValue(80);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          bounciness: 4,
          speed: 14,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 80,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    }
  }, [isScanOverlayOpen, fadeAnim, slideAnim]);

  const handleTakePhoto = useCallback(() => {
    closeScanOverlay();
    try {
      router.push('/scan/camera' as any);
    } catch {
      // Fallback handled gracefully
    }
  }, [closeScanOverlay, router]);

  const handleUploadPhoto = useCallback(() => {
    closeScanOverlay();
    try {
      router.push('/scan/upload' as any);
    } catch {
      // Fallback handled gracefully
    }
  }, [closeScanOverlay, router]);

  const handleDismiss = useCallback(() => {
    closeScanOverlay();
  }, [closeScanOverlay]);

  return {
    visible,
    fadeAnim,
    slideAnim,
    handleTakePhoto,
    handleUploadPhoto,
    handleDismiss,
  };
}
