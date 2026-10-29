import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface AnalysisErrorModalProps {
  visible: boolean;
  message?: string;
  onRetry: () => void;
  onCancel: () => void;
}

/**
 * AnalysisErrorModal (Section 4.5).
 * Error dialog presented if the AI analysis request fails, times out,
 * or face landmarks cannot be extracted.
 */
export const AnalysisErrorModal: React.FC<AnalysisErrorModalProps> = ({
  visible,
  message,
  onRetry,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-neutral-text/80 items-center justify-center px-6">
        <View className="w-full max-w-sm bg-card rounded-card p-6 border border-border items-center shadow-xl">
          {/* Error Alert Icon */}
          <AlertCircle
            size={40}
            color={theme.colors.error}
            aria-hidden={true}
          />

          {/* Heading */}
          <Text className="text-h3 font-sans-bold text-text text-center mt-3">
            Analysis Failed
          </Text>

          {/* Error Description Message */}
          <Text className="text-body-sm font-sans text-muted text-center mt-2">
            {message ||
              'Analysis could not be completed. Please ensure your face is clearly visible and try again.'}
          </Text>

          {/* Action Triggers */}
          <View className="flex-row items-center justify-between w-full mt-6">
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel analysis and return"
              className="flex-1 py-3 rounded-button border border-border items-center mr-2 active:opacity-70"
            >
              <Text className="text-muted font-sans-semibold text-body-sm">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry skin analysis"
              className="flex-1 py-3 rounded-button bg-primary items-center ml-2 active:opacity-90"
            >
              <Text className="text-neutral-white font-sans-bold text-body-sm">
                Retry
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
