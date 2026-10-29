import { theme } from '@/shared/theme';
import { X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { HistoryFilters } from '../../model/history_types';

interface HistoryFilterSheetProps {
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

export function HistoryFilterSheet({
  visible,
  filters,
  skinTypes,
  conditions,
  onClose,
  onApply,
  onReset,
}: HistoryFilterSheetProps) {
  const [draft, setDraft] = useState(filters);
  const [isMounted, setIsMounted] = useState(visible);
  const sheetOffset = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  useEffect(() => {
    const screenHeight = Dimensions.get('window').height;

    if (visible && !isMounted) {
      setIsMounted(true);
      return;
    }

    if (visible) {
      sheetOffset.setValue(screenHeight);
      backdropOpacity.setValue(0);
      const frame = requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(sheetOffset, {
            toValue: 0,
            useNativeDriver: true,
            damping: 24,
            stiffness: 220,
            mass: 0.8,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
        ]).start();
      });
      return () => cancelAnimationFrame(frame);
    }

    if (!isMounted) return;

    const closeAnimation = Animated.parallel([
      Animated.timing(sheetOffset, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
    closeAnimation.start(({ finished }) => {
      if (finished) setIsMounted(false);
    });
    return () => closeAnimation.stop();
  }, [backdropOpacity, isMounted, sheetOffset, visible]);

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1">
        <Animated.View className="absolute inset-0 bg-text/40" style={{ opacity: backdropOpacity }}>
          <Pressable accessibilityLabel="Close filters" className="flex-1" onPress={onClose} />
        </Animated.View>
        <Animated.View
          className="absolute bottom-0 left-0 right-0 max-h-screen rounded-t-card bg-card px-5 pb-8 pt-5"
          style={{ transform: [{ translateY: sheetOffset }] }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-h3 font-sans-bold text-text">Filter history</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close filters" className="h-10 w-10 items-center justify-center">
              <X size={22} color={theme.colors.text} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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

          <View className="mt-4 flex-row gap-3">
            <Pressable onPress={onReset} accessibilityRole="button" className="flex-1 items-center rounded-button border border-border px-4 py-3 active:opacity-75">
              <Text className="text-label font-sans-semibold text-text">Reset</Text>
            </Pressable>
            <Pressable onPress={() => onApply(draft)} accessibilityRole="button" className="flex-1 items-center rounded-button bg-primary px-4 py-3 active:opacity-80">
              <Text className="text-label font-sans-bold text-neutral-white">Apply filters</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}