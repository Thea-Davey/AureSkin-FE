import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { PopUpPanel } from '@/shared/components';
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
 * Uses global blueprint PopUpPanel (Style 1: has bottom action buttons Reset & Apply filters).
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

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  return (
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
        <Text className="mb-2 text-body-sm font-sans-semibold text-text">Date range</Text>
        <View className="mb-5 flex-row gap-3">
          <TextInput
            value={draft.startDate ?? ''}
            onChangeText={(value) => setDraft((current) => ({ ...current, startDate: value || null }))}
            placeholder="From YYYY-MM-DD"
            placeholderTextColor={theme.colors.muted}
            accessibilityLabel="Start date filter"
            className="min-w-0 flex-1 rounded-input border border-border bg-background px-3 py-3 text-body-sm text-text"
          />
          <TextInput
            value={draft.endDate ?? ''}
            onChangeText={(value) => setDraft((current) => ({ ...current, endDate: value || null }))}
            placeholder="To YYYY-MM-DD"
            placeholderTextColor={theme.colors.muted}
            accessibilityLabel="End date filter"
            className="min-w-0 flex-1 rounded-input border border-border bg-background px-3 py-3 text-body-sm text-text"
          />
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
  );
}

