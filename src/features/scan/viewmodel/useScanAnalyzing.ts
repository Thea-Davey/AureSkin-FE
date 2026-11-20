import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { uploadScan } from '../model/scan_api';
import { MOCK_CAMERA_PHOTO_URI } from '../model/scan_mock';
import { useScanStore, normalizeFileUri } from '../model/scanStore';
import {
  PIPELINE_STAGES,
  PipelineStageInfo,
  ScanResult,
} from '../model/scan_types';

export interface UseScanAnalyzingReturn {
  // Visual Data
  imageUri: string;
  progress: number;
  currentStage: PipelineStageInfo;

  // States
  isAnalyzing: boolean;
  isError: boolean;
  errorMessage: string;

  // Actions
  handleCancel: () => void;
  handleRetry: () => void;
  handleRetake: () => void;
  handleDismissError: () => void;
}

/**
 * ViewModel hook for the Scan Analyzing screen (Section 4.5).
 * Coordinates multi-phase progress simulation, asynchronous AI pipeline execution,
 * cancellation via AbortController, error handling, and automated results transition.
 */
export function useScanAnalyzing(): UseScanAnalyzingReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const storeUri = useScanStore((state) => state.capturedImageUri);

  const rawParam = params.imageUri;
  const rawUri = Array.isArray(rawParam) ? rawParam[0] : rawParam;

  const activeUri = storeUri || (rawUri ? normalizeFileUri(rawUri) : '');
  const imageUri =
    activeUri && typeof activeUri === 'string' && activeUri.trim().length > 0
      ? activeUri.trim()
      : isMockEnabled('scan')
      ? MOCK_CAMERA_PHOTO_URI
      : '';

  const [progress, setProgress] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<PipelineStageInfo>(PIPELINE_STAGES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  // Helper to determine stage based on progress value
  // Preprocessing (MAPPING_LANDMARKS) takes the first ~5s (0 - 28%) to allow
  // image upload and MediaPipe facial mesh mapping to finish before analysis stages begin.
  const getStageForProgress = (p: number): PipelineStageInfo => {
    if (p < 28) return PIPELINE_STAGES[0]; // MAPPING_LANDMARKS
    if (p < 68) return PIPELINE_STAGES[1]; // CLASSIFYING_CONDITIONS
    if (p < 85) return PIPELINE_STAGES[2]; // CALCULATING_SCORE
    if (p < 98) return PIPELINE_STAGES[3]; // CHECKING_COMPATIBILITY
    return PIPELINE_STAGES[4];             // COMPLETE
  };

  // Start progress ticker paced to match the real ML execution pipeline
  const startProgressTicker = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          return 94; // Hold smoothly at 94% until API completes
        }
        // Advance 1% every 180ms (~17 seconds total before hold)
        const next = Math.min(94, prev + 1);
        setCurrentStage(getStageForProgress(next));
        return next;
      });
    }, 180);
  }, []);

  // Stop progress ticker
  const stopProgressTicker = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // Execute pipeline with automatic silent retry on transient connection/model hiccups
  const executeAnalysis = useCallback(async () => {
    // Reset state
    stopProgressTicker();
    setIsAnalyzing(true);
    setIsError(false);
    setErrorMessage('');
    setProgress(0);
    setCurrentStage(PIPELINE_STAGES[0]);
    isNavigatingRef.current = false;

    // Create fresh AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    startProgressTicker();

    const MAX_RETRIES = 2; // Up to 3 attempts total (initial + 2 automatic retries for network/timeouts)
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (controller.signal.aborted) {
        return;
      }

      try {
        if (attempt > 0) {
          console.log(`[Scan] Retrying analysis silently (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
          setCurrentStage({
            key: 'CLASSIFYING_CONDITIONS',
            headline: 'ANALYZING FACIAL TARGET ZONES...',
            subtext: 'Calibrating dermatological models for high precision',
            targetProgress: 85,
          });
        }

        const result: ScanResult = await uploadScan(imageUri, controller.signal);

        // Cache the live scan result directly into global in-memory store
        useScanStore.getState().setLatestScanResult(result);

        // Invalidate queries so History, Home, Library, and Routine tabs immediately refresh with this new scan
        void queryClient.invalidateQueries({ queryKey: ['history'] });
        void queryClient.invalidateQueries({ queryKey: ['home'] });
        void queryClient.invalidateQueries({ queryKey: ['library'] });
        void queryClient.invalidateQueries({ queryKey: ['routine'] });

        // If aborted during execution, do not proceed to success
        if (controller.signal.aborted) {
          return;
        }

        stopProgressTicker();
        setProgress(100);
        setCurrentStage(PIPELINE_STAGES[4]);
        setIsAnalyzing(false);

        // Brief delay so user perceives completion before transition
        setTimeout(() => {
          if (isNavigatingRef.current) return;
          isNavigatingRef.current = true;

          try {
            router.replace({
              pathname: '/scan/results' as any,
              params: { analysisId: result.id, imageUri },
            });
          } catch {
            router.replace('/(tabs)');
          }
        }, 500);

        return; // Success, exit cleanly
      } catch (err: any) {
        if (controller.signal.aborted || err?.name === 'AbortError') {
          // Normal user cancellation - do not show error modal
          return;
        }

        lastError = err;
        const status = err?.response?.status;
        const rawMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          err?.message ||
          '';

        const isFaceOrValidationError =
          status === 400 ||
          status === 422 ||
          /no face/i.test(rawMessage) ||
          /landmark/i.test(rawMessage) ||
          /not detected/i.test(rawMessage) ||
          /validation/i.test(rawMessage);

        // If face detection failed or input was invalid, do NOT retry! Stop immediately so user can retake photo.
        if (isFaceOrValidationError) {
          console.warn('[Scan] Face detection / validation failure, aborting retries:', rawMessage);
          break;
        }

        console.warn(`[Scan] Attempt ${attempt + 1} encountered an issue:`, err?.response?.data || err?.message || err);

        // If retries remain for network/server hiccups, wait silently and retry on its own
        if (attempt < MAX_RETRIES) {
          // Hold progress smoothly around 88%
          setProgress((prev) => Math.min(prev, 88));
          setCurrentStage({
            key: 'CHECKING_COMPATIBILITY',
            headline: 'STABILIZING DERMAL ANALYSIS...',
            subtext: 'Refining feature maps and connection pipeline',
            targetProgress: 90,
          });

          // Wait 3.5 seconds before automatic retry
          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 3500);
            controller.signal.addEventListener('abort', () => {
              clearTimeout(timer);
              resolve();
            });
          });

          continue; // Loop to next attempt
        }
      }
    }

    // Only if all attempts failed or face detection failed, present the error modal to the user
    console.error('Scan analysis failed:', lastError?.response?.data || lastError?.message || lastError);
    stopProgressTicker();
    setIsAnalyzing(false);
    setIsError(true);
    setErrorMessage(
      lastError?.response?.data?.message ||
        lastError?.response?.data?.error?.message ||
        lastError?.message ||
        'No face detected in the image. Please ensure your face is clearly visible, well-lit, and facing the camera, then try retaking the photo.'
    );
  }, [imageUri, queryClient, router, startProgressTicker, stopProgressTicker]);

  // Mount effect: run analysis
  useEffect(() => {
    executeAnalysis();

    return () => {
      stopProgressTicker();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeAnalysis, stopProgressTicker]);

  // User cancels analysis
  const handleCancel = useCallback(() => {
    stopProgressTicker();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAnalyzing(false);

    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/scan/submit' as any);
      }
    } catch {
      router.replace('/scan/submit' as any);
    }
  }, [router, stopProgressTicker]);

  // Retry after error
  const handleRetry = useCallback(() => {
    executeAnalysis();
  }, [executeAnalysis]);

  // Retake photo: clear previous photo and navigate back to Camera / Setup
  const handleRetake = useCallback(() => {
    stopProgressTicker();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAnalyzing(false);
    setIsError(false);
    useScanStore.getState().clearCapturedImage();

    const shotType = useScanStore.getState().shotType;
    try {
      if (shotType === 'triple') {
        router.replace('/scan/setup' as any);
      } else {
        router.replace('/scan/camera' as any);
      }
    } catch {
      router.replace('/scan/camera' as any);
    }
  }, [router, stopProgressTicker]);

  // Dismiss error modal without retry
  const handleDismissError = useCallback(() => {
    setIsError(false);
    handleCancel();
  }, [handleCancel]);

  return {
    imageUri,
    progress,
    currentStage,
    isAnalyzing,
    isError,
    errorMessage,
    handleCancel,
    handleRetry,
    handleRetake,
    handleDismissError,
  };
}
