import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Camera,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react-native';
import { GuideItem } from '../../model/help_types';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme';

interface QuickGuideCardProps {
  guide: GuideItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function QuickGuideCard({
  guide,
  isExpanded,
  onToggle,
}: QuickGuideCardProps) {
  const renderIcon = () => {
    switch (guide.iconType) {
      case 'camera':
        return (
          <View className="mr-3 mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <Camera size={20} color={theme.colors.primary} />
          </View>
        );
      case 'sparkles':
        return (
          <View className="mr-3 mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-secondary/15">
            <Sparkles size={20} color={theme.colors.secondary} />
          </View>
        );
      case 'sliders':
        return (
          <View className="mr-3 mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Sliders size={20} color={theme.colors.primary} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Card style={2} className="mb-3.5 bg-card p-4 items-stretch">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle(guide.id)}
        className="flex-row items-start justify-between"
        accessibilityRole="button"
        accessibilityLabel={`Guide: ${guide.title}`}
        accessibilityHint="Expands or collapses guide instructions"
      >
        <View className="flex-1 flex-row items-start mr-2">
          {renderIcon()}
          <View className="flex-1">
            <Text className="text-body font-sans-bold text-text">
              {guide.title}
            </Text>
            <Text className="mt-1 text-body-sm font-sans text-muted leading-5">
              {guide.summary}
            </Text>
          </View>
        </View>

        <View className="mt-1">
          {isExpanded ? (
            <ChevronUp size={18} color={theme.colors.primary} />
          ) : (
            <ChevronDown size={18} color={theme.colors.muted} />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="mt-3.5 border-t border-border/50 pt-3">
          <Text className="mb-2 text-caption font-sans-semibold text-text uppercase">
            Recommended Steps
          </Text>
          <View className="gap-2">
            {guide.steps.map((step, idx) => (
              <View key={idx} className="flex-row items-start gap-2.5">
                <View className="mt-0.5">
                  <CheckCircle2 size={16} color={theme.colors.primary} />
                </View>
                <Text className="flex-1 text-body-sm font-sans text-text leading-5">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

