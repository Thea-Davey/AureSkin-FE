import React, { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { theme } from '@/shared/theme';
import { DeleteDialog } from '@/shared/components';
import { useAppStore } from '@/shared/store/appStore';
import { useRoutine } from '../viewmodel/useRoutine';
import { DeleteRoutineDialog } from './components/DeleteRoutineDialog';
import { DiscardRoutineDialog } from './components/DiscardRoutineDialog';
import { NewSkinAnalysisDetectedDialog } from './components/NewSkinAnalysisDetectedDialog';
import { PopUpOptionPanel } from './components/PopUpOptionPanel';
import { PopUpSwapProductPanel } from './components/PopUpSwapProductPanel';
import { S1EmptyRoutine } from './containers/s1_EmptyRoutine';
import { S2RoutineSteps } from './containers/s2_RoutineSteps';

export function RoutinePage() {
  const router = useRouter();
  const routineState = useRoutine();

  useFocusEffect(
    useCallback(() => {
      routineState.checkNewAnalysisOnFocus();
    }, [routineState.checkNewAnalysisOnFocus])
  );

  const isLoadingRoutine = routineState.isRoutineLoading;
  const canGenerate =
    routineState.skinProfile !== null &&
    !routineState.isSkinProfileLoading &&
    !routineState.profileError;

  return (
    <View className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" />

      {isLoadingRoutine ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.white} />
          <Text className="mt-3 text-body-sm font-sans text-neutral-white">
            Loading your routine...
          </Text>
        </View>
      ) : routineState.routineError && !routineState.routine ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            accessibilityRole="alert"
            className="mb-4 text-center text-body-sm font-sans text-neutral-white"
          >
            {routineState.routineError}
          </Text>
          <Pressable
            onPress={routineState.actions.retryRoutine}
            accessibilityRole="button"
            className="rounded-button bg-secondary px-5 py-3 active:opacity-80"
          >
            <Text className="text-label font-sans-bold text-neutral-white">Retry</Text>
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
            <S2RoutineSteps
              routine={routineState.routine}
              skinProfile={routineState.skinProfile}
              activeTimeOfDay={routineState.activeTimeOfDay}
              isEditing={routineState.isEditing}
              displayedSteps={routineState.displayedSteps}
              onToggleTimeOfDay={routineState.setActiveTimeOfDay}
              onOpenMenu={routineState.openSkinProfileMenu}
              onStartEditing={routineState.startEditing}
              onCancelEditing={routineState.cancelEditing}
              onSaveEditing={routineState.saveEditing}
              onOpenSwapProduct={routineState.openSwapProduct}
              onMoveUp={routineState.moveStepUp}
              onMoveDown={routineState.moveStepDown}
              onDeleteStep={routineState.deleteStep}
              onAddStep={routineState.addStep}
              onSelectCategory={routineState.updateStepCategory}
            />
          ) : (
            <S1EmptyRoutine
              skinProfile={routineState.skinProfile}
              isSkinProfileLoading={routineState.isSkinProfileLoading}
              profileError={routineState.profileError}
              isGenerating={routineState.isGenerating}
              generationError={routineState.generationError}
              canGenerate={canGenerate}
              onRetryProfile={routineState.actions.retryProfile}
              onStartScan={() => useAppStore.getState().openScanOverlay()}
              onGenerate={routineState.actions.generate}
              onDismissGenerationError={routineState.actions.clearGenerationError}
            />
          )}
        </ScrollView>
      )}

      {/* Routine Options Pop-up Panel (triggered by "···" on skin profile) */}
      <PopUpOptionPanel
        visible={routineState.showSkinProfileMenu}
        onClose={routineState.closeSkinProfileMenu}
        onGenerateNewRoutine={routineState.openDeleteRoutineDialog}
        onDeleteCurrentRoutine={routineState.openDeleteCurrentRoutineDialog}
      />

      {/* 1. Generate / Replace Routine Confirmation Dialog (Image 7) */}
      <DeleteRoutineDialog
        visible={routineState.showDeleteRoutineDialog}
        onKeepRoutine={routineState.closeDeleteRoutineDialog}
        onConfirmDelete={routineState.actions.generate}
      />

      {/* 2. Delete Current Routine Confirmation Dialog (Resets to Empty Routine) */}
      <DeleteDialog
        visible={routineState.showDeleteCurrentRoutineDialog}
        title="Delete Current Routine"
        body="Are you sure you want to delete your current routine? This will permanently delete your Morning and Night regimens and return your profile to the initial routine setup."
        boldPhrase="delete your current routine"
        cancelLabel="Keep Routine"
        confirmLabel="Delete Routine"
        onCancel={routineState.closeDeleteCurrentRoutineDialog}
        onConfirm={routineState.actions.deleteCurrentRoutine}
        onClose={routineState.closeDeleteCurrentRoutineDialog}
      />

      {/* New Skin Analysis Detected Notification Dialog (Image 6) */}
      <NewSkinAnalysisDetectedDialog
        visible={routineState.showNewAnalysisDialog}
        onKeepCurrentRoutine={routineState.dismissNewAnalysisDialog}
        onGenerateNewRoutine={routineState.confirmNewAnalysisRoutine}
      />

      {/* Discard Unsaved Changes Confirmation Dialog */}
      <DiscardRoutineDialog
        visible={routineState.showDiscardDialog}
        onKeepEditing={routineState.cancelDiscard}
        onDiscard={routineState.confirmDiscard}
      />

      {/* Swap Product Bottom Sheet */}
      <PopUpSwapProductPanel
        visible={routineState.swapSheetVisible}
        stepName={routineState.swappingStepName}
        currentProductId={routineState.swappingProductId}
        products={routineState.productOptions}
        search={routineState.productSearch}
        isLoading={routineState.isProductOptionsLoading}
        onClose={routineState.closeSwapProduct}
        onSearchChange={routineState.setProductSearch}
        onSelectProduct={routineState.selectProductForStep}
      />
    </View>
  );
}

export default RoutinePage;
