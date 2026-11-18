import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Baby, CalendarDays, ChevronRight, Wheat } from 'lucide-react-native';
import { Card } from '../../../../shared/components/Card';
import { theme } from '../../../../shared/theme';

interface ProfileInfoCardProps {
  age?: number | string;
  ageGroupLabel?: string;
  allergens?: string[];
  isPregnant?: boolean;
  onEditPress?: () => void;
}

export function ProfileInfoCard({
  age,
  ageGroupLabel,
  allergens = [],
  isPregnant = false,
  onEditPress,
}: ProfileInfoCardProps) {
  const hasAge = Boolean(age !== undefined && age !== null && String(age).trim().length > 0);
  const ageYearsDisplay = hasAge ? `${age} yrs` : 'Not set';
  const lifeStageDisplay = hasAge ? (ageGroupLabel || 'Adult') : '';
  const allergenCount = allergens.length;

  const pregnancyDisplay = isPregnant ? 'Pregnant' : 'Not Pregnant';

  return (
    <Card className="p-5 mb-4">
      <Text className="text-body font-sans-bold text-secondary">
        Profile Information
      </Text>
      <Text className="text-caption font-sans text-muted mt-1 mb-4">
        This information helps us personalize your skincare analysis and recommendations.
      </Text>

      {/* =========================================================================
          1. AGE & LIFE STAGE ROW
         ========================================================================= */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel={hasAge ? `Age and Life Stage: ${ageYearsDisplay}, ${lifeStageDisplay}` : 'Age and Life Stage: Not set'}
        className="rounded-card border border-border bg-card p-3.5 mb-3 flex-row items-center justify-between"
      >
        <View className="w-11 h-11 rounded-full bg-primary items-center justify-center mr-3 shrink-0">
          <CalendarDays size={20} color={theme.colors.card} />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-body-sm font-sans-bold text-text">Age & Life Stage</Text>
          <Text className="text-caption font-sans text-muted mt-0.5">
            Helps tailor skin analysis and product recommendations.
          </Text>
        </View>
        <View className="items-end mr-1 shrink-0">
          <Text className="text-body-sm font-sans-bold text-text">
            {ageYearsDisplay}
          </Text>
          {lifeStageDisplay ? (
            <Text className="text-caption font-sans-medium text-muted mt-0.5">
              {lifeStageDisplay}
            </Text>
          ) : null}
        </View>
        <ChevronRight size={18} color={theme.colors.muted} />
      </TouchableOpacity>

      {/* =========================================================================
          2. PREGNANCY STATUS ROW (General Clinical Parameter)
         ========================================================================= */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel={`Pregnancy Status: ${pregnancyDisplay}`}
        className="rounded-card border border-border bg-card p-3.5 mb-3 flex-row items-center justify-between"
      >
        <View className="w-11 h-11 rounded-full bg-primary items-center justify-center mr-3 shrink-0">
          <Baby size={20} color={theme.colors.card} />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-body-sm font-sans-bold text-text">Pregnancy Status</Text>
          <Text className="text-caption font-sans text-muted mt-0.5">
            Filters pregnancy-contraindicated active ingredients.
          </Text>
        </View>
        <Text className="text-body-sm font-sans-bold text-text mr-1 shrink-0">
          {pregnancyDisplay}
        </Text>
        <ChevronRight size={18} color={theme.colors.muted} />
      </TouchableOpacity>

      {/* =========================================================================
          3. ALLERGEN ROW
         ========================================================================= */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel={`Allergens: ${allergenCount} listed`}
        className="rounded-card border border-border bg-card p-3.5 flex-row items-center justify-between"
      >
        <View className="w-11 h-11 rounded-full bg-primary items-center justify-center mr-3 shrink-0">
          <Wheat size={20} color={theme.colors.card} />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-body-sm font-sans-bold text-text">Allergens</Text>
          <Text className="text-caption font-sans text-muted mt-0.5">
            List any ingredients you are allergic or sensitive to.
          </Text>
        </View>
        <View className="rounded-badge bg-primary/15 px-2.5 py-0.5 mr-1 shrink-0">
          <Text className="text-body-sm font-sans-bold text-primary">
            {allergenCount}
          </Text>
        </View>
        <ChevronRight size={18} color={theme.colors.muted} />
      </TouchableOpacity>
    </Card>
  );
}

