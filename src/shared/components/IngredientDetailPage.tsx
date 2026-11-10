import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, X } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { theme } from '../theme';
import {
  Ingredient,
  IngredientCompatibilityStatus,
} from '../../features/library/model/library_types';
import { IngredientDetailSkeleton } from '../../features/library/view/components/IngredientDetailSkeleton';
import { CompatibilityBadge } from './CompatibilityBadge';
import { CompatibleNote } from '../../features/library/view/components/CompatibleNote';
import { DescriptionCard } from '../../features/library/view/components/DescriptionCard';
import { useIngredientDetail } from '../../features/library/viewmodel/useIngredientDetail';
import { cleanIngredientDescription } from '../../features/library/model/library_api';
import { CloseButton } from './CloseButton';

const CAUTION_DESCRIPTIONS: Record<string, string> = {
  'related allergy': 'Individuals with known sensitivities or allergic reactions to this ingredient or related botanical/chemical compounds should avoid use.',
  'sensitive': 'May cause irritation, redness, or stinging on reactive or sensitive skin. Patch test before applying to facial areas.',
  'impaired skin barrier': 'Avoid using on compromised, peeling, or actively inflamed skin barriers until the natural moisture barrier has recovered.',
  'dry dehydrated': 'May exert an astringent or drying effect on moisture-depleted skin; ensure sufficient barrier hydration if used.',
  'dry and dehydrated skin': 'May exert an astringent or drying effect on moisture-depleted skin; ensure sufficient barrier hydration if used.',
  'oily': 'Can be comedogenic or overly occlusive for sebum-rich, congestion-prone skin profiles.',
  'gluten allergy': 'Contains wheat-derived components or processing traces that may trigger reactions in individuals with celiac disease or gluten allergies.',
  'gluten allery': 'Contains wheat-derived components or processing traces that may trigger reactions in individuals with celiac disease or gluten allergies.',
  'pregnancy': 'Contraindicated or advised against during pregnancy and lactation; consult with a physician prior to topical use.',
};

function formatSkinTypeLabel(raw: string): string {
  const norm = raw.trim().toLowerCase();
  if (norm === 'all') return 'All skin types';
  if (norm === 'acneprone' || norm === 'acne-prone' || norm === 'acne prone') return 'Acne-Prone skin';
  return `${norm.charAt(0).toUpperCase()}${norm.slice(1)} skin`;
}

