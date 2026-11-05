import React, { useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ChevronDown,
  Check,
  Pencil,
  Plus,
  X,
} from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import {
  ProductCategory,
  formatCategory,
} from '../../../../shared/utils/productCategory';

export type EditCardStyle =
  | 'product-name'
  | 'description'
  | 'category'
  | 'ingredients'
  | 'skin-types'
  | 'skin-conditions';

export interface EditCardProps {
  style: EditCardStyle;
  label: string;
  value?: string;
  items?: string[];
  placeholder?: string;
  selectedCategory?: ProductCategory;
  options?: string[]; // Available master items for auto-suggest / selection
  onChangeText?: (text: string) => void;
  onSelectCategory?: (category: ProductCategory) => void;
  onAddItem?: (item: string) => void;
  onRemoveItem?: (item: string) => void;
  testID?: string;
}

const CATEGORY_ITEMS: { label: string; value: ProductCategory }[] = [
  { label: 'Cleanser', value: 'cleanser' },
  { label: 'Toner', value: 'toner' },
  { label: 'Moisturizer', value: 'moisturizer' },
  { label: 'Sunscreen', value: 'sunscreen' },
  { label: 'Serum / Treatment', value: 'serum' },
  { label: 'Other', value: 'other' },
];

export const MASTER_SKIN_TYPES = [
  'Normal',
  'Oily',
  'Dry',
  'Combination',
  'Sensitive',
  'Acne-Prone',
];

export const MASTER_SKIN_CONDITIONS = [
  'Dark Spots',
  'Acne',
  'Blackheads',
  'Whiteheads',
  'Large Pores',
  'Redness',
  'Wrinkles',
  'Pigmentation',
];

