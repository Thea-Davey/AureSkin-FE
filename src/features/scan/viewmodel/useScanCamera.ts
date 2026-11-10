import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Platform, AppState, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useCameraPermissions, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { CameraFacing, SkinGuidanceTip } from '../model/scan_types';
import {
  getRecentGalleryThumbnail,
  getSkinGuidanceTips,
} from '../model/scan_api';
import { MOCK_CAMERA_PHOTO_URI } from '../model/scan_mock';
import { useScanStore, normalizeFileUri } from '../model/scanStore';

export interface UseScanCameraReturn {
  // Camera State
  facing: CameraFacing;
  isPermissionGranted: boolean;
  isPermissionPending: boolean;
  canAskAgain: boolean;
  isCapturing: boolean;
  isCameraReady: boolean;
  flashAnim: Animated.Value;
  cameraRef: React.RefObject<CameraView | null>;
  recentThumbnail: string | null;

  // Guidance Modal State
  isGuidanceVisible: boolean;
  guidanceTips: SkinGuidanceTip[];

  // User Actions
  onCameraReady: () => void;
  toggleCameraFacing: () => void;
  requestCameraPermission: () => Promise<boolean>;
  capturePhoto: () => Promise<void>;
  openGuidanceModal: () => void;
  closeGuidanceModal: () => void;
  navigateToUpload: () => void;
  handleClose: () => void;
}

/**
 * ViewModel hook for the Scan Camera screen (Section 4.2).
 * Orchestrates camera hardware permissions, lens direction switching (front/back),
 * photo capture execution, shutter flash animations, guidance modal state, and navigation.
 */
export function useScanCamera(): UseScanCameraReturn {
  const router = useRouter();

  // Camera permissions via expo-camera
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('front');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [recentThumbnail, setRecentThumbnail] = useState<string | null>(null);

  // Guidance modal state
  const [isGuidanceVisible, setIsGuidanceVisible] = useState<boolean>(false);
  const [guidanceTips, setGuidanceTips] = useState<SkinGuidanceTip[]>([]);

  // Flash animation & Camera View reference
  const flashAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView | null>(null);

  // AppState listener: refresh permission when user returns from device Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        getPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [getPermission]);

  // Load initial gallery thumbnail & guidance tips
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [thumbnail, tips] = await Promise.all([
          getRecentGalleryThumbnail(),
          getSkinGuidanceTips(),
        ]);
        if (isMounted) {
          setRecentThumbnail(thumbnail);
          setGuidanceTips(tips);
        }
      } catch {
        // Fallbacks silently handled
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const isPermissionPending = !permission;
  const isPermissionGranted = !!permission?.granted;
  const canAskAgain = permission?.canAskAgain ?? true;

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      // If user has permanently denied permission (canAskAgain is false), open device settings directly
      if (permission && !permission.granted && !permission.canAskAgain) {
        await Linking.openSettings();
        return false;
      }

      const result = await requestPermission();
      if (!result?.granted && !result?.canAskAgain) {
        await Linking.openSettings();
      }
      return !!result?.granted;
    } catch {
      return false;
    }
  }, [permission, requestPermission]);

  const toggleCameraFacing = useCallback(() => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  const onCameraReady = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  const openGuidanceModal = useCallback(() => {
    setIsGuidanceVisible(true);
  }, []);

  const closeGuidanceModal = useCallback(() => {
    setIsGuidanceVisible(false);
  }, []);

  const navigateToUpload = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = normalizeFileUri(result.assets[0].uri);
        useScanStore.getState().setCapturedImageUri(pickedUri);
        router.push({
          pathname: '/scan/submit' as any,
          params: { imageUri: pickedUri },
        });
      }
    } catch {
      // Fallback to upload view if system picker throws
      router.push('/scan/upload' as any);
    }
  }, [router]);

  const handleClose = useCallback(() => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/(tabs)');
    }
  }, [router]);

  const capturePhoto = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    // Trigger visual shutter flash feedback
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 0.85,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      let photoUri: string | null = null;

      if (!isMockEnabled('scan') && Platform.OS !== 'web' && cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.85,
            skipProcessing: false,
          });
          if (photo?.uri) {
            photoUri = normalizeFileUri(photo.uri);
          }
        } catch (camErr) {
          console.warn('Real camera capture error:', camErr);
        }
      }

      if (!photoUri) {
        if (isMockEnabled('scan')) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          photoUri = MOCK_CAMERA_PHOTO_URI;
        } else {
          Toast.show({
            type: 'error',
            text1: 'Capture Failed',
            text2: 'Could not capture photo. Please check camera permissions or upload from gallery.',
            position: 'bottom',
          });
          return;
        }
      }

      // Store in memory store so it never gets corrupted by URL encoding/decoding
      useScanStore.getState().setCapturedImageUri(photoUri);

      // Navigate to Scan Submit with captured photo URI
      router.push({
        pathname: '/scan/submit' as any,
        params: { imageUri: photoUri },
      });
    } catch (err) {
      console.warn('Camera capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, flashAnim, router]);

  return {
    facing,
    isPermissionGranted,
    isPermissionPending,
    canAskAgain,
    isCapturing,
    isCameraReady,
    flashAnim,
    cameraRef,
    recentThumbnail,
    isGuidanceVisible,
    guidanceTips,
    onCameraReady,
    toggleCameraFacing,
    requestCameraPermission,
    capturePhoto,
    openGuidanceModal,
    closeGuidanceModal,
    navigateToUpload,
    handleClose,
  };
}
