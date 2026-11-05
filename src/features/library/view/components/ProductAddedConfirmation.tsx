import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export interface ProductAddedConfirmationProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string;
}

export function ProductAddedConfirmation({
  visible,
  onDismiss,
  title = 'Product Added Successfully!',
  message = 'The product has been saved to your library catalog.',
}: ProductAddedConfirmationProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Backdrop (pops instantly, no transition) */}
        <View className="absolute inset-0 bg-black/50">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close confirmation backdrop"
            onPress={onDismiss}
            className="flex-1"
          />
        </View>

        {/* Dialog Card (pops instantly, no transition) */}
        <View className="w-full max-w-[340px] items-center rounded-card bg-card p-6 shadow-xl">
          {/* Top Positive Green Badge */}
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-card border border-note-positive-border bg-note-positive">
            <CheckCircle2 size={30} color={theme.colors.note.positive.icon} />
          </View>

          {/* Title */}
          <Text className="text-center text-h3 font-sans-bold text-text">
            {title}
          </Text>

          {/* Subtitle / Message */}
          <Text className="mt-2 mb-6 text-center text-body-sm font-sans text-muted leading-5">
            {message}
          </Text>

          {/* CTA Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View Products"
            onPress={onDismiss}
            className="w-full items-center justify-center rounded-button bg-secondary py-3 active:opacity-80"
          >
            <Text className="text-body-sm font-sans-semibold text-neutral-white">
              View Products
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
