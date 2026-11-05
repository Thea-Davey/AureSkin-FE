import React from 'react';
import { DeleteDialog } from '../../../../shared/components';

export interface DiscardProductDialogProps {
  visible: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function DiscardProductDialog({
  visible,
  onKeepEditing,
  onDiscard,
}: DiscardProductDialogProps) {
  return (
    <DeleteDialog
      visible={visible}
      title="Discard Product Details"
      body="Are you sure you want to cancel adding this product?"
      boldPhrase="cancel adding this product"
      cancelLabel="Keep Product"
      confirmLabel="Discard Product"
      onCancel={onKeepEditing}
      onConfirm={onDiscard}
      onClose={onKeepEditing}
      testID="discard-product-dialog"
    />
  );
}
