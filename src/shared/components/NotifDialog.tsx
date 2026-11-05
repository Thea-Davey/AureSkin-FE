import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { theme } from '../theme';

export interface NotifDialogProps {
  visible: boolean;
  title: string;
  subtitle?: string;
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

export function NotifDialog({
  visible,
  title,
  subtitle,
  body,
  boldPhrase,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  testID,
}: NotifDialogProps) {
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
        {/* Backdrop */}
        <View className="absolute inset-0 bg-black/50">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close notification dialog backdrop"
            onPress={handleClose}
            className="flex-1"
          />
        </View>

        {/* Dialog Card */}
        <View className="relative w-full max-w-[340px] overflow-hidden rounded-card bg-card shadow-2xl">
          {/* Top Banner (Deep Olive Green / Primary) */}
          <View className="relative items-center bg-primary px-6 pb-6 pt-7">
            {/* Top-Right Close Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close notification dialog"
              onPress={handleClose}
              hitSlop={10}
              className="absolute right-4 top-4 z-10 p-1 active:opacity-70"
            >
              <X size={18} color={theme.colors.white} />
            </Pressable>

            {/* Alert / Exclamation Icon in White Ring */}
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full border-2 border-white">
              <AlertCircle size={32} color={theme.colors.white} strokeWidth={2.2} />
            </View>

            {/* Title */}
            <Text className="text-center text-h2 font-sans-bold text-neutral-white">
              {title}
            </Text>

            {/* Subtitle */}
            {subtitle ? (
              <Text className="mt-1 text-center text-body-sm font-sans text-neutral-white/90">
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Bottom Card Content */}
          <View className="bg-card p-6">
            {/* Body */}
            <View className="mb-6">
              {renderBody()}
            </View>

            {/* Dual Action Buttons */}
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
                className="flex-1 items-center justify-center rounded-button bg-primary py-3 active:opacity-80"
              >
                <Text className="text-body-sm font-sans-semibold text-neutral-white">
                  {confirmLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

