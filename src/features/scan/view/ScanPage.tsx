import React from 'react';
import { ScanOverlay } from './ScanOverlay';

/**
 * ScanPage layout shell component.
 * Re-exports the ScanOverlay component for modular routing.
 */
export const ScanPage: React.FC = () => {
  return <ScanOverlay />;
};

export default ScanPage;
