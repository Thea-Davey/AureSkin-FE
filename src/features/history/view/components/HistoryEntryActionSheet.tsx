import { theme } from '@/shared/theme';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

interface HistoryEntryActionSheetProps {
  visible: boolean;
  entryId: string | null;
  deletingEntryId: string | null;
  error: string | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function HistoryEntryActionSheet({
  visible,
  entryId,
  deletingEntryId,
  error,
  onClose,
  onDelete,
}: HistoryEntryActionSheetProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isDeleting = entryId !== null && deletingEntryId === entryId;

  useEffect(() => {
    if (!visible) setConfirmingDelete(false);
  }, [visible]);

  const requestDelete = () => {
    if (!entryId) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    onDelete(entryId);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-text/40">
        <Pressable accessibilityLabel="Dismiss scan actions" className="flex-1" onPress={onClose} />
        <View className="rounded-t-card bg-card px-5 pb-8 pt-5">
          <Text className="mb-2 text-h3 font-sans-bold text-text">
            {confirmingDelete ? 'Delete this scan?' : 'Scan actions'}
          </Text>
          <Text className="mb-4 text-body-sm font-sans text-muted">
            {confirmingDelete
              ? 'This scan will be removed from your history.'
              : 'You can permanently remove this scan from your history.'}
          </Text>
          {error && <Text accessibilityRole="alert" className="mb-3 text-body-sm font-sans-medium text-error">{error}</Text>}
          <Pressable
            onPress={requestDelete}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityLabel={confirmingDelete ? 'Confirm delete scan' : 'Delete scan'}
            className="mb-3 flex-row items-center justify-center rounded-button bg-status-error px-4 py-3 active:opacity-80 disabled:opacity-60"
          >
            {isDeleting && <ActivityIndicator color={theme.colors.white} className="mr-2" />}
            <Text className="text-label font-sans-bold text-neutral-white">
              {isDeleting ? 'Deleting...' : confirmingDelete ? 'Delete scan' : 'Delete'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (confirmingDelete) setConfirmingDelete(false);
              else onClose();
            }}
            disabled={isDeleting}
            accessibilityRole="button"
            className="items-center rounded-button border border-border px-4 py-3 active:opacity-75"
          >
            <Text className="text-label font-sans-semibold text-text">{confirmingDelete ? 'Cancel' : 'Close'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}