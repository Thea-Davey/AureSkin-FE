import React from 'react';
import { DeleteDialog } from '@/shared/components';

export interface DiscardRoutineDialogProps {
  visible: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

/**
 * DiscardRoutineDialog
 * Local confirmation dialog for Routine Page when user attempts to exit edit mode
 * or switch between Morning/Night routines with unsaved changes.
 * Built with AureSkin's standard DeleteDialog component and design tokens.
 */
export function DiscardRoutineDialog({
  visible,
  onKeepEditing,
  onDiscard,
}: DiscardRoutineDialogProps) {
  return (
    <DeleteDialog
      visible={visible}
      title="Discard Changes"
      body="Are you sure you want to discard your routine changes? Any unsaved edits will be lost."
      boldPhrase="discard your routine changes"
      cancelLabel="Keep Editing"
      confirmLabel="Discard"
      onCancel={onKeepEditing}
      onConfirm={onDiscard}
      onClose={onKeepEditing}
      testID="discard-routine-dialog"
    />
  );
}

export default DiscardRoutineDialog;

