import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeCheck, Star, X } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { theme } from '../../../../shared/theme';
import {
  Ingredient,
  IngredientCompatibilityStatus,
} from '../../model/library_types';
import { IngredientDetailSkeleton } from './IngredientDetailSkeleton';

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

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-3 rounded-card border border-border bg-card p-4 shadow-sm">
      <Text className="mb-2 text-h3 font-sans-bold text-text">{title}</Text>
      {children}
    </View>
  );
}

function DetailBullets({
  items,
  tone,
}: {
  items: string[];
  tone: 'positive' | 'warning';
}) {
  return (
    <View className="gap-2">
      {items.map((item) => (
        <View key={item} className="flex-row items-start gap-2">
          <View
            className={`mt-1.5 h-2 w-2 rounded-full ${
              tone === 'positive' ? 'bg-accent' : 'bg-status-error'
            }`}
          />
          <Text className="flex-1 text-body-sm font-sans text-text">{item}</Text>
        </View>
      ))}
    </View>
  );
}

function CompatibilityBadge({
  status,
  isLoading,
}: {
  status: IngredientCompatibilityStatus;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <View className="flex-row items-center gap-1 rounded-badge bg-background px-2.5 py-1.5">
        <ActivityIndicator size="small" color={theme.colors.muted} />
        <Text className="text-caption font-sans-medium text-muted">Checking</Text>
      </View>
    );
  }

  if (status === 'compatible') {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel="Compatible with your latest skin analysis"
        className="flex-row items-center gap-1 rounded-badge bg-status-success px-2.5 py-1.5"
      >
        <BadgeCheck size={14} color={theme.colors.white} />
        <Text className="text-caption font-sans-semibold text-neutral-white">
          Compatible
        </Text>
      </View>
    );
  }

  const label = status === 'scan_needed'
    ? 'Scan needed'
    : status === 'unavailable'
      ? 'Not checked'
      : 'Not listed';
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      className="rounded-badge bg-background px-2.5 py-1.5"
    >
      <Text className="text-caption font-sans-medium text-muted">{label}</Text>
    </View>
  );
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
              <View className="flex-row items-center gap-2 border-b border-border px-5 py-4">
                <Text
                  numberOfLines={2}
                  className="min-w-0 flex-1 text-h3 font-sans-semibold text-text"
                >
                  {ingredient.name}
                </Text>
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

                {ingredient.description?.trim() ? (
                  <Text className="mb-4 text-body-sm font-sans text-text">
                    {ingredient.description}
                  </Text>
                ) : null}

                {ingredient.what_is_it?.trim() ? (
                  <DetailCard title="What is it?">
                    <Text className="text-body-sm font-sans text-text">
                      {ingredient.what_is_it}
                    </Text>
                  </DetailCard>
                ) : null}

                {ingredient.benefits?.trim() ? (
                  <DetailCard title="What does it do?">
                    <Text className="text-body-sm font-sans text-text">
                      {ingredient.benefits}
                    </Text>
                  </DetailCard>
                ) : null}

                {(ingredient.good_for?.length || ingredient.skin_types.length) ? (
                  <DetailCard title="What is it good for?">
                    {ingredient.good_for?.length ? (
                      <DetailBullets items={ingredient.good_for} tone="positive" />
                    ) : (
                      <>
                        <Text className="mb-2 text-body-sm font-sans-medium text-text">
                          Suitable skin types
                        </Text>
                        <DetailBullets
                          items={ingredient.skin_types.map((skinType) =>
                            skinType === 'all'
                              ? 'All skin types'
                              : `${skinType.charAt(0).toUpperCase()}${skinType.slice(1)} skin`
                          )}
                          tone="positive"
                        />
                      </>
                    )}
                  </DetailCard>
                ) : null}

                {(ingredient.avoid?.length || ingredient.caution?.trim()) ? (
                  <DetailCard title="Who should avoid?">
                    {ingredient.avoid?.length ? (
                      <DetailBullets items={ingredient.avoid} tone="warning" />
                    ) : (
                      <>
                        <Text className="mb-2 text-caption font-sans-semibold text-muted">
                          Caution
                        </Text>
                        <Text className="text-body-sm font-sans text-text">
                          {ingredient.caution}
                        </Text>
                      </>
                    )}
                    {ingredient.avoid?.length && ingredient.caution?.trim() ? (
                      <Text className="mt-3 text-caption font-sans text-muted">
                        Caution: {ingredient.caution}
                      </Text>
                    ) : null}
                  </DetailCard>
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
