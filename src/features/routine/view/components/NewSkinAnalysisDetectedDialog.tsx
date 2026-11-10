import React from 'react';
import { NotifDialog } from '@/shared/components';

interface NewSkinAnalysisDetectedDialogProps {
  visible: boolean;
  onKeepCurrentRoutine: () => void;
  onGenerateNewRoutine: () => void;
}

export function NewSkinAnalysisDetectedDialog({
  visible,
  onKeepCurrentRoutine,
  onGenerateNewRoutine,
}: NewSkinAnalysisDetectedDialogProps) {
  return (
    <NotifDialog
      visible={visible}
      title="New Skin Analysis Detected"
      subtitle="Current routine might not be aligned with new analysis"
      body="Would you like to generate new routine based on your new skin profile?"
      boldPhrase="generate new routine"
      cancelLabel="Keep Current"
      confirmLabel="Generate New"
      onCancel={onKeepCurrentRoutine}
      onConfirm={onGenerateNewRoutine}
      onClose={onKeepCurrentRoutine}
    />
  );
}

