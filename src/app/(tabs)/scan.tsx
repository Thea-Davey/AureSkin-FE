import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '@/shared/store/appStore';

/**
 * Scan route fallback.
 * The scan workflow operates as a modal overlay directly on the active tab
 * without navigating away. When triggered or visited directly, it opens the
 * scan options overlay ("take a photo" and "upload a photo") and returns to tabs.
 */
export default function ScanScreen() {
  useEffect(() => {
    useAppStore.getState().openScanOverlay();
  }, []);

  return <Redirect href="/(tabs)" />;
}
