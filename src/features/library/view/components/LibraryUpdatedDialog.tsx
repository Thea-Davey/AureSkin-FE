import React from 'react';
import { NotifDialog } from '@/shared/components';

export interface LibraryUpdatedDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * LibraryUpdatedDialog
 * Shared notification dialog shown when the user opens the Library page
 * after completing a new skin scan analysis, informing them that ingredient
 * and product compatibility has been updated for their new profile.
 */
export function LibraryUpdatedDialog({
  visible,
  onDismiss,
}: LibraryUpdatedDialogProps) {
  return (
    <NotifDialog
      visible={visible}
      title="Library Updated"
      subtitle="Personalized compatibility refreshed"
      body="Ingredient and product compatibility has been updated based on your latest skin analysis scan."
      boldPhrase="updated based on your latest skin analysis"
      confirmLabel="Explore Library"
      cancelLabel="Dismiss"
      onConfirm={onDismiss}
      onCancel={onDismiss}
      onClose={onDismiss}
      testID="library-updated-dialog"
    />
  );
}

export default LibraryUpdatedDialog;

