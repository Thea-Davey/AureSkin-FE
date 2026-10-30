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
import { theme } from '../../../../shared/theme';
import {
  Ingredient,
  IngredientCompatibilityStatus,
} from '../../model/library_types';
import { IngredientDetailSkeleton } from './IngredientDetailSkeleton';
import { CompatibilityBadge } from './CompatibilityBadge';
import { CompatibleNote } from './CompatibleNote';
import { DescriptionCard } from './DescriptionCard';

interface IngredientDetailPageProps {
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

export function IngredientDetailPage({
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
}: IngredientDetailPageProps) {
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close ingredient details"
              onPress={onClose}
              hitSlop={10}
              className="rounded-full p-2 active:bg-primary-light"
            >
              <X size={24} color={theme.colors.white} />
            </Pressable>
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
                <Text className="mt-1 text-h2 font-sans-bold text-h3">
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

                {/* 1. Intro Description (softened to text-muted for clean hierarchy) */}
                {ingredient.description?.trim() ? (
                  <Text className="mb-4 text-body-sm font-sans text-muted leading-relaxed">
                    {ingredient.description}
                  </Text>
                ) : null}

                {/* 2. What is it? */}
                {ingredient.what_is_it?.trim() ? (
                  <DescriptionCard
                    title="What is it?"
                    variant="description"
                    description={ingredient.what_is_it}
                  />
                ) : null}

                {/* 3. What does it do? */}
                {ingredient.benefits?.trim() ? (
                  <DescriptionCard
                    title="What does it do?"
                    variant="description"
                    description={ingredient.benefits}
                  />
                ) : null}

                {/* 4. What is it good for? */}
                {(ingredient.good_for?.length || ingredient.skin_types.length) ? (
                  <DescriptionCard
                    title="What is it good for?"
                    variant="bulleted"
                    bulletTone="positive"
                    bullets={
                      ingredient.good_for?.length
                        ? ingredient.good_for
                        : ingredient.skin_types.map((skinType) =>
                          skinType === 'all'
                            ? 'All skin types'
                            : `${skinType.charAt(0).toUpperCase()}${skinType.slice(1)} skin`
                        )
                    }
                  />
                ) : null}

                {/* 5. Who should avoid? */}
                {(ingredient.avoid?.length || ingredient.caution?.trim()) ? (
                  <DescriptionCard
                    title="Who should avoid?"
                    variant="bulleted"
                    bulletTone="negative"
                    bullets={ingredient.avoid?.length ? ingredient.avoid : []}
                  >
                    {ingredient.caution?.trim() ? (
                      <View className="mt-3 rounded-button border border-status-warning/20 bg-status-warning/10 p-3">
                        <Text className="text-caption font-sans-semibold text-note-warning-title">
                          Caution
                        </Text>
                        <Text className="mt-0.5 text-body-sm font-sans text-text">
                          {ingredient.caution}
                        </Text>
                      </View>
                    ) : null}
                  </DescriptionCard>
                ) : null}

                {/* 6. Compatible Note (Personalized takeaway at the bottom) */}
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
