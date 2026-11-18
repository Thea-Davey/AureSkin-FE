import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Scan route fallback.
 * Directly redirects to the Set Up Your Skin Analysis workflow.
 */
export default function ScanScreen() {
  return <Redirect href="/scan/setup" />;
}

