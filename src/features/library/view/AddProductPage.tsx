import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { theme } from '../../../shared/theme';
import { useAddProduct } from '../viewmodel/useAddProduct';
import { EditCard } from './components/EditCard';
import { DiscardProductDialog } from './components/DiscardProductDialog';
import { ProductAddedConfirmation } from './components/ProductAddedConfirmation';

export function AddProductPage() {
  const form = useAddProduct();

  return (
    <View className="flex-1 bg-background">
      {/* Top Header */}
      <SafeAreaView edges={['top']} className="bg-primary">
        <StatusBar style="light" />
        <View className="flex-row items-center justify-between bg-primary px-4 py-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close add product form"
            onPress={form.actions.promptDiscard}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-white/10"
          >
            <View className="w-8" />
          </Pressable>
          <Text className="text-h3 font-sans-semibold text-neutral-white">
            Add Product
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close add product form"
            onPress={form.actions.promptDiscard}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-white/10"
          >
            <X size={18} color={theme.colors.card} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Main Content Area */}
      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <KeyboardAvoidingView
          className="flex-1 bg-background"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{ flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center' }}>
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-3 pb-6 pt-4"
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Card 1: Product Name */}
              <EditCard
                style="product-name"
                label="Product Name"
                value={form.draft.name}
                placeholder="Enter Product Name"
                onChangeText={(name) => form.actions.updateDraft({ name })}
              />

              {/* Card 2: Description */}
              <EditCard
                style="description"
                label="Description"
                value={form.draft.description}
                placeholder="Add optional product description..."
                onChangeText={(description) => form.actions.updateDraft({ description })}
              />

              {/* Card 3: Category */}
              <EditCard
                style="category"
                label="Category"
                selectedCategory={form.draft.category}
                onSelectCategory={form.actions.setCategory}
              />

              {/* Card 4: Ingredients */}
              <EditCard
                style="ingredients"
                label="Ingredients"
                items={form.draft.ingredients}
                options={form.availableIngredients}
                placeholder="Search and add ingredient"
                onAddItem={form.actions.addIngredient}
                onRemoveItem={form.actions.removeIngredient}
              />

              {/* Card 5: Skin Types */}
              <EditCard
                style="skin-types"
                label="Compatible Skin Types"
                items={form.draft.skinTypes}
                onAddItem={form.actions.addSkinType}
                onRemoveItem={form.actions.removeSkinType}
              />

              {/* Card 6: Skin Conditions */}
              <EditCard
                style="skin-conditions"
                label="Target Skin Conditions"
                items={form.draft.skinConditions}
                onAddItem={form.actions.addSkinCondition}
                onRemoveItem={form.actions.removeSkinCondition}
              />
            </ScrollView>

            {/* Bottom Actions */}
            <View className="gap-2.5 px-5 pb-5 pt-2">
              {/* Form Validation Error Message */}
              {form.error ? (
                <Text
                  accessibilityRole="alert"
                  className="text-center text-body-sm font-sans-medium text-status-error"
                >
                  {form.error}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={() => void form.actions.submit()}
                disabled={form.isSubmitting}
                accessibilityState={{ disabled: form.isSubmitting }}
                className="items-center justify-center rounded-button bg-secondary py-3.5 active:opacity-80 disabled:opacity-60"
              >
                {form.isSubmitting ? (
                  <Text className="text-body-sm font-sans-semibold text-neutral-white">
                    Adding product...
                  </Text>
                ) : (
                  <Text className="text-body-sm font-sans-semibold text-neutral-white">
                    Add Skincare Product
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={form.actions.promptDiscard}
                className="items-center justify-center rounded-button border border-secondary bg-card py-3 active:bg-secondary/10"
              >
                <Text className="text-body-sm font-sans-medium text-secondary">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Discard Confirmation Dialog */}
      {form.isDiscardVisible ? (
        <DiscardProductDialog
          visible={form.isDiscardVisible}
          onKeepEditing={form.actions.cancelDiscard}
          onDiscard={form.actions.confirmDiscard}
        />
      ) : null}

      {/* Redesigned Product Added Confirmation Modal */}
      {form.isSuccessVisible ? (
        <ProductAddedConfirmation
          visible={form.isSuccessVisible}
          onDismiss={form.actions.dismissSuccess}
        />
      ) : null}
    </View>
  );
}
