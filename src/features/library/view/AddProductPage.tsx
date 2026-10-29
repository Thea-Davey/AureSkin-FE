import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, Plus, X } from 'lucide-react-native';
import { useAddProduct } from '../viewmodel/useAddProduct';
import { ProductAddedConfirmation } from './components/ProductAddedConfirmation';

const inputClassName = 'rounded-card border border-border bg-card px-4 py-3 text-body font-sans text-text';

export function AddProductPage() {
  const form = useAddProduct();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isIngredientsEditing, setIsIngredientsEditing] = useState(false);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-primary">
        <StatusBar style="light" />
        <View className="flex-row items-center justify-between bg-primary px-4 py-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close add product form"
            onPress={form.actions.cancel}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-white/10"
          >
            <View className="w-8" />
          </Pressable>
          <Text className="text-h3 font-sans-semibold text-neutral-white">
            Scanned Ingredients
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close add product form"
            onPress={form.actions.cancel}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-white/10"
          >
            <X size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <KeyboardAvoidingView
          className="flex-1 bg-background"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{ flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center' }}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-2 pb-4 pt-3"
            contentContainerStyle={{ paddingHorizontal: 13 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center justify-between rounded-card bg-card px-3 py-2">
              <TextInput
                accessibilityLabel="Product name"
                value={form.draft.name}
                onChangeText={(name) => form.actions.updateDraft({ name })}
                placeholder="Product Name"
                placeholderTextColor="#777777"
                editable={isNameEditing}
                onBlur={() => setIsNameEditing(false)}
                returnKeyType="done"
                className="flex-1 py-1 text-body-sm font-sans-semibold text-text"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit product name"
                onPress={() => setIsNameEditing(true)}
                className="p-1"
              >
                <Pencil size={14} color="#202020" />
              </Pressable>
            </View>

            <View className="gap-1 rounded-card bg-card p-2">
              <View className="flex-row items-center justify-between px-1 pb-1">
                <Text className="text-body-sm font-sans-semibold text-text">Ingredients</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isIngredientsEditing ? 'Finish editing ingredients' : 'Edit ingredients'
                  }
                  accessibilityState={{ selected: isIngredientsEditing }}
                  onPress={() => setIsIngredientsEditing((editing) => !editing)}
                  className="p-1"
                >
                  <Pencil size={14} color="#202020" />
                </Pressable>
              </View>

              {form.draft.ingredients.map((ingredient, index) => (
                <View
                  key={`${ingredient}-${index}`}
                  className={`min-h-8 flex-row items-center justify-between rounded-input px-2 ${index % 2 === 0 ? 'bg-background' : 'bg-card'}`}
                >
                  <Text className="text-body-sm font-sans text-text">{ingredient}</Text>
                  {isIngredientsEditing ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${ingredient}`}
                      onPress={() => form.actions.removeIngredient(ingredient)}
                      hitSlop={8}
                    >
                      <X size={13} color="#202020" />
                    </Pressable>
                  ) : null}
                </View>
              ))}

              {isIngredientsEditing ? (
                <View className="mt-1 flex-row items-center gap-2">
                  <TextInput
                    accessibilityLabel="Ingredient name"
                    value={form.ingredientInput}
                    onChangeText={form.actions.setIngredientInput}
                    onSubmitEditing={form.actions.addIngredient}
                    placeholder="Add ingredient"
                    placeholderTextColor="#777777"
                    returnKeyType="done"
                    className={`${inputClassName} flex-1 py-2`}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add ingredient"
                    onPress={form.actions.addIngredient}
                    className="h-9 w-9 items-center justify-center rounded-full bg-primary active:opacity-80"
                  >
                    <Plus size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : null}
            </View>

            <View className="overflow-hidden rounded-card bg-card">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isDescriptionExpanded }}
                onPress={() => setIsDescriptionExpanded((expanded) => !expanded)}
                className="flex-row items-center justify-between px-3 py-3"
              >
                <Text className="text-body-sm font-sans-semibold text-text">Add description</Text>
                <Plus size={16} color="#202020" />
              </Pressable>
              {isDescriptionExpanded ? (
                <TextInput
                  accessibilityLabel="Product description"
                  value={form.draft.description}
                  onChangeText={(description) => form.actions.updateDraft({ description })}
                  placeholder="Add optional product details"
                  placeholderTextColor="#777777"
                  multiline
                  textAlignVertical="top"
                  className={`${inputClassName} mx-3 mb-3 min-h-28`}
                />
              ) : null}
            </View>

            {form.error ? (
              <Text accessibilityRole="alert" className="text-body-sm font-sans text-status-error">
                {form.error}
              </Text>
            ) : null}

          </ScrollView>

          <View className="gap-2 px-[13px] pb-5 pt-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => void form.actions.submit()}
              disabled={form.isSubmitting}
              accessibilityState={{ disabled: form.isSubmitting }}
              className="items-center rounded-input bg-secondary px-5 py-2.5 active:opacity-80 disabled:opacity-60"
            >
              {form.isSubmitting ? (
                <View className="flex-row items-center gap-2">
                  <Text className="text-body-sm font-sans-semibold text-neutral-white">
                    Adding demo product...
                  </Text>
                </View>
              ) : (
                <Text className="text-body-sm font-sans-semibold text-neutral-white">
                  Add Skincare Product
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={form.actions.cancel}
              className="items-center rounded-input border border-secondary bg-card px-5 py-2 active:bg-secondary/10"
            >
              <Text className="text-body-sm font-sans-medium text-secondary">Cancel</Text>
            </Pressable>
          </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <ProductAddedConfirmation
        visible={form.isSuccessVisible}
        title="Demo product added!"
        message="This is temporary mock data and is not saved to your account."
        onDismiss={form.actions.dismissSuccess}
      />
    </View>
  );
}
