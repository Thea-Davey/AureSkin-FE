import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Animated, Platform, AppState, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCameraPermissions, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { CameraFacing, SkinGuidanceTip } from '../model/scan_types';
import {
  getRecentGalleryThumbnail,
  getSkinGuidanceTips,
} from '../model/scan_api';
import { MOCK_CAMERA_PHOTO_URI, MOCK_SETUP_PHOTOS } from '../model/scan_mock';
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
  promptText: string;

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
  const params = useLocalSearchParams<{
    returnTo?: string;
    targetSide?: 'left' | 'front' | 'right';
    mode?: 'single' | 'consecutive';
  }>();

  // Camera permissions via expo-camera
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('front');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [recentThumbnail, setRecentThumbnail] = useState<string | null>(null);

  // Consecutive capture flow tracking (Triple Shot: front -> left -> right)
  const isConsecutive = params.returnTo === 'setup' && params.mode === 'consecutive';
  const [consecutiveStep, setConsecutiveStep] = useState<'front' | 'left' | 'right'>(
    (params.targetSide as 'front' | 'left' | 'right') || 'front'
  );

  // Dynamic viewfinder prompt based on target side & consecutive step
  const promptText = useMemo(() => {
    if (isConsecutive) {
      if (consecutiveStep === 'front') return 'Take frontal photo (1 of 3)';
      if (consecutiveStep === 'left') return 'Take left profile photo (2 of 3)';
      if (consecutiveStep === 'right') return 'Take right profile photo (3 of 3)';
    }
    if (params.targetSide === 'left') return 'Take left profile photo';
    if (params.targetSide === 'right') return 'Take right profile photo';
    if (params.targetSide === 'front') return 'Take frontal photo';
    return 'Take photo';
  }, [isConsecutive, consecutiveStep, params.targetSide]);

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

        if (params.returnTo === 'setup') {
          const side = isConsecutive
            ? consecutiveStep
            : params.targetSide || (useScanStore.getState().shotType === 'triple' ? 'left' : 'front');
          useScanStore.getState().setPhoto(side, pickedUri);

          if (isConsecutive) {
            if (side === 'front') {
              setConsecutiveStep('left');
              return;
            } else if (side === 'left') {
              setConsecutiveStep('right');
              return;
            } else {
              router.push('/scan/setup' as any);
              return;
            }
          }

          router.push('/scan/setup' as any);
          return;
        }

        router.push({
          pathname: '/scan/submit' as any,
          params: { imageUri: pickedUri },
        });
      }
    } catch {
      // Fallback to upload view if system picker throws
      router.push('/scan/upload' as any);
    }
  }, [isConsecutive, consecutiveStep, params.returnTo, params.targetSide, router]);

  const handleClose = useCallback(() => {
    try {
      if (params.returnTo === 'setup') {
        router.push('/scan/setup' as any);
        return;
      }
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/(tabs)');
    }
  }, [params.returnTo, router]);

  const capturePhoto = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    // Active photo side being captured
    const activeSide: 'front' | 'left' | 'right' = isConsecutive
      ? consecutiveStep
      : (params.targetSide as 'front' | 'left' | 'right') || 'front';

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
          if (activeSide === 'left') {
            photoUri = MOCK_SETUP_PHOTOS.left || MOCK_CAMERA_PHOTO_URI;
          } else if (activeSide === 'right') {
            photoUri = MOCK_SETUP_PHOTOS.right || MOCK_CAMERA_PHOTO_URI;
          } else {
            photoUri = MOCK_SETUP_PHOTOS.front || MOCK_CAMERA_PHOTO_URI;
          }
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

      // Return or advance in setup mode
      if (params.returnTo === 'setup') {
        useScanStore.getState().setPhoto(activeSide, photoUri);

        if (isConsecutive) {
          if (activeSide === 'front') {
            Toast.show({
              type: 'info',
              text1: 'Frontal photo captured (1 of 3)',
              text2: 'Now position your left profile photo (2 of 3)',
              position: 'top',
              visibilityTime: 2000,
            });
            setConsecutiveStep('left');
            return;
          } else if (activeSide === 'left') {
            Toast.show({
              type: 'info',
              text1: 'Left profile captured (2 of 3)',
              text2: 'Now position your right profile photo (3 of 3)',
              position: 'top',
              visibilityTime: 2000,
            });
            setConsecutiveStep('right');
            return;
          } else {
            // Completed all 3 photos (front -> left -> right)!
            Toast.show({
              type: 'success',
              text1: 'All 3 photos captured!',
              position: 'top',
              visibilityTime: 1500,
            });
            router.push('/scan/setup' as any);
            return;
          }
        }

        // Single shot or individual profile retake -> return directly to setup
        router.push('/scan/setup' as any);
        return;
      }

      // Default: Navigate to Scan Submit with captured photo URI
      router.push({
        pathname: '/scan/submit' as any,
        params: { imageUri: photoUri },
      });
    } catch (err) {
      console.warn('Camera capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [
    isCapturing,
    isConsecutive,
    consecutiveStep,
    params.returnTo,
    params.targetSide,
    flashAnim,
    router,
  ]);

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
    promptText,
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
