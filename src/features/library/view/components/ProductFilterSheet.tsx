import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  ProductCategory,
  ProductFilterTarget,
  ProductListFilter,
} from '../../model/library_types';

interface ProductFilterSheetProps {
  visible: boolean;
  selectedCategory: ProductCategory | null;
  selectedListFilter: ProductListFilter;
  filterTarget: ProductFilterTarget;
  onClose: () => void;
  onApply: (category: ProductCategory | null, listFilter: ProductListFilter) => void;
}

const CATEGORY_OPTIONS: { label: string; value: ProductCategory | null }[] = [
  { label: 'All categories', value: null },
  { label: 'Cleansers', value: 'cleanser' },
  { label: 'Toners', value: 'toner' },
  { label: 'Moisturizers', value: 'moisturizer' },
  { label: 'Sunscreens', value: 'sunscreen' },
  { label: 'Serums', value: 'serum' },
  { label: 'Other', value: 'other' },
];

const LIST_FILTER_OPTIONS: { label: string; value: ProductListFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Favorites', value: 'favorites' },
];

export function ProductFilterSheet({
  visible,
  selectedCategory,
  selectedListFilter,
  filterTarget,
  onClose,
  onApply,
}: ProductFilterSheetProps) {
  const [draftCategory, setDraftCategory] = useState<ProductCategory | null>(selectedCategory);
  const [draftListFilter, setDraftListFilter] = useState<ProductListFilter>(selectedListFilter);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close product filters"
          onPress={onClose}
          className="flex-1"
        />
        <View className="max-h-screen rounded-t-card bg-card px-5 pb-8 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-h3 font-sans-bold text-text">
              {filterTarget === 'category' ? 'Categories' : 'Show'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              onPress={onClose}
              className="rounded-button px-3 py-2 active:opacity-70"
            >
              <Text className="text-label font-sans-medium text-muted">Close</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filterTarget === 'category'
              ? CATEGORY_OPTIONS.map((option) => {
                  const isSelected = draftCategory === option.value;
                  return (
                    <Pressable
                      key={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setDraftCategory(option.value)}
                      className={`mb-2 rounded-button border px-4 py-3 ${
                        isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}
                    >
                      <Text className="text-body-sm font-sans-medium text-text">
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })
              : LIST_FILTER_OPTIONS.map((option) => {
                  const isSelected = draftListFilter === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setDraftListFilter(option.value)}
                      className={`mb-2 rounded-button border px-4 py-3 ${
                        isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}
                    >
                      <Text className="text-body-sm font-sans-medium text-text">
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
          </ScrollView>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (filterTarget === 'category') {
                  onApply(null, selectedListFilter);
                } else {
                  onApply(selectedCategory, 'all');
                }
              }}
              className="flex-1 items-center rounded-button border border-border px-4 py-3 active:opacity-80"
            >
              <Text className="text-label font-sans-semibold text-text">Reset</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (filterTarget === 'category') {
                  onApply(draftCategory, selectedListFilter);
                } else {
                  onApply(selectedCategory, draftListFilter);
                }
              }}
              className="flex-1 items-center rounded-button bg-primary px-4 py-3 active:opacity-80"
            >
              <Text className="text-label font-sans-semibold text-neutral-white">Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
