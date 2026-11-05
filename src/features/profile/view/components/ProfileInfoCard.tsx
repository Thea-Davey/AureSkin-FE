import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Wheat } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface ProfileInfoCardProps {
  age?: number | string;
  allergens?: string[];
  onEditPress?: () => void;
}

export function ProfileInfoCard({
  // age = 20, // (age prop ready for when age container is re-enabled)
  allergens = [],
  onEditPress,
}: ProfileInfoCardProps) {
  const allergenDisplay =
    allergens.length > 0 ? allergens.join(', ') : 'None';

  return (
    <View className="rounded-card border border-border bg-card p-5 mb-4 shadow-xs">
      <Text className="text-body font-sans-bold text-secondary">
        Profile Information
      </Text>
      <Text className="text-caption font-sans text-muted mt-1 mb-4">
        This information helps us personalize your skincare analysis and recommendations.
      </Text>

      {/* =========================================================================
          AGE ROW (Commented out per user request; ready to re-enable when needed)
         ========================================================================= */}
      {/*
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onEditPress}
        className="rounded-card border border-border bg-card p-3.5 mb-3 flex-row items-center justify-between"
      >
        <View className="w-11 h-11 rounded-full bg-primary items-center justify-center mr-3">
          <CalendarDays size={20} color={theme.colors.card} />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-body font-sans-bold text-text">Age</Text>
          <Text className="text-caption font-sans text-muted mt-0.5">
            Your age helps tailor skin analysis and product recommendations
          </Text>
        </View>
        <View className="items-end mr-1">
          <Text className="text-body font-sans-bold text-text">{age}</Text>
          <Text className="text-caption font-sans text-muted">years old</Text>
        </View>
        <ChevronRight size={18} color={theme.colors.muted} />
      </TouchableOpacity>
      */}

      {/* =========================================================================
          ALLERGEN ROW (Active)
         ========================================================================= */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onEditPress}
        className="rounded-card border border-border bg-card p-3.5 flex-row items-center justify-between"
      >
        <View className="w-11 h-11 rounded-full bg-primary items-center justify-center mr-3">
          <Wheat size={20} color={theme.colors.card} />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-body font-sans-bold text-text">Allergen</Text>
          <Text className="text-caption font-sans text-muted mt-0.5">
            List any ingredients you are allergic or sensitive to.
          </Text>
        </View>
        <Text className="text-body font-sans-bold text-text mr-1">
          {allergenDisplay}
        </Text>
        <ChevronRight size={18} color={theme.colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

