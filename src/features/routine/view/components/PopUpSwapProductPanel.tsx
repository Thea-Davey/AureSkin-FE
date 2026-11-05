import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Check, Sparkles } from 'lucide-react-native';
import { CompatibilityBadge, PopUpPanel, SearchBar } from '@/shared/components';
import { theme } from '@/shared/theme';
import {
  formatCategory,
  getProductCategoryImage,
  toCanonicalCategory,
} from '@/shared/utils/productCategory';
import { RoutineProduct } from '../../model/routine_types';

export interface PopUpSwapProductPanelProps {
  visible: boolean;
  stepName?: string;
  currentProductId?: string | null;
  products: RoutineProduct[];
  search: string;
  isLoading: boolean;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onSelectProduct: (product: RoutineProduct | null) => void;
}

/**
 * Local PopUpSwapProductPanel component for Routine product swap.
 * Uses global blueprint PopUpPanel (Style 2: no buttons below, item selection closes panel).
 */
export function PopUpSwapProductPanel({
  visible,
  stepName,
  currentProductId,
  products,
  search,
  isLoading,
  onClose,
  onSearchChange,
  onSelectProduct,
}: PopUpSwapProductPanelProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Preserve props during close animation so UI remains 100% stable while sliding down
  const lastStepNameRef = useRef(stepName);
  const lastProductIdRef = useRef(currentProductId);
  const lastProductsRef = useRef(products);

  if (visible && stepName) {
    lastStepNameRef.current = stepName;
  }
  if (visible && currentProductId !== undefined) {
    lastProductIdRef.current = currentProductId;
  }
  if (visible && products && products.length > 0) {
    lastProductsRef.current = products;
  }

  const activeStepName = visible
    ? (stepName || lastStepNameRef.current)
    : (lastStepNameRef.current || stepName);
  const activeProductId = visible
    ? currentProductId
    : (lastProductIdRef.current ?? currentProductId);
  const activeProducts =
    visible && products && products.length > 0
      ? products
      : lastProductsRef.current.length > 0
        ? lastProductsRef.current
        : products;

  useEffect(() => {
    if (visible) {
      setLocalSearch(search);
    }
  }, [search, visible]);

  const handleSearchChange = (text: string) => {
    setLocalSearch(text);
    onSearchChange(text);
  };

  // Determine the target canonical category for the active step
  const targetCategory = useMemo(() => {
    return toCanonicalCategory(activeStepName);
  }, [activeStepName]);

  // Filter products by the step's specific category, then by search query
  const filteredProducts = useMemo(() => {
    // 1. Strict category match
    const categoryMatched = activeProducts.filter((p) => {
      if (!targetCategory || targetCategory === 'other') return true;
      return toCanonicalCategory(p.category) === targetCategory;
    });

    // 2. Search query filter
    const query = localSearch.trim().toLowerCase();
    if (!query) return categoryMatched;
    return categoryMatched.filter((p) =>
      `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query)
    );
  }, [activeProducts, targetCategory, localSearch]);

  const subtitle = activeStepName
    ? `Recommending ${formatCategory(activeStepName)} products for your skin`
    : undefined;

  return (
    <PopUpPanel
      visible={visible}
      title="Swap Product"
      subtitle={subtitle}
      style={2}
      onClose={onClose}
      fullHeight={true}
    >
      {/* Global Shared SearchBar Component */}
      <SearchBar
        style={1}
        value={localSearch}
        onChangeText={handleSearchChange}
        placeholder={`Search ${activeStepName ? formatCategory(activeStepName) : 'products'}...`}
        className="px-0 pt-0 pb-3 bg-transparent rounded-none"
      />

      {/* Compatibility Ranking Badge */}
      <View className="mb-3 flex-row items-center">
        <Sparkles size={14} color={theme.colors.accent} />
        <Text className="ml-1.5 text-caption font-sans-semibold text-note-positive-title">
          Ranked by compatibility for {activeStepName ? formatCategory(activeStepName) : 'your skin'}
        </Text>
      </View>

      {/* Product Options List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator color={theme.colors.primary} />
          <Text className="mt-2 text-caption font-sans text-muted">
            Finding best compatible products...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-2.5 pb-6"
          showsVerticalScrollIndicator={false}
        >
          {filteredProducts.map((product) => {
            const isSelected = product.id === activeProductId;
            const categoryImage = getProductCategoryImage(product.category);

            return (
              <Pressable
                key={product.id}
                onPress={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${product.name}`}
                className={`flex-row items-center justify-between rounded-button p-3 border active:opacity-75 ${isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-neutral-offwhite/50'
                  }`}
              >
                {/* Product Illustration */}
                <View className="mr-3 h-11 w-11 items-center justify-center overflow-hidden rounded-button bg-secondary/15 p-1">
                  <Image
                    source={categoryImage}
                    contentFit="contain"
                    style={{ width: '100%', height: '100%' }}
                    accessibilityLabel={`${product.name} illustration`}
                  />
                </View>

                {/* Details */}
                <View className="flex-1 pr-2">
                  <Text className="text-body-sm font-sans-bold text-text" numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text className="text-caption font-sans text-muted" numberOfLines={1}>
                    {[product.brand, formatCategory(product.category)].filter(Boolean).join(' • ')}
                  </Text>
                </View>

                {/* Selected Status / Compatible Pill */}
                {isSelected ? (
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check size={14} color={theme.colors.white} strokeWidth={2.5} />
                  </View>
                ) : (
                  <CompatibilityBadge status="compatible" />
                )}
              </Pressable>
            );
          })}

          {filteredProducts.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Text className="text-body-sm font-sans text-muted">
                No compatible {activeStepName ? formatCategory(activeStepName) : 'products'} found.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </PopUpPanel>
  );
}

