import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/store/authStore';
import { BOOTSTRAP_STEPS } from '../model/bootstrap_types';
import { prefetchAppResources } from '../model/bootstrap_api';

const COLD_BOOT_MINIMUM_DISPLAY_MS = 1200;
const FAST_PATH_MINIMUM_DISPLAY_MS = 350;
const FAIL_SAFE_TIMEOUT_MS = 4500;

export function useStartupBootstrap() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number>(10);
  const [currentLabel, setCurrentLabel] = useState<string>(BOOTSTRAP_STEPS[0].label);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const isNavigatingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  const handleStepProgress = useCallback((stepId: string) => {
    const step = BOOTSTRAP_STEPS.find((s) => s.id === stepId);
    if (step) {
      setCurrentLabel(step.label);
      setProgress((prev) => Math.max(prev, step.weight));
    }
  }, []);

  const navigateToDestination = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    const isAuth = useAuthStore.getState().isAuthenticated;
    if (isAuth) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function runBootstrap() {
      startTimeRef.current = Date.now();
      let isFast = false;

      // Start prefetching / disk hydration
      try {
        const result = await prefetchAppResources(queryClient, (stepId) => {
          if (isMounted) handleStepProgress(stepId);
        });
        isFast = result.isFastPath;
      } catch (err) {
        console.warn('[Bootstrap] Preload error:', err);
      }

      if (!isMounted) return;

      const minDisplay = isFast ? FAST_PATH_MINIMUM_DISPLAY_MS : COLD_BOOT_MINIMUM_DISPLAY_MS;
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplay - elapsed);

      setTimeout(() => {
        if (!isMounted) return;
        setProgress(100);
        setCurrentLabel('Ready!');
        setIsCompleted(true);

        // Brief delay at 100% before transition
        setTimeout(() => {
          if (isMounted) navigateToDestination();
        }, isFast ? 100 : 250);
      }, remaining);
    }

    runBootstrap();

    // Fail-safe maximum timeout (guarantees app never hangs)
    const failSafeTimer = setTimeout(() => {
      if (isMounted && !isNavigatingRef.current) {
        setProgress(100);
        navigateToDestination();
      }
    }, FAIL_SAFE_TIMEOUT_MS);

    return () => {
      isMounted = false;
      clearTimeout(failSafeTimer);
    };
  }, [queryClient, handleStepProgress, navigateToDestination]);

  return {
    progress,
    currentLabel,
    isCompleted,
  };
}

