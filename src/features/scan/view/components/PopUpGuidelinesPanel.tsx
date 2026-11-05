import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Sun, Sparkles, Smile, Glasses, LucideIcon } from 'lucide-react-native';
import { PopUpPanel } from '@/shared/components/PopUpPanel';
import { SkinGuidanceTip } from '../../model/scan_types';
import { theme } from '@/shared/theme';

export interface PopUpGuidelinesPanelProps {
  visible: boolean;
  onClose: () => void;
  tips?: SkinGuidanceTip[];
}

const TIP_ICONS: Record<string, LucideIcon> = {
  Sun,
  Sparkles,
  Smile,
  Glasses,
};

/**
 * PopUpGuidelinesPanel
 * Local component wrapping the global shared PopUpPanel blueprint.
 * Presents smooth native spring slide-up guidance instructions for facial skin scanning.
 */
export const PopUpGuidelinesPanel: React.FC<PopUpGuidelinesPanelProps> = ({
  visible,
  onClose,
  tips = [],
}) => {
  return (
    <PopUpPanel
      visible={visible}
      title="Skin Test Guidelines"
      subtitle="Follow these tips for the most accurate analysis"
      onClose={onClose}
      style={2}
    >
      <View className="py-2">
        <ScrollView
          className="max-h-80"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-y-4 py-1">
            {tips.map((tip) => {
              const IconComponent = TIP_ICONS[tip.iconName] || Sparkles;
              return (
                <View
                  key={tip.id}
                  className="flex-row items-start gap-x-3.5 rounded-card bg-neutral-offwhite/60 border border-border/40 p-3.5"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center shrink-0 mt-0.5">
                    <IconComponent size={20} color={theme.colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-sm font-sans-bold text-text mb-0.5">
                      {tip.title}
                    </Text>
                    <Text className="text-caption font-sans text-muted leading-4">
                      {tip.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Primary Confirmation Action */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Got it, continue"
          className="w-full bg-primary rounded-button py-3.5 items-center justify-center active:opacity-85 mt-4"
        >
          <Text className="text-label font-sans-bold text-neutral-white">
            Got it, continue
          </Text>
        </Pressable>
      </View>
    </PopUpPanel>
  );
};

export default PopUpGuidelinesPanel;

