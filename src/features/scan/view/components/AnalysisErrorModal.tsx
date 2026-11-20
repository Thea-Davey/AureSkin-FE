import React from 'react';
import { View, Text, Modal } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { Button } from '../../../../shared/components/Button';

interface AnalysisErrorModalProps {
  visible: boolean;
  message?: string;
  onRetry: () => void;
  onCancel: () => void;
  onRetake?: () => void;
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
  onRetake,
}) => {
  const isNoFace = /no face/i.test(message || '') || /landmark/i.test(message || '');

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
            {isNoFace ? 'No Face Detected' : 'Analysis Interrupted'}
          </Text>

          {/* Error Description Message */}
          <Text className="text-body-sm font-sans text-muted text-center mt-2">
            {message ||
              (isNoFace
                ? 'No face detected in the image. Please ensure your face is clearly visible, well-lit, and facing the camera, then try retaking the photo.'
                : 'Analysis could not be completed. Please check your connection and try again.')}
          </Text>

          {/* Action Triggers */}
          <View className="flex-row items-center justify-between w-full mt-6">
            <Button
              onPress={onCancel}
              variant="outline"
              size="md"
              title="Cancel"
              accessibilityLabel="Cancel analysis and return"
              className="flex-1 mr-2"
              textClassName="text-muted font-sans-semibold text-body-sm"
            />

            {isNoFace ? (
              <Button
                onPress={onRetake || onCancel}
                variant="primary"
                size="md"
                title="Retake Photo"
                accessibilityLabel="Retake facial photo"
                className="flex-1 ml-2"
                textClassName="text-neutral-white font-sans-bold text-body-sm"
              />
            ) : (
              <Button
                onPress={onRetry}
                variant="primary"
                size="md"
                title="Retry"
                accessibilityLabel="Retry skin analysis"
                className="flex-1 ml-2"
                textClassName="text-neutral-white font-sans-bold text-body-sm"
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
