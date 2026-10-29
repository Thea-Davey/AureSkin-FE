import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SkinGuidanceTip } from '../model/scan_types';
import { getSkinGuidanceTips } from '../model/scan_api';
import { MOCK_CAMERA_PHOTO_URI } from '../model/scan_mock';

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

  // Extract URI or fall back to mock photo during direct testing
  const imageUri = params.imageUri || MOCK_CAMERA_PHOTO_URI;

  // Guidance modal state & tips
  const [isGuidanceVisible, setIsGuidanceVisible] = useState<boolean>(false);
  const [guidanceTips, setGuidanceTips] = useState<SkinGuidanceTip[]>([]);

  // Image load error & submission states
  const [isImageError, setIsImageError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

