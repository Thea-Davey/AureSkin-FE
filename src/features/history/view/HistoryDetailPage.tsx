import { theme } from '@/shared/theme';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryDetail } from '../viewmodel/useHistoryDetail';
import { HistoryDetailHeader, HistoryDetailTab } from './components/HistoryDetailHeader';
import { HistoryDetailStatus, S1HistoryResults } from './containers/s1_HistoryResults';
import { S2HistoryCompatibility } from './containers/s2_HistoryCompatibility';

interface HistoryDetailPageProps {
  id: string;
}

export function HistoryDetailPage({ id }: HistoryDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HistoryDetailTab>('results');
  const previousTab = useRef(activeTab);
  const tabTransition = useRef(new Animated.Value(0)).current;
  const historyDetail = useHistoryDetail(id);
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/history');
  };

  useEffect(() => {
    if (previousTab.current === activeTab) return;

    tabTransition.setValue(activeTab === 'compatibility' ? 24 : -24);
    const animation = Animated.timing(tabTransition, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    previousTab.current = activeTab;

    return () => animation.stop();
  }, [activeTab, tabTransition]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View className="flex-1 bg-neutral-offwhite">
        <HistoryDetailHeader
          createdAt={historyDetail.detail?.created_at ?? null}
          activeTab={activeTab}
          onBack={goBack}
          onSelectTab={setActiveTab}
        />
        {historyDetail.detail ? (
          <Animated.View className="flex-1" style={{ transform: [{ translateX: tabTransition }] }}>
            {activeTab === 'results' ? (
              <S1HistoryResults
                detail={historyDetail.detail}
                isRefreshing={historyDetail.isRefreshing}
                onRefresh={historyDetail.refresh}
              />
            ) : (
              <S2HistoryCompatibility
                compatibleIngredients={historyDetail.detail.compatible_ingredients}
                incompatiblePairs={historyDetail.detail.incompatible_pairs}
                refreshError={historyDetail.error}
                isRefreshing={historyDetail.isRefreshing}
                onRefresh={historyDetail.refresh}
                onRetry={historyDetail.retry}
              />
            )}
          </Animated.View>
        ) : (
          <HistoryDetailStatus
            isLoading={historyDetail.isLoading && Boolean(id)}
            error={id ? historyDetail.error : 'A scan ID is required to view these results.'}
            onRetry={historyDetail.retry}
            onBack={goBack}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default HistoryDetailPage;