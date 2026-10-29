import { theme } from '@/shared/theme';
import { useRouter } from 'expo-router';
import { AlertCircle, RotateCw } from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRoutine } from '../viewmodel/useRoutine';
import { GeneratedRoutineSummary } from './components/GeneratedRoutineSummary';
import { RoutineLoadingState } from './components/RoutineLoadingState';
import { S1EmptyRoutine } from './containers/s1_EmptyRoutine';

export function RoutinePage() {
  const router = useRouter();
  const {
    skinProfile,
    routine,
    screenState,
    errorMessage,
    isGenerating,
    isRefreshing,
    onGenerate,
    onRetry,
    onRefresh,
  } = useRoutine();

  if (screenState === 'loading') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <RoutineLoadingState />
      </ScrollView>
    );
  }

  if (screenState === 'error') {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <AlertCircle color={theme.colors.error} size={32} />
        <Text className="mt-3 text-center text-h3 font-sans-bold text-text">
          We couldn't load your routine
        </Text>
        <Text className="mt-2 text-center text-body-sm font-sans text-muted">
          Check your connection and try again.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading routine"
          onPress={() => void onRetry()}
          className="mt-5 min-h-11 flex-row items-center justify-center rounded-button bg-primary px-5 active:opacity-80"
        >
          <RotateCw color={theme.colors.white} size={17} />
          <Text className="ml-2 text-label font-sans-bold text-neutral-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {screenState === 'active' && routine ? (
        <View className="gap-4 px-4 pb-8 pt-4">
          <GeneratedRoutineSummary routine={routine} />
        </View>
      ) : (
        <S1EmptyRoutine
          profile={skinProfile}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          onGenerate={onGenerate}
          onScanPress={() => router.push('/(tabs)/scan')}
        />
      )}
    </ScrollView>
  );
}

export default RoutinePage;