import { theme } from '@/shared/theme';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import { useRoutine } from '../viewmodel/useRoutine';
import { RoutineRationaleCard } from './components/RoutineRationaleCard';
import { RoutineSkinProfileCard } from './components/RoutineSkinProfileCard';
import { SwapProductSheet } from './components/SwapProductSheet';
import { S1EmptyRoutine } from './containers/s1_EmptyRoutine';
import { S2RoutineSteps } from './containers/s2_RoutineSteps';

export function RoutinePage() {
  const router = useRouter();
  const routineState = useRoutine();
  const isLoadingRoutine = routineState.isRoutineLoading;
  const canGenerate = routineState.skinProfile !== null && !routineState.isSkinProfileLoading && !routineState.profileError;

  return (
    <View className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" />
      {isLoadingRoutine ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.white} />
          <Text className="mt-3 text-body-sm font-sans text-neutral-white">Loading your routine...</Text>
        </View>
      ) : routineState.routineError && !routineState.routine ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text accessibilityRole="alert" className="mb-4 text-center text-body-sm font-sans text-neutral-white">{routineState.routineError}</Text>
          <Pressable onPress={routineState.actions.retryRoutine} accessibilityRole="button" className="rounded-button bg-secondary px-5 py-3 active:opacity-80">
            <Text className="text-label font-sans-bold text-text">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-4 pb-28 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={routineState.isRefreshing}
              onRefresh={routineState.actions.refresh}
              tintColor={theme.colors.white}
              colors={[theme.colors.primary]}
            />
          }
        >
          {routineState.routine ? (
            <>
              <RoutineSkinProfileCard
                profile={routineState.skinProfile}
                isLoading={routineState.isSkinProfileLoading}
                error={routineState.profileError}
                onRetry={routineState.actions.retryProfile}
                onStartScan={() => router.push('/(tabs)/scan')}
              />
              <S2RoutineSteps
                routine={routineState.routine}
                onEdit={routineState.actions.openStepEditor}
              />
              <RoutineRationaleCard
                rationale={routineState.routine.rationale}
                skinProfile={routineState.skinProfile}
              />
              <SwapProductSheet
                visible={routineState.selectedTimeOfDay !== null}
                timeOfDay={routineState.selectedTimeOfDay}
                steps={routineState.routine.steps}
                selectedStepId={routineState.selectedStepId}
                products={routineState.productOptions}
                search={routineState.productSearch}
                isLoading={routineState.isProductOptionsLoading}
                isFetchingMore={routineState.isFetchingMoreProducts}
                hasMore={routineState.hasMoreProducts}
                isSaving={routineState.isUpdatingStep}
                error={routineState.updateError ?? routineState.productOptionsError}
                onClose={routineState.actions.closeStepEditor}
                onSelectStep={routineState.actions.selectStep}
                onSearchChange={routineState.actions.setProductSearch}
                onLoadMore={routineState.actions.loadMoreProducts}
                onRetry={routineState.actions.retryProductOptions}
                onSave={routineState.actions.updateStep}
              />
            </>
          ) : (
            <S1EmptyRoutine
              skinProfile={routineState.skinProfile}
              isSkinProfileLoading={routineState.isSkinProfileLoading}
              profileError={routineState.profileError}
              isGenerating={routineState.isGenerating}
              generationError={routineState.generationError}
              canGenerate={canGenerate}
              onRetryProfile={routineState.actions.retryProfile}
              onStartScan={() => router.push('/(tabs)/scan')}
              onGenerate={routineState.actions.generate}
              onDismissGenerationError={routineState.actions.clearGenerationError}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

export default RoutinePage;