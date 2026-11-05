import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { CalendarPickerModal, PopUpPanel } from '@/shared/components';
import { theme } from '@/shared/theme';
import { HistoryFilters } from '../../model/history_types';

export interface PopUpHistoryFilterPanelProps {
  visible: boolean;
  filters: HistoryFilters;
  skinTypes: string[];
  conditions: string[];
  onClose: () => void;
  onApply: (filters: HistoryFilters) => void;
  onReset: () => void;
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

/**
 * Local PopUpHistoryFilterPanel component for History filter sheet.
 * Uses global blueprint PopUpPanel (Style 1: bottom action buttons Reset & Apply filters).
 * Features calendar picker modal triggered by calendar icon.
 */
export function PopUpHistoryFilterPanel({
  visible,
  filters,
  skinTypes,
  conditions,
  onClose,
  onApply,
  onReset,
}: PopUpHistoryFilterPanelProps) {
  const [draft, setDraft] = useState(filters);
  const [activePickerTarget, setActivePickerTarget] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  const handleSelectDate = (date: string) => {
    if (activePickerTarget === 'from') {
      setDraft((curr) => ({ ...curr, startDate: date || null }));
    } else if (activePickerTarget === 'to') {
      setDraft((curr) => ({ ...curr, endDate: date || null }));
    }
  };

  return (
    <>
      <PopUpPanel
        visible={visible}
        title="Filter history"
        style={1}
        onClose={onClose}
        onReset={onReset}
        onApply={() => onApply(draft)}
        resetLabel="Reset"
        applyLabel="Apply filters"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flexGrow: 0 }}
        >
          {/* Date range header */}
          <Text className="mb-2 text-body-sm font-sans-semibold text-text">Date range</Text>

          {/* Date Range Inputs: [From] [To] with captions & calendar icons */}
          <View className="mb-5 flex-row gap-3">
            {/* From field */}
            <View className="flex-1">
              <Text className="mb-1 text-caption font-sans-medium text-muted">From</Text>
              <View className="flex-row items-center rounded-input border border-border bg-background px-3 py-2">
                <TextInput
                  value={draft.startDate ?? ''}
                  onChangeText={(value) => setDraft((current) => ({ ...current, startDate: value || null }))}
                  placeholder="yyyy-mm-dd"
                  placeholderTextColor={theme.colors.muted}
                  accessibilityLabel="Start date filter"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="min-w-0 flex-1 py-1 text-body-sm font-sans text-text"
                />
                <Pressable
                  onPress={() => setActivePickerTarget('from')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Open calendar for start date"
                  className="p-1 active:opacity-60"
                >
                  <CalendarDays size={18} color={theme.colors.muted} />
                </Pressable>
              </View>
            </View>

            {/* To field */}
            <View className="flex-1">
              <Text className="mb-1 text-caption font-sans-medium text-muted">To</Text>
              <View className="flex-row items-center rounded-input border border-border bg-background px-3 py-2">
                <TextInput
                  value={draft.endDate ?? ''}
                  onChangeText={(value) => setDraft((current) => ({ ...current, endDate: value || null }))}
                  placeholder="yyyy-mm-dd"
                  placeholderTextColor={theme.colors.muted}
                  accessibilityLabel="End date filter"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="min-w-0 flex-1 py-1 text-body-sm font-sans text-text"
                />
                <Pressable
                  onPress={() => setActivePickerTarget('to')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Open calendar for end date"
                  className="p-1 active:opacity-60"
                >
                  <CalendarDays size={18} color={theme.colors.muted} />
                </Pressable>
              </View>
            </View>
          </View>

          <Text className="mb-2 text-body-sm font-sans-semibold text-text">Skin type</Text>
          <View className="mb-5 flex-row flex-wrap gap-2">
            {skinTypes.map((skinType) => {
              const selected = draft.skinTypes.includes(skinType);
              return (
                <Pressable
                  key={skinType}
                  onPress={() => setDraft((current) => ({ ...current, skinTypes: toggleValue(current.skinTypes, skinType) }))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  className={`rounded-badge border px-3 py-2 ${selected ? 'border-primary bg-primary/15' : 'border-border bg-card'}`}
                >
                  <Text className="text-body-sm font-sans-medium text-text">{skinType}</Text>
                </Pressable>
              );
            })}
            {skinTypes.length === 0 && <Text className="text-body-sm font-sans text-muted">No skin types available</Text>}
          </View>

          <Text className="mb-2 text-body-sm font-sans-semibold text-text">Conditions</Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {conditions.map((condition) => {
              const selected = draft.conditions.includes(condition);
              return (
                <Pressable
                  key={condition}
                  onPress={() => setDraft((current) => ({ ...current, conditions: toggleValue(current.conditions, condition) }))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  className={`rounded-badge border px-3 py-2 ${selected ? 'border-primary bg-primary/15' : 'border-border bg-card'}`}
                >
                  <Text className="text-body-sm font-sans-medium text-text">{condition}</Text>
                </Pressable>
              );
            })}
            {conditions.length === 0 && <Text className="text-body-sm font-sans text-muted">No conditions available</Text>}
          </View>
        </ScrollView>
      </PopUpPanel>

      <CalendarPickerModal
        visible={activePickerTarget !== null}
        selectedDate={activePickerTarget === 'from' ? draft.startDate : draft.endDate}
        title={activePickerTarget === 'from' ? 'Select Start Date' : 'Select End Date'}
        onSelectDate={handleSelectDate}
        onClose={() => setActivePickerTarget(null)}
      />
    </>
  );
}

export default PopUpHistoryFilterPanel;
