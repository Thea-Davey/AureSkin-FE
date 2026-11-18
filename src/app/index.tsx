import React, { useState } from 'react';
import { StartupSplashScreen } from '../features/bootstrap/view/StartupSplashScreen';
import { StartupLoadingPage } from '../features/bootstrap/view/StartupLoadingPage';

/**
 * App Root Entry Route (`/`)
 * Stage 1: Startup Splash Screen (White background, colored AureSkin logo, two-tone "AureSkin" title)
 * Stage 2: Startup Loading Screen (Olive background, global logo pattern, pulsing logo-white, progress bar)
 */
export default function Index() {
  const [stage, setStage] = useState<'splash' | 'loading'>('splash');

  if (stage === 'splash') {
    return <StartupSplashScreen onFinish={() => setStage('loading')} />;
  }

  return <StartupLoadingPage />;
}
