import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  CapturedProductPhoto,
  ProductCameraFacing,
} from '../model/library_types';

interface UseAddProductCameraResult {
  facing: ProductCameraFacing;
  cameraRef: React.RefObject<CameraView | null>;
  isPermissionPending: boolean;
  isPermissionGranted: boolean;
  canAskCameraPermission: boolean;
  isCameraReady: boolean;
  isCapturing: boolean;
  isOpeningGallery: boolean;
  recentThumbnailUri: string | null;
  captureMessage: string | null;
  cameraError: string | null;
  galleryError: string | null;
  isHelpVisible: boolean;
  actions: {
    requestCameraPermission: () => Promise<void>;
    markCameraReady: () => void;
    reportCameraError: (message: string) => void;
    switchCamera: () => void;
    capturePhoto: () => Promise<void>;
    openGallery: () => Promise<void>;
    openHelp: () => void;
    closeHelp: () => void;
    closeCamera: () => void;
    continueToForm: () => void;
    openSettings: () => Promise<void>;
    clearCaptureMessage: () => void;
  };
}

export function useAddProductCamera(): UseAddProductCameraResult {
  const router = useRouter();
  const { selectedPhotoUri } = useLocalSearchParams<{ selectedPhotoUri?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<ProductCameraFacing>('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isOpeningGallery, setIsOpeningGallery] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [captureMessage, setCaptureMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const hasRequestedCameraPermission = useRef(false);

  const requestCameraPermission = useCallback(async () => {
    setCameraError(null);
    try {
      await requestPermission();
    } catch (error) {
      setCameraError(
        error instanceof Error ? error.message : 'Camera permission could not be requested.'
      );
    }
  }, [requestPermission]);

  useEffect(() => {
    if (!permission || permission.granted || hasRequestedCameraPermission.current) {
      return;
    }
    hasRequestedCameraPermission.current = true;
    void requestCameraPermission();
  }, [permission, requestCameraPermission]);

  const markCameraReady = useCallback(() => {
    setCameraError(null);
    setIsCameraReady(true);
  }, []);

  const reportCameraError = useCallback((message: string) => {
    setIsCameraReady(false);
    setCameraError(`Camera could not start: ${message}`);
  }, []);

  const switchCamera = useCallback(() => {
    if (isCapturing) {
      return;
    }
    setIsCameraReady(false);
    setFacing((current) => current === 'back' ? 'front' : 'back');
  }, [isCapturing]);

  const capturePhoto = useCallback(async () => {
    if (!isCameraReady || isCapturing || !cameraRef.current) {
      return;
    }

    setIsCapturing(true);
    setCameraError(null);
    setCaptureMessage(null);
    try {
      if (selectedPhotoUri) {
        router.setParams({ selectedPhotoUri: undefined });
      }
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        throw new Error('The camera did not return a photo.');
      }

      const captured: CapturedProductPhoto = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
      };
      setCapturedPhotoUri(captured.uri);
      setCaptureMessage('Photo captured. Continue to enter product details.');
    } catch (error) {
      setCameraError(
        error instanceof Error ? `Photo capture failed: ${error.message}` : 'Photo capture failed.'
      );
    } finally {
      setIsCapturing(false);
    }
  }, [isCameraReady, isCapturing, router, selectedPhotoUri]);

  const openGallery = useCallback(async () => {
    if (isOpeningGallery) {
      return;
    }

    setIsOpeningGallery(true);
    setGalleryError(null);
    setCaptureMessage(null);
    try {
      router.push('/library/add-product-upload');
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Could not open photo gallery.');
    } finally {
      setIsOpeningGallery(false);
    }
  }, [isOpeningGallery, router]);

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? `Could not open device settings: ${error.message}`
          : 'Could not open device settings.'
      );
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/library');
  }, [router]);

  const continueToForm = useCallback(() => {
    const imageUri = selectedPhotoUri || capturedPhotoUri;
    if (!imageUri) {
      return;
    }

    router.push({
      pathname: '/library/add-product-form',
      params: { imageUri },
    });
  }, [capturedPhotoUri, router, selectedPhotoUri]);

  return {
    facing,
    cameraRef,
    isPermissionPending: permission === null,
    isPermissionGranted: Boolean(permission?.granted),
    canAskCameraPermission: Boolean(permission?.canAskAgain),
    isCameraReady,
    isCapturing,
    isOpeningGallery,
    recentThumbnailUri: selectedPhotoUri || capturedPhotoUri,
    captureMessage: selectedPhotoUri
      ? 'Photo selected. Continue to enter product details.'
      : captureMessage,
    cameraError,
    galleryError,
    isHelpVisible,
    actions: {
      requestCameraPermission,
      markCameraReady,
      reportCameraError,
      switchCamera,
      capturePhoto,
      openGallery,
      openHelp: () => setIsHelpVisible(true),
      closeHelp: () => setIsHelpVisible(false),
      closeCamera,
      continueToForm,
      openSettings,
      clearCaptureMessage: () => setCaptureMessage(null),
    },
  };
}
