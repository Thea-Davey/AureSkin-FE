import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { theme } from '../theme';

export interface DeleteDialogProps {
  visible: boolean;
  title: string;
  body: string | React.ReactNode;
  /** Optional phrase within the body to render in bold font */
  boldPhrase?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
  testID?: string;
}

export function DeleteDialog({
  visible,
  title,
  body,
  boldPhrase,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  testID,
}: DeleteDialogProps) {
  const handleClose = onClose ?? onCancel;

  const renderBody = () => {
    if (typeof body !== 'string') {
      return body;
    }

    if (boldPhrase && body.includes(boldPhrase)) {
      const parts = body.split(boldPhrase);
      return (
        <Text className="text-body-sm font-sans text-text leading-5">
          {parts[0]}
          <Text className="font-sans-bold text-text">{boldPhrase}</Text>
          {parts.slice(1).join(boldPhrase)}
        </Text>
      );
    }

    return (
      <Text className="text-body-sm font-sans text-text leading-5">
        {body}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      testID={testID}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Backdrop (pops instantly, no transition) */}
        <View className="absolute inset-0 bg-black/50">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close dialog backdrop"
            onPress={handleClose}
            className="flex-1"
          />
        </View>

        {/* Dialog Card (pops instantly, no transition) */}
        <View className="relative w-full max-w-[340px] rounded-card bg-card p-6 shadow-xl">
          {/* Top-Right Close Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
            onPress={handleClose}
            hitSlop={10}
            className="absolute right-4 top-4 z-10 p-1 active:opacity-70"
          >
            <X size={18} color={theme.colors.text} />
          </Pressable>

          {/* Header Row: Alert Icon Container & Title */}
          <View className="flex-row items-center pr-6">
            <View className="h-12 w-12 items-center justify-center rounded-card border border-note-negative-border bg-note-negative">
              <AlertTriangle size={24} color={theme.colors.note.negative.icon} />
            </View>
            <Text
              numberOfLines={2}
              className="ml-3 flex-1 text-h3 font-sans-bold text-text"
            >
              {title}
            </Text>
          </View>

          {/* Body Content */}
          <View className="mt-4 mb-6">
            {renderBody()}
          </View>

          {/* Actions: Dual Buttons */}
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={onCancel}
              className="flex-1 items-center justify-center rounded-button border border-border bg-card py-3 active:opacity-70"
            >
              <Text className="text-body-sm font-sans-semibold text-text">
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              className="flex-1 items-center justify-center rounded-button bg-status-error py-3 active:opacity-80"
            >
              <Text className="text-body-sm font-sans-semibold text-neutral-white">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
