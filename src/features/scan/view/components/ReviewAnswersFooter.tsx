import React from 'react';
import { View } from 'react-native';
import { Save } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Button } from '@/shared/components/Button';

export interface ReviewAnswersFooterProps {
  onDiscard: () => void;
  onSave: () => void;
}

/**
 * ReviewAnswersFooter Component (Section 4.0 / Review Answers)
 * Fixed bottom bar with Discard Changes and Save buttons matching Image 5.
 */
export const ReviewAnswersFooter: React.FC<ReviewAnswersFooterProps> = ({
  onDiscard,
  onSave,
}) => {
  return (
    <View className="bg-card border-t border-border px-6 py-4 flex-row items-center pb-10 gap-4">
      {/* Col 1: Discard Changes */}
      <View style={{ flex: 1 }}>
        <Button
          variant="outline-danger"
          size="lg"
          shape="rounded"
          fullWidth
          title="Discard Changes"
          onPress={onDiscard}
          textClassName="text-error font-sans-bold text-body"
          accessibilityLabel="Discard questionnaire changes"
        />
      </View>

      {/* Col 2: Save */}
      <View style={{ flex: 1 }}>
        <Button
          variant="primary"
          size="lg"
          shape="rounded"
          fullWidth
          title="Save"
          onPress={onSave}
          leftIcon={<Save size={18} color={theme.colors.card} strokeWidth={2} />}
          textClassName="text-neutral-white font-sans-bold text-body"
          accessibilityLabel="Save questionnaire answers"
        />
      </View>
    </View>
  );
};

export default ReviewAnswersFooter;

