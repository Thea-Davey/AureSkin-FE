import { theme } from '@/shared/theme';
import { Image } from 'expo-image';
import { Check, Package, Search, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { RoutineProduct, RoutineStep, RoutineStepUpdate } from '../../model/routine_types';

interface SwapProductSheetProps {
  visible: boolean;
  timeOfDay: 'morning' | 'evening' | null;
  steps: RoutineStep[];
  selectedStepId: string | null;
  products: RoutineProduct[];
  search: string;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSelectStep: (stepId: string) => void;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onSave: (stepId: string, updates: RoutineStepUpdate) => void;
}

function includesTime(step: RoutineStep, timeOfDay: 'morning' | 'evening'): boolean {
  return step.time_of_day === 'both' || step.time_of_day === timeOfDay;
}

export function SwapProductSheet({
  visible,
  timeOfDay,
  steps,
  selectedStepId,
  products,
  search,
  isLoading,
  isFetchingMore,
  hasMore,
  isSaving,
  error,
  onClose,
  onSelectStep,
  onSearchChange,
  onLoadMore,
  onRetry,
  onSave,
}: SwapProductSheetProps) {
  const relevantSteps = useMemo(
    () => steps.filter((step) => timeOfDay && includesTime(step, timeOfDay)),
    [steps, timeOfDay]
  );
  const activeStep = relevantSteps.find((step) => step.id === selectedStepId) ?? relevantSteps[0] ?? null;
  const [draftProductId, setDraftProductId] = useState<string | null>(activeStep?.product_id ?? null);
  const [draftStepName, setDraftStepName] = useState(activeStep?.step_name ?? '');
  const [draftDescription, setDraftDescription] = useState(activeStep?.description ?? '');
  const [failedImageIds, setFailedImageIds] = useState<string[]>([]);

  useEffect(() => {
    setDraftProductId(activeStep?.product_id ?? null);
    setDraftStepName(activeStep?.step_name ?? '');
    setDraftDescription(activeStep?.description ?? '');
  }, [activeStep?.id, activeStep?.product_id, activeStep?.step_name, activeStep?.description]);

  const save = () => {
    if (!activeStep) return;
    onSave(activeStep.id, {
      product_id: draftProductId,
      step_name: draftStepName.trim(),
      description: draftDescription.trim(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-transparent">
        <Pressable accessibilityLabel="Close routine editor" className="flex-1" onPress={onClose} />
        <View className="mx-3 mb-3 mt-8 max-h-[85%] rounded-card bg-card px-5 pb-8 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-h3 font-sans-bold text-text">Edit {timeOfDay === 'evening' ? 'Night' : 'Morning'} Routine</Text>
              <Text className="text-caption font-sans text-muted">Select a step and its recommended product.</Text>
            </View>
            <Pressable onPress={onClose} disabled={isSaving} accessibilityRole="button" accessibilityLabel="Close editor" className="h-10 w-10 items-center justify-center">
              <X size={21} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text className="mb-2 text-body-sm font-sans-semibold text-text">Routine step</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {relevantSteps.map((step) => (
                <Pressable
                  key={step.id}
                  onPress={() => onSelectStep(step.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: activeStep?.id === step.id }}
                  className={`rounded-badge border px-3 py-2 ${activeStep?.id === step.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                >
                  <Text numberOfLines={1} className="max-w-48 text-caption font-sans-medium text-text">{step.step_number}. {step.step_name}</Text>
                </Pressable>
              ))}
            </View>

            {activeStep ? (
              <>
                <Text className="mb-2 text-body-sm font-sans-semibold text-text">Step details</Text>
                <TextInput
                  value={draftStepName}
                  onChangeText={setDraftStepName}
                  accessibilityLabel="Routine step name"
                  className="mb-3 rounded-input border border-border bg-background px-3 py-3 text-body-sm text-text"
                />
                <TextInput
                  value={draftDescription}
                  onChangeText={setDraftDescription}
                  multiline
                  accessibilityLabel="Routine step description"
                  className="mb-4 min-h-20 rounded-input border border-border bg-background px-3 py-3 text-body-sm text-text"
                />

                <Text className="mb-2 text-body-sm font-sans-semibold text-text">Recommended product</Text>
                <View className="mb-3 flex-row items-center rounded-input border border-border bg-background px-3">
                  <Search size={18} color={theme.colors.muted} />
                  <TextInput
                    value={search}
                    onChangeText={onSearchChange}
                    placeholder="Search products"
                    placeholderTextColor={theme.colors.muted}
                    accessibilityLabel="Search routine products"
                    className="ml-2 min-w-0 flex-1 py-3 text-body-sm text-text"
                  />
                </View>

                <Pressable
                  onPress={() => setDraftProductId(null)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: draftProductId === null }}
                  className={`mb-2 flex-row items-center rounded-button border p-3 ${draftProductId === null ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-input bg-background">
                    <Package size={19} color={theme.colors.muted} />
                  </View>
                  <Text className="ml-3 flex-1 text-body-sm font-sans-medium text-text">No product recommendation</Text>
                  {draftProductId === null && <Check size={18} color={theme.colors.primary} />}
                </Pressable>

                {isLoading ? (
                  <ActivityIndicator color={theme.colors.primary} className="py-5" />
                ) : error ? (
                  <View className="rounded-button bg-status-error/10 p-3">
                    <Text accessibilityRole="alert" className="mb-2 text-body-sm font-sans text-error">{error}</Text>
                    <Pressable onPress={onRetry} accessibilityRole="button" className="self-start py-1">
                      <Text className="text-label font-sans-semibold text-primary">Retry</Text>
                    </Pressable>
                  </View>
                ) : products.length === 0 ? (
                  <Text className="py-4 text-center text-body-sm font-sans text-muted">No products found.</Text>
                ) : (
                  products.map((product) => {
                    const selected = draftProductId === product.id;
                    const imageFailed = failedImageIds.includes(product.id);
                    return (
                      <Pressable
                        key={product.id}
                        onPress={() => setDraftProductId(product.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        className={`mb-2 flex-row items-center rounded-button border p-3 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                      >
                        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-input bg-background">
                          {product.image_url && !imageFailed ? (
                            <Image
                              source={{ uri: product.image_url }}
                              contentFit="cover"
                              transition={150}
                              onError={() => setFailedImageIds((ids) => ids.includes(product.id) ? ids : [...ids, product.id])}
                              accessibilityLabel={`${product.name} product image`}
                              className="h-full w-full"
                            />
                          ) : (
                            <Package size={19} color={theme.colors.muted} />
                          )}
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-body-sm font-sans-semibold text-text">{product.name}</Text>
                          <Text className="text-caption font-sans text-muted">{[product.brand, product.category].filter(Boolean).join(' · ')}</Text>
                        </View>
                        {selected && <Check size={18} color={theme.colors.primary} />}
                      </Pressable>
                    );
                  })
                )}

                {hasMore && !isLoading && !error && (
                  <Pressable onPress={onLoadMore} disabled={isFetchingMore} accessibilityRole="button" className="items-center py-3">
                    {isFetchingMore ? <ActivityIndicator color={theme.colors.primary} /> : <Text className="text-label font-sans-semibold text-primary">Load more products</Text>}
                  </Pressable>
                )}
              </>
            ) : (
              <Text className="py-4 text-body-sm font-sans text-muted">No steps are available for this routine.</Text>
            )}
          </ScrollView>

          <View className="mt-3 flex-row gap-3">
            <Pressable onPress={onClose} disabled={isSaving} accessibilityRole="button" className="flex-1 items-center rounded-button border border-border px-4 py-3 active:opacity-75">
              <Text className="text-label font-sans-semibold text-text">Cancel</Text>
            </Pressable>
            <Pressable onPress={save} disabled={isSaving || !activeStep || !draftStepName.trim()} accessibilityRole="button" className="flex-1 flex-row items-center justify-center rounded-button bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50">
              {isSaving ? <ActivityIndicator color={theme.colors.white} /> : <Text className="text-label font-sans-bold text-neutral-white">Save changes</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}