export function EditCard({
  style,
  label,
  value = '',
  items = [],
  placeholder,
  selectedCategory = 'other',
  options = [],
  onChangeText,
  onSelectCategory,
  onAddItem,
  onRemoveItem,
  testID,
}: EditCardProps) {
  const inputRef = useRef<React.ElementRef<typeof TextInput> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  // Focus input on card press
  const handleCardPress = () => {
    if (style === 'product-name' || style === 'description') {
      inputRef.current?.focus();
    } else if (style === 'category') {
      setIsCategoryModalOpen(true);
    }
  };

  // Filter auto-suggest ingredients from options (database only & no duplicates)
  const query = ingredientInput.trim().toLowerCase();
  const filteredSuggestions = query.length > 0 && style === 'ingredients'
    ? options.filter((opt) => {
        const matchesQuery = opt.toLowerCase().includes(query);
        const alreadyAdded = items.some((item) => item.toLowerCase() === opt.toLowerCase());
        return matchesQuery && !alreadyAdded;
      }).slice(0, 5)
    : [];

  const handleSelectSuggestion = (suggestion: string) => {
    if (onAddItem && !items.includes(suggestion)) {
      onAddItem(suggestion);
    }
    setIngredientInput('');
    setIsSuggestOpen(false);
  };

  const handleAddCurrentInput = () => {
    const trimmed = ingredientInput.trim();
    if (!trimmed) {
      return;
    }
    const exactMatch = options.find((opt) => opt.toLowerCase() === trimmed.toLowerCase());
    if (exactMatch) {
      handleSelectSuggestion(exactMatch);
      return;
    }
    if (filteredSuggestions.length > 0) {
      handleSelectSuggestion(filteredSuggestions[0]);
      return;
    }
    handleSelectSuggestion(trimmed);
  };

  return (
    <Pressable
      testID={testID}
      onPress={handleCardPress}
      className="rounded-card border border-border bg-card p-4 shadow-sm active:border-primary/40"
    >
      {/* Card Header Label */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-caption font-sans-medium uppercase tracking-wider text-muted">
          {label}
        </Text>
        {style === 'product-name' && (
          <Pencil size={14} color={theme.colors.muted} />
        )}
        {style === 'category' && (
          <ChevronDown size={16} color={theme.colors.muted} />
        )}
      </View>

      {/* 1. Style: product-name */}
      {style === 'product-name' && (
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Enter product name'}
          placeholderTextColor={theme.colors.muted}
          returnKeyType="done"
          className="text-body font-sans-semibold text-text py-1"
        />
      )}

      {/* 2. Style: description */}
      {style === 'description' && (
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Add optional product details...'}
          placeholderTextColor={theme.colors.muted}
          multiline
          textAlignVertical="top"
          blurOnSubmit
          returnKeyType="done"
          className="min-h-[88px] text-body-sm font-sans text-text py-1 leading-5"
        />
      )}

      {/* 3. Style: category */}
      {style === 'category' && (
        <View className="flex-row items-center justify-between pt-1">
          <View className="rounded-badge bg-secondary px-3.5 py-1">
            <Text className="text-body-sm font-sans-medium text-neutral-white">
              {formatCategory(selectedCategory)}
            </Text>
          </View>
          <Text className="text-caption font-sans text-muted">
            Tap to change
          </Text>

          {/* Category Dropdown Selection Modal (only mounted when opened) */}
          {isCategoryModalOpen ? (
            <Modal
              visible={isCategoryModalOpen}
              transparent
              animationType="none"
              onRequestClose={() => setIsCategoryModalOpen(false)}
              statusBarTranslucent
            >
              <View className="flex-1 justify-end">
                <Animated.View
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(120)}
                  className="absolute inset-0 bg-black/40"
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close category options"
                    onPress={() => setIsCategoryModalOpen(false)}
                    className="flex-1"
                  />
                </Animated.View>

                <View className="rounded-t-card bg-card px-5 pb-8 pt-5 shadow-xl">
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-h3 font-sans-bold text-text">
                      Select Product Category
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                      onPress={() => setIsCategoryModalOpen(false)}
                      hitSlop={8}
                      className="p-1"
                    >
                      <X size={18} color={theme.colors.text} />
                    </Pressable>
                  </View>

                  {CATEGORY_ITEMS.map((cat) => {
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <Pressable
                        key={cat.value}
                        accessibilityRole="button"
                        accessibilityLabel={cat.label}
                        onPress={() => {
                          onSelectCategory?.(cat.value);
                          setIsCategoryModalOpen(false);
                        }}
                        className={`mb-2 flex-row items-center justify-between rounded-button px-4 py-3 ${
                          isSelected ? 'bg-secondary/15 border border-secondary' : 'bg-background'
                        }`}
                      >
                        <Text
                          className={`text-body-sm ${
                            isSelected ? 'font-sans-bold text-secondary' : 'font-sans text-text'
                          }`}
                        >
                          {cat.label}
                        </Text>
                        {isSelected ? (
                          <Check size={18} color={theme.colors.secondary} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Modal>
          ) : null}
        </View>
      )}

      {/* 4. Style: ingredients */}
      {style === 'ingredients' && (
        <View className="gap-2">
          {/* Ingredient Rows */}
          {items.map((ingredient, index) => (
            <View
              key={`${ingredient}-${index}`}
              className={`min-h-[38px] flex-row items-center justify-between rounded-input px-3 ${
                index % 2 === 0 ? 'bg-background' : 'bg-card border border-border/60'
              }`}
            >
              <Text className="text-body-sm font-sans text-text flex-1">
                {ingredient}
              </Text>
              {onRemoveItem ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${ingredient}`}
                  onPress={() => onRemoveItem(ingredient)}
                  hitSlop={8}
                  className="p-1"
                >
                  <X size={14} color={theme.colors.text} />
                </Pressable>
              ) : null}
            </View>
          ))}

          {/* Add Ingredient Input with Auto-Suggest */}
          <View className="relative mt-1">
            <TextInput
              accessibilityLabel="Ingredient search and add"
              value={ingredientInput}
              onChangeText={(text) => {
                setIngredientInput(text);
                setIsSuggestOpen(true);
              }}
              onFocus={() => setIsSuggestOpen(true)}
              onSubmitEditing={handleAddCurrentInput}
              placeholder={placeholder || 'Search & add ingredient'}
              placeholderTextColor={theme.colors.muted}
              returnKeyType="done"
              className="w-full rounded-input border border-border bg-card px-3 py-2 text-body-sm font-sans text-text"
            />

            {/* Auto-suggest dropdown (database only) */}
            {isSuggestOpen && filteredSuggestions.length > 0 ? (
              <View className="mt-1 rounded-card border border-border bg-card shadow-md overflow-hidden z-20">
                <Text className="px-3 pt-2 pb-1 text-caption font-sans-medium text-muted">
                  Suggested Ingredients
                </Text>
                {filteredSuggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${suggestion}`}
                    onPress={() => handleSelectSuggestion(suggestion)}
                    className="flex-row items-center justify-between px-3 py-2.5 border-b border-border/40 active:bg-secondary/15"
                  >
                    <Text className="text-body-sm font-sans text-text">
                      {suggestion}
                    </Text>
                    <Plus size={16} color={theme.colors.secondary} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      )}

      {/* 5. Style: skin-types */}
      {style === 'skin-types' && (
        <View className="gap-2.5">
          {/* Selected Chips */}
          {items.length > 0 && (
            <View className="flex-row flex-wrap">
              {items.map((type) => (
                <View
                  key={type}
                  className="mb-1.5 mr-2 flex-row items-center rounded-badge bg-secondary/15 border border-secondary/30 px-3 py-1"
                >
                  <Text className="text-caption font-sans-semibold text-secondary mr-1.5">
                    {type}
                  </Text>
                  {onRemoveItem ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${type}`}
                      onPress={() => onRemoveItem(type)}
                      hitSlop={6}
                    >
                      <X size={12} color={theme.colors.secondary} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {/* Available Unselected Options to Add */}
          <View className={items.length > 0 ? "pt-1 border-t border-border/50" : ""}>
            <Text className="mb-2 text-caption font-sans text-muted">
              Tap to add compatible skin types:
            </Text>
            <View className="flex-row flex-wrap">
              {(options.length > 0 ? options : MASTER_SKIN_TYPES)
                .filter((type) => !items.includes(type))
                .map((type) => (
                  <Pressable
                    key={type}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${type}`}
                    onPress={() => onAddItem?.(type)}
                    className="mb-1.5 mr-2 flex-row items-center rounded-badge border border-border bg-background px-3 py-1 active:bg-secondary/10"
                  >
                    <Plus size={12} color={theme.colors.muted} />
                    <Text className="ml-1 text-caption font-sans text-text">
                      {type}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </View>
        </View>
      )}

      {/* 6. Style: skin-conditions */}
      {style === 'skin-conditions' && (
        <View className="gap-2.5">
          {/* Selected Chips */}
          {items.length > 0 && (
            <View className="flex-row flex-wrap">
              {items.map((condition) => (
                <View
                  key={condition}
                  className="mb-1.5 mr-2 flex-row items-center rounded-badge bg-primary/15 border border-primary/30 px-3 py-1"
                >
                  <Text className="text-caption font-sans-semibold text-primary mr-1.5">
                    {condition}
                  </Text>
                  {onRemoveItem ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${condition}`}
                      onPress={() => onRemoveItem(condition)}
                      hitSlop={6}
                    >
                      <X size={12} color={theme.colors.primary} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {/* Available Unselected Options to Add */}
          <View className={items.length > 0 ? "pt-1 border-t border-border/50" : ""}>
            <Text className="mb-2 text-caption font-sans text-muted">
              Tap to add target skin conditions:
            </Text>
            <View className="flex-row flex-wrap">
              {(options.length > 0 ? options : MASTER_SKIN_CONDITIONS)
                .filter((condition) => !items.includes(condition))
                .map((condition) => (
                  <Pressable
                    key={condition}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${condition}`}
                    onPress={() => onAddItem?.(condition)}
                    className="mb-1.5 mr-2 flex-row items-center rounded-badge border border-border bg-background px-3 py-1 active:bg-primary/10"
                  >
                    <Plus size={12} color={theme.colors.muted} />
                    <Text className="ml-1 text-caption font-sans text-text">
                      {condition}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}
