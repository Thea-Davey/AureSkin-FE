import React from 'react';
import { StartupLoadingPage } from '../features/bootstrap/view/StartupLoadingPage';

/**
 * App Root Entry Route (`/`)
 * Displays the startup loading and resource prefetching screen to warm up
 * public catalogs and user cache before transitioning into the application.
 */
export default function Index() {
  return <StartupLoadingPage />;
}
