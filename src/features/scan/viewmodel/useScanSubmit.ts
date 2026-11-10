import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { SkinGuidanceTip } from '../model/scan_types';
import { getSkinGuidanceTips } from '../model/scan_api';
import { MOCK_CAMERA_PHOTO_URI } from '../model/scan_mock';
import { useScanStore, normalizeFileUri } from '../model/scanStore';

export interface UseScanSubmitReturn {
  // Image
  imageUri: string;

  // Guidance Modal State
  isGuidanceVisible: boolean;
  guidanceTips: SkinGuidanceTip[];

  // Loading & Error
  isImageError: boolean;
  isSubmitting: boolean;

  // Actions
  openGuidanceModal: () => void;
  closeGuidanceModal: () => void;
  handleRetake: () => void;
  handleSubmit: () => void;
  handleClose: () => void;
  handleImageError: () => void;
}

/**
 * ViewModel hook for the Scan Submit screen (Section 4.4).
 * Extracts imageUri from route params, manages skin test guidance modal state,
 * handles image error states, and orchestrates Retake and Submit navigation flows.
 */
export function useScanSubmit(): UseScanSubmitReturn {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const storeUri = useScanStore((state) => state.capturedImageUri);

  const rawParam = params.imageUri;
  const rawUri = Array.isArray(rawParam) ? rawParam[0] : rawParam;

  // Prefer exact in-memory store URI to prevent URL encoding/decoding corruption
  const activeUri = storeUri || (rawUri ? normalizeFileUri(rawUri) : '');
  const imageUri =
    activeUri && typeof activeUri === 'string' && activeUri.trim().length > 0
      ? activeUri.trim()
      : isMockEnabled('scan')
      ? MOCK_CAMERA_PHOTO_URI
      : '';

  // Synchronize store if route params had a URI but store didn't (e.g. direct deep link)
  useEffect(() => {
    if (imageUri && !storeUri) {
      useScanStore.getState().setCapturedImageUri(imageUri);
    }
  }, [imageUri, storeUri]);

  // Guidance modal state & tips
  const [isGuidanceVisible, setIsGuidanceVisible] = useState<boolean>(false);
  const [guidanceTips, setGuidanceTips] = useState<SkinGuidanceTip[]>([]);

  // Image load error & submission states
  const [isImageError, setIsImageError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset image error whenever imageUri updates
  useEffect(() => {
    if (imageUri) {
      setIsImageError(false);
    }
  }, [imageUri]);

  // Load guidance tips on mount
  useEffect(() => {
    let isMounted = true;

    async function loadTips() {
      try {
        const tips = await getSkinGuidanceTips();
        if (isMounted) {
          setGuidanceTips(tips);
        }
      } catch {
        // Fallback silently handled
      }
    }

    loadTips();

    return () => {
      isMounted = false;
    };
  }, []);

  const openGuidanceModal = useCallback(() => {
    setIsGuidanceVisible(true);
  }, []);

  const closeGuidanceModal = useCallback(() => {
    setIsGuidanceVisible(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsImageError(true);
  }, []);

  // Retake: pop back to Camera or Upload screen
  const handleRetake = useCallback(() => {
    useScanStore.getState().clearCapturedImage();
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/scan/camera' as any);
      }
    } catch {
      router.replace('/scan/camera' as any);
    }
  }, [router]);

  // Submit: proceed to Scan Analyzing (4.5) with imageUri param
  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      router.push({
        pathname: '/scan/analyzing' as any,
        params: { imageUri },
      });
    } catch (err) {
      console.warn('Navigation to /scan/analyzing failed:', err);
    } finally {
      setTimeout(() => setIsSubmitting(false), 500);
    }
  }, [isSubmitting, router, imageUri]);

  // Close: discard and return to Home tab
  const handleClose = useCallback(() => {
    useScanStore.getState().clearCapturedImage();
    try {
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    }
  }, [router]);

  return {
    imageUri,
    isGuidanceVisible,
    guidanceTips,
    isImageError,
    isSubmitting,
    openGuidanceModal,
    closeGuidanceModal,
    handleRetake,
    handleSubmit,
    handleClose,
    handleImageError,
  };
}

