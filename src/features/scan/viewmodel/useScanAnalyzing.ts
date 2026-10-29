import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { uploadScan } from '../model/scan_api';
import { MOCK_CAMERA_PHOTO_URI } from '../model/scan_mock';
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
  handleDismissError: () => void;
}

/**
 * ViewModel hook for the Scan Analyzing screen (Section 4.5).
 * Coordinates multi-phase progress simulation, asynchronous AI pipeline execution,
 * cancellation via AbortController, error handling, and automated results transition.
 */
export function useScanAnalyzing(): UseScanAnalyzingReturn {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const imageUri = params.imageUri || MOCK_CAMERA_PHOTO_URI;

  const [progress, setProgress] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<PipelineStageInfo>(PIPELINE_STAGES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  // Helper to determine stage based on progress value
  const getStageForProgress = (p: number): PipelineStageInfo => {
    if (p < 25) return PIPELINE_STAGES[0];
    if (p < 60) return PIPELINE_STAGES[1];
    if (p < 85) return PIPELINE_STAGES[2];
    if (p < 98) return PIPELINE_STAGES[3];
    return PIPELINE_STAGES[4];
  };

  // Start progress ticker
  const startProgressTicker = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95; // Hold at 95% until API completes
        }
        const increment = Math.max(1, Math.floor(Math.random() * 3));
        const next = Math.min(95, prev + increment);
        setCurrentStage(getStageForProgress(next));
        return next;
      });
    }, 60);
  }, []);

  // Stop progress ticker
  const stopProgressTicker = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // Execute pipeline
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

    try {
      const result: ScanResult = await uploadScan(imageUri, controller.signal);

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
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === 'AbortError') {
        // Normal user cancellation - do not show error modal
        return;
      }

      stopProgressTicker();
      setIsAnalyzing(false);
      setIsError(true);
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          'Analysis could not be completed. Please ensure your face is clearly visible and try again.'
      );
    }
  }, [imageUri, router, startProgressTicker, stopProgressTicker]);

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
    handleDismissError,
  };
}
