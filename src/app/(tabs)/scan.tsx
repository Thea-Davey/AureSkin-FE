import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Scan route fallback.
 * The scan workflow operates as a modal overlay directly on the active tab
 * without navigating away. If navigated to directly, redirects to the main tabs.
 */
export default function ScanScreen() {
  return <Redirect href="/(tabs)" />;
}
