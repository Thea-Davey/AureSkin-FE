import React, { useRef } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { PopUpPanel } from '@/shared/components';
import {
  ProductCategory,
  ProductFilterTarget,
  ProductListFilter,
} from '../../model/library_types';

export interface PopUpProductCategoryPanelProps {
  visible: boolean;
  selectedCategory: ProductCategory | null;
  selectedListFilter: ProductListFilter;
  filterTarget: ProductFilterTarget;
  onClose: () => void;
  onApply: (category: ProductCategory | null, listFilter: ProductListFilter) => void;
}

const CATEGORY_OPTIONS: { label: string; value: ProductCategory | null }[] = [
  { label: 'All Products', value: null },
  { label: 'Cleansers', value: 'cleanser' },
  { label: 'Toners', value: 'toner' },
  { label: 'Moisturizers', value: 'moisturizer' },
  { label: 'Sunscreens', value: 'sunscreen' },
  { label: 'Serums & Treatments', value: 'serum' },
  { label: 'Other', value: 'other' },
];

const LIST_FILTER_OPTIONS: { label: string; value: ProductListFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Favorites', value: 'favorites' },
];

/**
 * Local PopUpProductCategoryPanel component for Library Products tab.
 * Uses global blueprint PopUpPanel (Style 2: no buttons below).
 */
export function PopUpProductCategoryPanel({
  visible,
  selectedCategory,
  selectedListFilter,
  filterTarget,
  onClose,
  onApply,
}: PopUpProductCategoryPanelProps) {
  // Preserve target and selected filters across close so UI doesn't jump during slide-down animation
  const lastTargetRef = useRef(filterTarget);
  const lastSelectedCategoryRef = useRef(selectedCategory);
  const lastSelectedListFilterRef = useRef(selectedListFilter);

  if (visible) {
    lastTargetRef.current = filterTarget;
    lastSelectedCategoryRef.current = selectedCategory;
    lastSelectedListFilterRef.current = selectedListFilter;
  }

  const activeTarget = visible ? filterTarget : lastTargetRef.current;
  const activeCategory = visible ? selectedCategory : lastSelectedCategoryRef.current;
  const activeListFilter = visible ? selectedListFilter : lastSelectedListFilterRef.current;

  const handleSelectCategory = (category: ProductCategory | null) => {
    onApply(category, selectedListFilter);
    onClose();
  };

  const handleSelectListFilter = (listFilter: ProductListFilter) => {
    onApply(selectedCategory, listFilter);
    onClose();
  };

  return (
    <PopUpPanel
      visible={visible}
      title={activeTarget === 'category' ? 'Categories' : 'Show'}
      style={2}
      onClose={onClose}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
        {activeTarget === 'category'
          ? CATEGORY_OPTIONS.map((option) => {
              const isSelected = activeCategory === option.value;
              return (
                <Pressable
                  key={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelectCategory(option.value)}
                  className={`mb-2 rounded-button border px-4 py-3 active:opacity-80 ${
                    isSelected
                      ? 'border-secondary bg-secondary/15'
                      : 'border-border bg-card'
                  }`}
                >
                  <Text
                    className={`text-body-sm ${
                      isSelected
                        ? 'font-sans-bold text-secondary-dark'
                        : 'font-sans-medium text-text'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })
          : LIST_FILTER_OPTIONS.map((option) => {
              const isSelected = activeListFilter === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelectListFilter(option.value)}
                  className={`mb-2 rounded-button border px-4 py-3 active:opacity-80 ${
                    isSelected
                      ? 'border-secondary bg-secondary/15'
                      : 'border-border bg-card'
                  }`}
                >
                  <Text
                    className={`text-body-sm ${
                      isSelected
                        ? 'font-sans-bold text-secondary-dark'
                        : 'font-sans-medium text-text'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
      </ScrollView>
    </PopUpPanel>
  );
}

