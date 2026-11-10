import React from 'react';
import { Pressable, View } from 'react-native';
import { MoonStar, Sun } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { RoutineSkinProfile, RoutineStep, SkincareRoutine } from '../../model/routine_types';
import { RoutineActiveSkinProfileCard } from '../components/RoutineActiveSkinProfileCard';
import { RoutineTimeOfDayCard } from '../components/RoutineTimeOfDayCard';
import { WhyThisRoutineNote } from '../components/WhyThisRoutineNote';

const DARK_BROWN = '#6B4423';

interface S2RoutineStepsProps {
  routine: SkincareRoutine;
  skinProfile: RoutineSkinProfile | null;
  activeTimeOfDay: 'morning' | 'evening';
  isEditing: boolean;
  displayedSteps: RoutineStep[];
  onToggleTimeOfDay: (timeOfDay: 'morning' | 'evening') => void;
  onOpenMenu: () => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
  onOpenSwapProduct: (stepId: string, currentProductId: string | null, stepName?: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (categoryName?: string, categoryDesc?: string) => string;
  onSelectCategory: (stepId: string, categoryName: string, categoryDesc: string) => void;
}

export function S2RoutineSteps({
  routine,
  skinProfile,
  activeTimeOfDay,
  isEditing,
  displayedSteps,
  onToggleTimeOfDay,
  onOpenMenu,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onOpenSwapProduct,
  onMoveUp,
  onMoveDown,
  onDeleteStep,
  onAddStep,
  onSelectCategory,
}: S2RoutineStepsProps) {
  const isMorning = activeTimeOfDay === 'morning';

  return (
    <View className="gap-3.5">
      {/* 1. Simplified Skin Profile Card (Image 5) */}
      <RoutineActiveSkinProfileCard
        profile={skinProfile}
        onOpenMenu={onOpenMenu}
      />

      {/* 2. Day / Night Toggle Bar (Reference User Images 1 & 2)
          Outer container color is OPPOSITE to the inner selected option:
          - Morning active: outer is bg-neutral-offwhite, inner selected is bg-secondary
          - Night active: outer is bg-secondary, inner selected is bg-neutral-offwhite
          - Sun icon is always white; Moon icon is always dark brown (#6B4423)
      */}
      <View
        className={`flex-row items-center rounded-card p-1 shadow-xs ${isMorning ? 'bg-neutral-beige' : 'bg-secondary'
          }`}
      >
        {/* Morning Tab Button */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isMorning }}
          accessibilityLabel="Morning Routine Tab"
          onPress={() => onToggleTimeOfDay('morning')}
          className={`flex-1 flex-row items-center justify-center rounded-button py-2 ${isMorning ? 'bg-secondary shadow-xs' : 'bg-transparent'
            } active:opacity-80`}
        >
          <Sun
            size={20}
            color={isMorning ? theme.colors.white : theme.colors.beige}
            fill={isMorning ? theme.colors.white : 'none'}
            strokeWidth={2.2}
          />
        </Pressable>

        {/* Night Tab Button */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: !isMorning }}
          accessibilityLabel="Night Routine Tab"
          onPress={() => onToggleTimeOfDay('evening')}
          className={`flex-1 flex-row items-center justify-center rounded-button py-2 ${!isMorning ? 'bg-neutral-beige shadow-xs' : 'bg-transparent'
            } active:opacity-80`}
        >
          <MoonStar
            size={20}
            color={!isMorning ? DARK_BROWN : theme.colors.secondary}
            fill={!isMorning ? DARK_BROWN : 'none'}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>

      {/* 3. Unified Morning / Night Routine Card (No Outer Container Border) */}
      <RoutineTimeOfDayCard
        timeOfDay={activeTimeOfDay}
        steps={displayedSteps}
        isEditing={isEditing}
        onStartEditing={onStartEditing}
        onCancelEditing={onCancelEditing}
        onSaveEditing={onSaveEditing}
        onOpenSwapProduct={onOpenSwapProduct}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDeleteStep={onDeleteStep}
        onAddStep={onAddStep}
        onSelectCategory={onSelectCategory}
      />

      {/* 4. Why This Routine Note (Style 1 Two-Column Callout) */}
      <WhyThisRoutineNote rationale={routine.rationale} />
    </View>
  );
}
