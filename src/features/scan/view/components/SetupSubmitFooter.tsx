import React from 'react';
import { Image, ImageSourcePropType, View, Text, Pressable } from 'react-native';
import { AlertCircle, CheckCircle2, X } from 'lucide-react-native';
import { theme } from '@/shared/theme';

const AURESKIN_LOGO_ICON: ImageSourcePropType = require('../../../../../assets/images/aureskin-logo.png');

export interface SetupSubmitFooterProps {
  isReady: boolean;
  statusHeader: string;
  statusSubtitle: string;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

/**
 * SetupSubmitFooter Component (Section 4.0 / Set Up Your Skin Analysis)
 * Fixed bottom layer presenting real-time analysis readiness and actions:
 * Row 1: Status icon + Review/Ready header + dynamic status summary.
 * Row 2: Ghost Cancel button + pill Submit for Analysis button.
 */
export const SetupSubmitFooter: React.FC<SetupSubmitFooterProps> = ({
  isReady,
  statusHeader,
  statusSubtitle,
  canSubmit,
  onCancel,
  onSubmit,
}) => {
  return (
    <View className="px-6 pt-3 pb-8 bg-primary">
      {/* Row 1: Status Indicator */}
      <View className="flex-row items-center gap-2 mb-3">
        {isReady ? (
          <CheckCircle2 size={18} color={theme.colors.accent} strokeWidth={2.2} />
        ) : (
          <AlertCircle size={18} color={theme.colors.card} strokeWidth={2} />
        )}
        <View className="flex-1">
          <Text className="text-body-sm font-sans-bold text-neutral-white">
            {statusHeader}
          </Text>
          <Text className="text-caption font-sans text-neutral-white/80">
            {statusSubtitle}
          </Text>
        </View>
      </View>

      {/* Row 2: Cancel & Submit Buttons */}
      <View className="flex-row items-center justify-between gap-4">
        {/* Col 1: Cancel Button (No stroke, pure white text) */}
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel scan setup"
          className="flex-row items-center gap-2 py-2.5 px-2 active:opacity-75"
        >
          <X size={20} color={theme.colors.white} strokeWidth={2.2} />
          <Text className="text-body font-sans-bold text-neutral-white">
            Cancel
          </Text>
        </Pressable>

        {/* Col 2: Submit Button */}
        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit for Analysis"
          accessibilityState={{ disabled: !canSubmit }}
          className={`flex-row items-center justify-between rounded-full bg-neutral-white px-5 py-2.5 shadow-sm active:opacity-90 ${!canSubmit ? 'opacity-50' : 'opacity-100'
            }`}
        >
          <Text className="mr-3 text-body font-sans-bold text-text">
            Submit for Analysis
          </Text>

          {/* Right Icon: AureSkin Logo */}
          <Image
            source={AURESKIN_LOGO_ICON}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default SetupSubmitFooter;

