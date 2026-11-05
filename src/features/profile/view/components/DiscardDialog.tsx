import React from 'react';
import { DeleteDialog } from '../../../../shared/components/DeleteDialog';

export interface DiscardDialogProps {
  visible: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

/**
 * DiscardDialog
 * Local confirmation dialog for Edit Profile when user attempts to exit or cancel.
 * Built with AureSkin's standard DeleteDialog component and design tokens.
 */
export function DiscardDialog({
  visible,
  onKeepEditing,
  onDiscard,
}: DiscardDialogProps) {
  return (
    <DeleteDialog
      visible={visible}
      title="Discard Changes"
      body="Are you sure you want to discard your profile changes?"
      boldPhrase="discard your profile changes"
      cancelLabel="Keep Editing"
      confirmLabel="Discard"
      onCancel={onKeepEditing}
      onConfirm={onDiscard}
      onClose={onKeepEditing}
      testID="discard-profile-dialog"
    />
  );
}

export default DiscardDialog;

