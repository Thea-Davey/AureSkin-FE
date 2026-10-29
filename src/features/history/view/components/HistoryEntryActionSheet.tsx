import { theme } from '@/shared/theme';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Modal, Pressable, Text, View } from 'react-native';

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
  const [isMounted, setIsMounted] = useState(visible);
  const sheetOffset = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isDeleting = entryId !== null && deletingEntryId === entryId;

  useEffect(() => {
    if (!visible) setConfirmingDelete(false);
  }, [visible]);

  useEffect(() => {
    const screenHeight = Dimensions.get('window').height;

    if (visible && !isMounted) {
      setIsMounted(true);
      return;
    }

    if (visible) {
      sheetOffset.setValue(screenHeight);
      backdropOpacity.setValue(0);
      const frame = requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(sheetOffset, {
            toValue: 0,
            useNativeDriver: true,
            damping: 24,
            stiffness: 220,
            mass: 0.8,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
        ]).start();
      });
      return () => cancelAnimationFrame(frame);
    }

    if (!isMounted) return;

    const closeAnimation = Animated.parallel([
      Animated.timing(sheetOffset, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
    closeAnimation.start(({ finished }) => {
      if (finished) setIsMounted(false);
    });
    return () => closeAnimation.stop();
  }, [backdropOpacity, isMounted, sheetOffset, visible]);

  const requestDelete = () => {
    if (!entryId) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    onDelete(entryId);
  };

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View className="absolute inset-0 bg-text/40" style={{ opacity: backdropOpacity }}>
          <Pressable accessibilityLabel="Dismiss scan actions" className="flex-1" onPress={onClose} />
        </Animated.View>
        <Animated.View
          className="rounded-t-card bg-card px-5 pb-8 pt-5"
          style={{ transform: [{ translateY: sheetOffset }] }}
        >
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
        </Animated.View>
      </View>
    </Modal>
  );
}