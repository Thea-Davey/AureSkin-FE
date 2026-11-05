import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import {
  ChevronDown,
  ChevronUp,
  MoonStar,
  Plus,
  RefreshCw,
  Sun,
  Trash2,
  X,
} from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { ProductDetailPage } from '@/shared/components';
import { getProductCategoryImage } from '@/shared/utils/productCategory';
import { RoutineStep } from '../../model/routine_types';

const CANONICAL_CATEGORIES = [
  { name: 'Cleanser', desc: 'Remove impurities and excess sebum gently.' },
  { name: 'Toner', desc: 'Balance skin pH and prepare barrier for treatments.' },
  { name: 'Serum / Treatment', desc: 'Target active concerns and support barrier health.' },
  { name: 'Moisturizer', desc: 'Hydrate and seal in moisture effectively.' },
  { name: 'Sunscreen', desc: 'Protect against daily environmental UV exposure.' },
] as const;

interface RoutineTimeOfDayCardProps {
  timeOfDay: 'morning' | 'evening';
  steps: RoutineStep[];
  isEditing: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveEditing: (updatedSteps: RoutineStep[]) => void;
  onOpenSwapProduct: (stepId: string, currentProductId: string | null, stepName?: string) => void;
}

export function RoutineTimeOfDayCard({
  timeOfDay,
  steps,
  isEditing,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onOpenSwapProduct,
}: RoutineTimeOfDayCardProps) {
  const isMorning = timeOfDay === 'morning';
  const [localSteps, setLocalSteps] = useState<RoutineStep[]>(steps);
  const [categoryPickerStepId, setCategoryPickerStepId] = useState<string | null>(null);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);

  // Sync local steps when steps prop changes and not currently editing
  React.useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  // Reorder step: move up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...localSteps];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    const updated = reordered.map((step, idx) => ({ ...step, step_number: idx + 1 }));
    setLocalSteps(updated);
  };

  // Reorder step: move down
  const handleMoveDown = (index: number) => {
    if (index === localSteps.length - 1) return;
    const reordered = [...localSteps];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    const updated = reordered.map((step, idx) => ({ ...step, step_number: idx + 1 }));
    setLocalSteps(updated);
  };

  // Delete step
  const handleDeleteStep = (stepId: string) => {
    const filtered = localSteps.filter((s) => s.id !== stepId);
    const updated = filtered.map((step, idx) => ({ ...step, step_number: idx + 1 }));
    setLocalSteps(updated);
  };

  // Add step: initial title "Select Skincare"
  const handleAddStep = () => {
    const newStepNumber = localSteps.length + 1;
    const newId = `custom-step-${Date.now()}`;
    const newStep: RoutineStep = {
      id: newId,
      step_number: newStepNumber,
      step_name: 'Select Skincare',
      description: 'Tap to choose category and product.',
      time_of_day: timeOfDay,
      product_id: null,
      product: null,
    };
    setLocalSteps([...localSteps, newStep]);
    setCategoryPickerStepId(newId);
  };

  // Update category of a step
  const handleSelectCategory = (categoryName: string, categoryDesc: string) => {
    if (!categoryPickerStepId) return;
    setLocalSteps((prev) =>
      prev.map((step) =>
        step.id === categoryPickerStepId
          ? {
            ...step,
            step_name: categoryName,
            description: categoryDesc,
            product_id: null,
            product: null,
          }
          : step
      )
    );
    setCategoryPickerStepId(null);
  };

  const handleSave = () => {
    onSaveEditing(localSteps);
  };

  const handleCancel = () => {
    setLocalSteps(steps);
    onCancelEditing();
  };

  const displayedSteps = isEditing ? localSteps : steps;

  return (
    // Outer Container without container border
    <View className="overflow-hidden rounded-card bg-neutral-white shadow-xs">
      {/* Header Container */}
      <View
        className={`px-4 py-3.5 flex-row items-center justify-between ${isMorning ? 'bg-neutral-beige' : 'bg-secondary'
          }`}
      >
        {/* Left: Filled Icon & Title Block */}
        <View className="flex-row items-center flex-1 pr-3">
          {isMorning ? (
            <Sun
              size={24}
              color="#F59E0B"
              fill="#F59E0B"
              strokeWidth={2}
            />
          ) : (
            <MoonStar
              size={24}
              color="#0055D4"
              fill="#0055D4"
              strokeWidth={2}
            />
          )}
          <View className="ml-2.5 flex-1">
            <Text
              className={`text-h3 font-sans-bold ${isMorning ? 'text-text' : 'text-neutral-white'
                }`}
            >
              {isMorning ? 'Morning Routine' : 'Night Routine'}
            </Text>
            <Text
              className={`text-caption font-sans ${isMorning ? 'text-muted' : 'text-neutral-white/90'
                }`}
            >
              Protect & hydrate your skin
            </Text>
          </View>
        </View>

        {/* Right: EDIT / Save Actions */}
        {isEditing ? (
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleCancel}
              accessibilityRole="button"
              className="rounded-button bg-card px-3 py-1.5 border border-border active:opacity-75"
            >
              <Text className="text-caption font-sans-semibold text-text">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              accessibilityRole="button"
              className="rounded-button bg-primary px-3.5 py-1.5 active:opacity-80"
            >
              <Text className="text-caption font-sans-bold text-neutral-white">Done</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onStartEditing}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${isMorning ? 'morning' : 'night'} routine`}
            className={`rounded-button px-4 py-1.5 active:opacity-75 ${isMorning ? 'bg-secondary' : 'bg-neutral-offwhite'
              }`}
          >
            <Text
              className={`text-caption font-sans-bold ${isMorning ? 'text-neutral-white' : 'text-text'
                }`}
            >
              EDIT
            </Text>
          </Pressable>
        )}
      </View>

      {/* Steps List Body */}
      <View className="bg-neutral-white px-4 py-3.5">
        <View>
          {displayedSteps.map((step, index) => {
            const hasProduct = Boolean(step.product);
            const displayStepNumber = index + 1;
            const categoryImageSource = getProductCategoryImage(
              step.product?.category || step.step_name
            );

            return (
              <View key={step.id} className="flex-row items-start">
                {/* Centered Timeline Column: Solid Light Green Circle & Continuous Lines stopping at last circle */}
                <View className="w-8 items-center relative self-stretch mr-2.5">
                  {/* Continuous Timeline Line logic:
                      - First row: starts at circle center (top-4) down to bottom
                      - Middle rows: continuous uninterrupted line from top-0 to bottom-0
                      - Last row: starts at top-0 and terminates at circle center (h-4)
                  */}
                  {index === 0 && displayedSteps.length > 1 ? (
                    <View className="absolute top-4 bottom-0 w-[1.5px] bg-border" />
                  ) : index > 0 && index < displayedSteps.length - 1 ? (
                    <View className="absolute top-0 bottom-0 w-[1.5px] bg-border" />
                  ) : index === displayedSteps.length - 1 && displayedSteps.length > 1 ? (
                    <View className="absolute top-0 h-4 w-[1.5px] bg-border" />
                  ) : null}

                  {/* Solid Light Green Circle Badge without outline (Opaque so lines are not see-through, aligned with step title) */}
                  <View className="z-10 mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-note-positive shadow-xs">
                    <Text className="text-caption font-sans-bold text-primary">
                      {displayStepNumber}
                    </Text>
                  </View>
                </View>

                {/* Step Content */}
                <View className="flex-1 pb-3.5">
                  {/* Step Title Row */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      {isEditing ? (
                        <Pressable
                          onPress={() => setCategoryPickerStepId(step.id)}
                          className="flex-row items-center self-start rounded-badge bg-primary/10 px-2.5 py-0.5 active:opacity-70"
                        >
                          <Text className="text-body-sm font-sans-bold text-primary">
                            {step.step_name} ▾
                          </Text>
                        </Pressable>
                      ) : (
                        <Text className="text-body font-sans-bold text-text">
                          {step.step_name}
                        </Text>
                      )}
                      <Text className="mt-0.5 text-caption font-sans text-muted">
                        {step.description}
                      </Text>
                    </View>

                    {/* In Edit Mode: Reorder & Delete controls */}
                    {isEditing ? (
                      <View className="flex-row items-center gap-1.5 ml-2">
                        {/* Move Up */}
                        <Pressable
                          disabled={index === 0}
                          onPress={() => handleMoveUp(index)}
                          className="p-1 active:opacity-60 disabled:opacity-20"
                          accessibilityLabel="Move step up"
                        >
                          <ChevronUp size={18} color={theme.colors.text} />
                        </Pressable>

                        {/* Move Down */}
                        <Pressable
                          disabled={index === displayedSteps.length - 1}
                          onPress={() => handleMoveDown(index)}
                          className="p-1 active:opacity-60 disabled:opacity-20"
                          accessibilityLabel="Move step down"
                        >
                          <ChevronDown size={18} color={theme.colors.text} />
                        </Pressable>

                        {/* Delete Step */}
                        <Pressable
                          onPress={() => handleDeleteStep(step.id)}
                          className="p-1 ml-1 active:opacity-70"
                          accessibilityLabel="Delete step"
                        >
                          <Trash2 size={16} color={theme.colors.error} />
                        </Pressable>
                      </View>
                    ) : null}
                  </View>

                  {/* Product Card: NO solid border lines, compact layout
                      - In Edit Mode: triggers swap product sheet
                      - In Normal Mode: triggers global ProductDetailPage modal
                  */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isEditing
                        ? `Swap ${step.product?.name ?? step.step_name}`
                        : `View details for ${step.product?.name ?? step.step_name}`
                    }
                    onPress={() => {
                      if (isEditing) {
                        onOpenSwapProduct(step.id, step.product_id, step.step_name);
                      } else {
                        const targetProductId = step.product_id || step.product?.id;
                        if (targetProductId) {
                          setViewingProductId(targetProductId);
                        }
                      }
                    }}
                    className="mt-1.5 flex-row items-center rounded-button bg-primary-light/10 p-2 active:opacity-75"
                  >
                    {/* Illustration image per category */}
                    <View className="mr-2.5 h-10 w-10 items-center justify-center overflow-hidden rounded-button bg-white p-1">
                      <Image
                        source={categoryImageSource}
                        contentFit="contain"
                        style={{ width: '100%', height: '100%' }}
                        accessibilityLabel={`${step.step_name} illustration`}
                      />
                    </View>

                    <View className="min-w-0 flex-1 pr-2">
                      <Text
                        className="text-body-sm font-sans-bold text-text"
                        numberOfLines={1}
                      >
                        {step.product?.name ?? 'No product selected'}
                      </Text>
                      <Text
                        className="text-caption font-sans text-muted"
                        numberOfLines={1}
                      >
                        {hasProduct
                          ? [step.product?.brand, step.product?.category]
                            .filter(Boolean)
                            .join(' • ')
                          : 'No product specified'}
                      </Text>
                    </View>

                    {/* Swap Trigger Pill ONLY in Edit Mode */}
                    {isEditing ? (
                      <View className="flex-row items-center rounded-button bg-primary/10 px-2 py-1">
                        <RefreshCw size={12} color={theme.colors.primary} />
                        <Text className="ml-1 text-caption font-sans-semibold text-primary">
                          Swap
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Add Step Button in Edit Mode */}
        {isEditing ? (
          <Pressable
            onPress={handleAddStep}
            accessibilityRole="button"
            accessibilityLabel="Add another routine step"
            className="mt-1 flex-row items-center justify-center rounded-button border border-dashed border-border py-2.5 active:opacity-75"
          >
            <Plus size={16} color={theme.colors.primary} />
            <Text className="ml-1.5 text-body-sm font-sans-semibold text-primary">
              Add Step
            </Text>
          </Pressable>
        ) : null}

        {displayedSteps.length === 0 ? (
          <View className="items-center justify-center py-5">
            <Text className="text-body-sm font-sans text-muted">
              No steps in this routine yet. Tap "EDIT" to add steps.
            </Text>
          </View>
        ) : null}
      </View>

      {/* Skincare Category Picker Modal in Edit Mode (instant display without laggy transition) */}
      <Modal
        visible={categoryPickerStepId !== null}
        transparent
        animationType="none"
        onRequestClose={() => setCategoryPickerStepId(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-[340px] rounded-card bg-card p-5 shadow-xl">
            <View className="mb-3 flex-row items-center justify-between border-b border-border/40 pb-2.5">
              <Text className="text-body font-sans-bold text-text">
                Select Skincare Category
              </Text>
              <Pressable
                onPress={() => setCategoryPickerStepId(null)}
                hitSlop={10}
                className="p-1 active:opacity-70"
              >
                <X size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <View className="gap-2">
              {CANONICAL_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.name}
                  onPress={() => handleSelectCategory(cat.name, cat.desc)}
                  className="flex-row items-center rounded-button bg-neutral-offwhite/70 p-3 active:opacity-75"
                >
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-button bg-secondary/15 p-1">
                    <Image
                      source={getProductCategoryImage(cat.name)}
                      contentFit="contain"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-sm font-sans-bold text-text">
                      {cat.name}
                    </Text>
                    <Text className="text-caption font-sans text-muted" numberOfLines={1}>
                      {cat.desc}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Global Shared Product Detail Page Modal */}
      {viewingProductId ? (
        <ProductDetailPage
          visible={Boolean(viewingProductId)}
          productId={viewingProductId}
          onClose={() => setViewingProductId(null)}
        />
      ) : null}
    </View>
  );
}
