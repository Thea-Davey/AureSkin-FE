import React from 'react';
import { WarningNote } from '@/shared/components';

export function RoutineDisclaimer() {
  return (
    <WarningNote
      style={2}
      title="Disclaimer"
      description="This routine recommends products based on your latest skin analysis results and should not replace professional dermatological advice."
    />
  );
}
