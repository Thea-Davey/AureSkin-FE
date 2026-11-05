import React from 'react';
import { DeleteDialog } from '@/shared/components';

interface DeleteRoutineDialogProps {
  visible: boolean;
  onKeepRoutine: () => void;
  onConfirmDelete: () => void;
}

export function DeleteRoutineDialog({
  visible,
  onKeepRoutine,
  onConfirmDelete,
}: DeleteRoutineDialogProps) {
  return (
    <DeleteDialog
      visible={visible}
      title="Replace Current Routine"
      body="This will delete your current Morning and Night routine to generate a new personalized routine."
      boldPhrase="delete your current Morning and Night routine"
      cancelLabel="Keep Routine"
      confirmLabel="Delete Routine"
      onCancel={onKeepRoutine}
      onConfirm={onConfirmDelete}
      onClose={onKeepRoutine}
    />
  );
}

