import { S3CompatibilityTab } from '@/shared/pages/scan_results/containers/s3_CompatibilityTab';
import {
  HistoryCompatibleIngredient,
  HistoryDetail,
  HistoryIncompatiblePair,
} from '../../model/history_types';
import { historyDetailToScanResult } from '../../model/history_adapter';

interface HistoryCompatibilityProps {
  detail?: HistoryDetail;
  compatibleIngredients?: HistoryCompatibleIngredient[] | null;
  incompatiblePairs?: HistoryIncompatiblePair[] | null;
  refreshError?: string | null;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onRetry?: () => void;
}

export function S2HistoryCompatibility({
  detail,
  compatibleIngredients,
  incompatiblePairs,
  isRefreshing,
  onRefresh,
}: HistoryCompatibilityProps) {
  const effectiveDetail: HistoryDetail = detail ?? {
    id: 'history-item',
    image_url: null,
    created_at: new Date().toISOString(),
    health_score: 0,
    skin_type: null,
    summary: null,
    skin_type_confidence: null,
    conditions: [],
    compatible_ingredients: compatibleIngredients ?? null,
    incompatible_pairs: incompatiblePairs ?? null,
  };

  const scanResult = historyDetailToScanResult(effectiveDetail);

  return (
    <S3CompatibilityTab
      scanResult={scanResult}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  );
}

export default S2HistoryCompatibility;
