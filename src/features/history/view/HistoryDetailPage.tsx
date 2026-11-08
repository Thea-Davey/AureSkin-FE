import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeleteDialog } from '@/shared/components/DeleteDialog';
import { deleteHistoryEntry } from '../model/history_api';
import { useHistoryDetail } from '../viewmodel/useHistoryDetail';
import { HistoryDetailHeader, HistoryDetailTab } from './components/HistoryDetailHeader';
import { HistoryDetailStatus, S1HistoryResults } from './containers/s1_HistoryResults';
import { S2HistoryCompatibility } from './containers/s2_HistoryCompatibility';
import { PopUpScanActionPanel } from './components/PopUpScanActionPanel';

interface HistoryDetailPageProps {
  id: string;
}

export function HistoryDetailPage({ id }: HistoryDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HistoryDetailTab>('results');
  const [isActionPanelVisible, setIsActionPanelVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const previousTab = useRef(activeTab);
  const tabTransition = useRef(new Animated.Value(0)).current;
  const historyDetail = useHistoryDetail(id);

  // Preserve last loaded detail during route transitions to prevent white screen flashes on pop
  const lastDetailRef = useRef(historyDetail.detail);
  if (historyDetail.detail) {
    lastDetailRef.current = historyDetail.detail;
  }
  const currentDetail = historyDetail.detail ?? lastDetailRef.current;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/history');
  };

  const handleConfirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    if (!id) return;
    try {
      await deleteHistoryEntry(id);
    } catch {
      // Continue navigating back even if deletion failed or was mocked
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
      <StatusBar style="light" />
      <View className="flex-1 bg-background">
        <HistoryDetailHeader
          createdAt={currentDetail?.created_at ?? null}
          activeTab={activeTab}
          onBack={goBack}
          onSelectTab={setActiveTab}
          onMorePress={() => setIsActionPanelVisible(true)}
        />

        {currentDetail ? (
          <Animated.View className="flex-1" style={{ transform: [{ translateX: tabTransition }] }}>
            {activeTab === 'results' ? (
              <S1HistoryResults
                detail={currentDetail}
                isRefreshing={historyDetail.isRefreshing}
                onRefresh={historyDetail.refresh}
              />
            ) : (
              <S2HistoryCompatibility
                detail={currentDetail}
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

      {/* 3-Dot Scan Action Panel */}
      <PopUpScanActionPanel
        visible={isActionPanelVisible}
        onClose={() => setIsActionPanelVisible(false)}
        onDeletePress={() => setIsDeleteDialogOpen(true)}
      />

      {/* Discard / Delete Confirmation Dialog */}
      <DeleteDialog
        visible={isDeleteDialogOpen}
        title="Delete Scan Record"
        body="Are you sure you want to delete this scan record? This action cannot be undone."
        boldPhrase="delete this scan record"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </SafeAreaView>
  );
}

export default HistoryDetailPage;
