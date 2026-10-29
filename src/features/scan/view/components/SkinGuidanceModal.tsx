import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Sun, Sparkles, Smile, Glasses, X } from 'lucide-react-native';
import { SkinGuidanceTip } from '../../model/scan_types';
import { theme } from '../../../../shared/theme';

export interface SkinGuidanceModalProps {
  visible: boolean;
  onClose: () => void;
  tips?: SkinGuidanceTip[];
}

const TIP_ICONS = {
  Sun,
  Sparkles,
  Smile,
  Glasses,
};

/**
 * Slide-up Skin Test Guidance Modal (Section 4.2).
 * Opened by tapping the Help icon (?) in the top header.
 */
export const SkinGuidanceModal: React.FC<SkinGuidanceModalProps> = ({
  visible,
  onClose,
  tips = [],
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Dismiss guidance modal"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View className="w-full max-w-md bg-card rounded-t-card px-6 pt-5 pb-8 shadow-xl self-center">
          {/* Header Row */}
          <View className="flex-row items-center justify-between pb-4 border-b border-border">
            <Text className="text-h3 font-sans-bold text-neutral-text">
              Skin Test Guidelines
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close guidelines modal"
              className="p-1 rounded-full active:bg-neutral-offwhite"
            >
              <X size={22} color={theme.colors.muted} />
            </Pressable>
          </View>

          {/* Tips List */}
          <ScrollView
            className="my-4 max-h-80"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-y-4">
              {tips.map((tip) => {
                const IconComponent = TIP_ICONS[tip.iconName] || Sparkles;
                return (
                  <View key={tip.id} className="flex-row items-start gap-x-3.5">
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center shrink-0 mt-0.5">
                      <IconComponent size={20} color={theme.colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-body-sm font-sans-bold text-neutral-text mb-0.5">
                        {tip.title}
                      </Text>
                      <Text className="text-caption font-sans text-neutral-muted leading-4">
                        {tip.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Primary Action Button */}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Confirm guidance and return to camera"
            className="w-full bg-primary rounded-button py-3.5 items-center justify-center active:bg-primary/90 mt-2"
          >
            <Text className="text-label font-sans-bold text-neutral-white">
              Got It
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
});