function formatConditionLabel(raw: string): string {
  const clean = raw.trim().replace(/_/g, ' ').toLowerCase();
  return clean
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface IngredientDetailPageProps {
  visible: boolean;
  onClose: () => void;
  // Option A: Standalone mode (just provide ingredientId)
  ingredientId?: string | null;

  // Option B: Controlled mode (provide ingredient & state)
  ingredient?: Ingredient;
  isLoading?: boolean;
  error?: string | null;
  compatibilityStatus?: IngredientCompatibilityStatus;
  compatibilityError?: string | null;
  isCompatibilityLoading?: boolean;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  isTogglingFavorite?: boolean;
  favoriteError?: string | null;
  onRetry?: () => void;
  onRetryCompatibility?: () => void;
  onToggleFavorite?: () => void;
}

interface InternalIngredientDetailViewProps {
  visible: boolean;
  ingredient?: Ingredient;
  isLoading: boolean;
  error: string | null;
  compatibilityStatus: IngredientCompatibilityStatus;
  compatibilityError: string | null;
  isCompatibilityLoading: boolean;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  isTogglingFavorite: boolean;
  favoriteError: string | null;
  onClose: () => void;
  onRetry: () => void;
  onRetryCompatibility: () => void;
  onToggleFavorite: () => void;
}

function IngredientDetailView({
  visible,
  ingredient,
  isLoading,
  error,
  compatibilityStatus,
  compatibilityError,
  isCompatibilityLoading,
  isFavorite,
  isFavoriteLoading,
  isTogglingFavorite,
  favoriteError,
  onClose,
  onRetry,
  onRetryCompatibility,
  onToggleFavorite,
}: InternalIngredientDetailViewProps) {
  const canShowDetail = Boolean(ingredient) && !isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-primary">
        <SafeAreaView edges={['top']} className="bg-primary">
          <View className="h-16 flex-row items-center justify-end px-5">
            <CloseButton
              onPress={onClose}
              iconSize={24}
              accessibilityLabel="Close ingredient details"
            />
          </View>
        </SafeAreaView>

        <SafeAreaView
          edges={['bottom']}
          className="flex-1 overflow-hidden rounded-t-card bg-card"
        >
          {isLoading ? (
            <ScrollView
              className="flex-1"
              contentContainerClassName="pt-5"
              showsVerticalScrollIndicator={false}
            >
              <IngredientDetailSkeleton />
            </ScrollView>
          ) : error || !ingredient ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="mb-2 text-h3 font-sans-bold text-text">
                Unable to load ingredient
              </Text>
              <Text className="mb-5 text-center text-body-sm font-sans text-muted">
                {error ?? 'This ingredient could not be found.'}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={onClose}
                  className="rounded-button border border-border px-5 py-3 active:opacity-80"
                >
                  <Text className="text-label font-sans-semibold text-text">Close</Text>
                </Pressable>
                {error ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={onRetry}
                    className="rounded-button bg-primary px-5 py-3 active:opacity-80"
                  >
                    <Text className="text-label font-sans-semibold text-neutral-white">
                      Retry
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : canShowDetail ? (
            <>
              <View className="border-b border-border px-5 py-4">
                {/* Row 1: [Col 1: Label text "Ingredient Name"] [Col 2: Top-aligned CompatibilityBadge + Favorite Button] */}
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-body-sm font-sans-medium text-muted">
                    Ingredient
                  </Text>

                  {/* Col 2: Top-aligned Compatibility Badge + Favorite Star */}
                  <View className="flex-row items-center gap-2 self-start">
                    <CompatibilityBadge
                      status={compatibilityStatus}
                      isLoading={isCompatibilityLoading}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${isFavorite ? 'Remove' : 'Add'} ${ingredient.name} ${isFavorite ? 'from' : 'to'} favorites`}
                      accessibilityState={{
                        selected: isFavorite,
                        disabled: isFavoriteLoading || isTogglingFavorite,
                      }}
                      disabled={isFavoriteLoading || isTogglingFavorite}
                      onPress={onToggleFavorite}
                      hitSlop={8}
                      className="p-1 active:opacity-70"
                    >
                      <Animated.View key={String(isFavorite)} entering={ZoomIn.duration(160)}>
                        <Star
                          size={22}
                          color={isFavorite ? theme.colors.secondary : theme.colors.text}
                          fill={isFavorite ? theme.colors.secondary : 'transparent'}
                        />
                      </Animated.View>
                    </Pressable>
                  </View>
                </View>

                {/* Row 2: Actual name of the ingredient (Full width, not truncated) */}
                <Text className="mt-1 text-h2 font-sans-bold text-text">
                  {ingredient.name}
                </Text>
              </View>

              <ScrollView
                className="flex-1"
                contentContainerClassName="px-5 pb-8 pt-4"
                showsVerticalScrollIndicator={false}
              >
                {compatibilityError ? (
                  <View className="mb-4 rounded-button border border-status-warning/40 bg-status-warning/10 p-3">
                    <Text className="mb-2 text-caption font-sans text-text">
                      Compatibility could not be checked. The status has not been assumed.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={onRetryCompatibility}
                      className="self-start rounded-button bg-card px-3 py-2 active:opacity-80"
                    >
                      <Text className="text-caption font-sans-semibold text-primary">
                        Retry compatibility
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {/* 1. Intro Description (Filtered to 1 clean paragraph without boilerplate) */}
                {(() => {
                  const cleaned = cleanIngredientDescription(ingredient.description ?? ingredient.short_description);
                  return cleaned ? (
                    <Text className="mb-4 text-body-sm font-sans text-muted leading-relaxed">
                      {cleaned}
                    </Text>
                  ) : null;
                })()}

                {/* 2. What is it? */}
                {ingredient.what_is_it?.trim() ? (
                  <DescriptionCard
                    title="What is it?"
                    variant="description"
                    description={ingredient.what_is_it}
                  />
                ) : null}

                {/* 3. What is it good for? (Benefits from Supabase) */}
                {(ingredient.benefits?.trim() || ingredient.what_does_it_do?.trim()) ? (
                  <DescriptionCard
                    title="What is it good for?"
                    variant="description"
                    description={ingredient.benefits?.trim() || ingredient.what_does_it_do?.trim()}
                  />
                ) : null}

                {/* 4. Compatible Skin Types (Green dot bullet) */}
                {ingredient.skin_types && ingredient.skin_types.length > 0 ? (
                  <DescriptionCard
                    title="Compatible Skin Types"
                    variant="bulleted"
                    bulletTone="positive"
                    bullets={ingredient.skin_types.map(formatSkinTypeLabel)}
                  />
                ) : null}

                {/* 5. Target Skin Conditions (Red dot bullet) */}
                {ingredient.skin_conditions && ingredient.skin_conditions.length > 0 ? (
                  <DescriptionCard
                    title="Target Skin Conditions"
                    variant="bulleted"
                    bulletTone="negative"
                    bullets={ingredient.skin_conditions.map(formatConditionLabel)}
                  />
                ) : null}

                {/* 6. Who should avoid? (Red bullet dot + Caution containers for matching triggers) */}
                {(() => {
                  const rawAvoid = ingredient.avoid?.length
                    ? ingredient.avoid
                    : typeof ingredient.who_should_avoid === 'string'
                      ? ingredient.who_should_avoid.split(',').map((s) => s.trim()).filter(Boolean)
                      : [];
                  const avoidList = rawAvoid.map((item) => item.replace(/[\[\]'"]/g, '').trim()).filter(Boolean);

                  if (avoidList.length === 0 && !ingredient.caution?.trim()) {
                    return null;
                  }

                  return (
                    <DescriptionCard
                      title="Who should avoid?"
                      variant="description"
                    >
                      {avoidList.map((item, index) => {
                        const normKey = item.toLowerCase().trim();
                        const matchedCaution =
                          CAUTION_DESCRIPTIONS[normKey] ??
                          Object.entries(CAUTION_DESCRIPTIONS).find(([k]) => normKey.includes(k) || k.includes(normKey))?.[1];

                        return (
                          <View key={`${item}-${index}`} className="mb-3">
                            <View className="flex-row items-center gap-2.5">
                              <View className="h-2 w-2 rounded-full bg-status-error shrink-0" />
                              <Text className="flex-1 text-body-sm font-sans-bold text-text">
                                {item}
                              </Text>
                            </View>
                            {matchedCaution ? (
                              <View className="mt-1.5 ml-4 rounded-button border border-note-warning-border bg-note-warning p-3">
                                <Text className="text-caption font-sans-bold text-note-warning-title">
                                  Caution
                                </Text>
                                <Text className="mt-0.5 text-body-sm font-sans text-text leading-5">
                                  {matchedCaution}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        );
                      })}

                      {ingredient.caution?.trim() && !avoidList.some((item) => CAUTION_DESCRIPTIONS[item.toLowerCase().trim()]) ? (
                        <View className="mt-2 rounded-button border border-note-warning-border bg-note-warning p-3">
                          <Text className="text-caption font-sans-bold text-note-warning-title">
                            Caution
                          </Text>
                          <Text className="mt-0.5 text-body-sm font-sans text-text leading-5">
                            {ingredient.caution}
                          </Text>
                        </View>
                      ) : null}
                    </DescriptionCard>
                  );
                })()}

                {/* 7. Compatible Note */}
                {compatibilityStatus === 'compatible' ? (
                  <CompatibleNote className="mt-1" />
                ) : null}

                {favoriteError ? (
                  <View
                    accessibilityRole="alert"
                    className="mb-3 rounded-button border border-status-error/30 bg-status-error/10 p-3"
                  >
                    <Text className="text-body-sm font-sans-medium text-status-error">
                      {favoriteError}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>
            </>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function IngredientDetailSelfFetching({
  ingredientId,
  visible,
  onClose,
}: {
  ingredientId: string;
  visible: boolean;
  onClose: () => void;
}) {
  const detail = useIngredientDetail(ingredientId);

  return (
    <IngredientDetailView
      visible={visible}
      ingredient={detail.ingredient}
      isLoading={detail.isLoading}
      error={detail.error}
      compatibilityStatus={detail.compatibilityStatus}
      compatibilityError={detail.compatibilityError}
      isCompatibilityLoading={detail.isCompatibilityLoading}
      isFavorite={detail.isFavorite}
      isFavoriteLoading={detail.isFavoriteLoading}
      isTogglingFavorite={detail.isTogglingFavorite}
      favoriteError={detail.favoriteError}
      onClose={onClose}
      onRetry={() => void detail.actions.retry()}
      onRetryCompatibility={() => void detail.actions.retryCompatibility()}
      onToggleFavorite={detail.actions.toggleFavorite}
    />
  );
}

export function IngredientDetailPage(props: IngredientDetailPageProps) {
  if (props.ingredient !== undefined || !props.ingredientId) {
    return (
      <IngredientDetailView
        visible={props.visible}
        ingredient={props.ingredient}
        isLoading={props.isLoading ?? false}
        error={props.error ?? null}
        compatibilityStatus={props.compatibilityStatus ?? 'unavailable'}
        compatibilityError={props.compatibilityError ?? null}
        isCompatibilityLoading={props.isCompatibilityLoading ?? false}
        isFavorite={props.isFavorite ?? false}
        isFavoriteLoading={props.isFavoriteLoading ?? false}
        isTogglingFavorite={props.isTogglingFavorite ?? false}
        favoriteError={props.favoriteError ?? null}
        onClose={props.onClose}
        onRetry={props.onRetry ?? (() => { })}
        onRetryCompatibility={props.onRetryCompatibility ?? (() => { })}
        onToggleFavorite={props.onToggleFavorite ?? (() => { })}
      />
    );
  }

  return (
    <IngredientDetailSelfFetching
      ingredientId={props.ingredientId}
      visible={props.visible}
      onClose={props.onClose}
    />
  );
}

