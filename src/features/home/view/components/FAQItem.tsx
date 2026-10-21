import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { FAQ } from '../../model/home_types';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItemProps {
  faq: FAQ;
}

export function FAQItem({ faq }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  };

  return (
    <View className="bg-card rounded-card mb-3 border border-border shadow-xs overflow-hidden">
      <TouchableOpacity
        onPress={toggleOpen}
        activeOpacity={0.75}
        className="p-3.5 flex-row items-center justify-between"
      >
        <Text className="text-body-sm font-sans-bold text-text flex-1 pr-3">
          {faq.question}
        </Text>

        {/* Brown/Terracotta Square Button with White Chevron */}
        <View className="w-[34px] h-[34px] rounded-input bg-secondary items-center justify-center shadow-xs">
          {isOpen ? (
            <ChevronUp size={18} color={theme.colors.card} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={18} color={theme.colors.card} strokeWidth={2.5} />
          )}
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View className="px-4 pb-4 pt-1 border-t border-border">
          <Text className="text-caption font-sans text-text leading-5">
            {faq.answer}
          </Text>
        </View>
      )}
    </View>
  );
}
