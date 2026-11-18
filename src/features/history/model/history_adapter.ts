import { HistoryDetail } from './history_types';
import { ScanResult, SkinType, ShotType } from '@/features/scan/model/scan_types';

const VALID_SKIN_TYPES: Set<SkinType> = new Set([
  'normal',
  'oily',
  'dry',
  'combination',
  'acneprone',
]);

/**
 * Maps a historical scan detail model (HistoryDetail) to the canonical ScanResult
 * interface required by the shared scan result components (@/shared/pages/scan_results).
 */
export function historyDetailToScanResult(detail: HistoryDetail): ScanResult {
  const rawType = (detail.skin_type || 'normal').toLowerCase().replace(/[\s_-]+/g, '') as SkinType;
  const skinType: SkinType = VALID_SKIN_TYPES.has(rawType) ? rawType : 'normal';

  return {
    id: detail.id,
    user_id: 'current_user',
    image_url: detail.image_url || '',
    skin_type: skinType,
    skin_type_confidence: detail.skin_type_confidence ?? 90,
    skin_type_description: detail.skin_type_description ?? undefined,
    health_score: detail.health_score ?? 0,
    summary: detail.summary || '',
    conditions: (detail.conditions || []).map((c) => ({
      id: c.id,
      name: c.name,
      display_name: c.display_name,
      confidence: c.confidence ?? 85,
      description: c.description || '',
      symptoms: c.symptoms ?? undefined,
      causes: c.causes ?? undefined,
    })),
    compatible_ingredients: (detail.compatible_ingredients || []).map((item) => ({
      id: item.id || item.name,
      ingredient_id: item.ingredient_id || item.id || item.name,
      name: item.name,
      reason: item.reason || 'Pairs favorably with your skin barrier profile.',
    })),
    incompatible_pairs: (detail.incompatible_pairs || []).map((pair) => ({
      ingredient_a: pair.ingredient_a,
      ingredient_b: pair.ingredient_b,
      reason:
        pair.reason ||
        'Using these active ingredients together may cause irritation, peeling, or compromise the skin barrier.',
      subtitle: 'Do not use at the same time as:',
      incompatible_with: [pair.ingredient_b],
      guidance: 'Alternate routine usage across different mornings/evenings.',
    })),
    filtered_ingredients: (detail.filtered_ingredients || []).map((item) => ({
      id: item.id || item.ingredient_id || item.name,
      ingredient_id: item.ingredient_id || item.id || item.name,
      name: item.name,
      filter_type: item.filter_type || 'allergen',
      reason: item.reason || '',
      details: item.details ?? undefined,
    })),
    shot_type: (detail.shot_type as ShotType) || 'single',
    image_urls: detail.image_urls || undefined,
    created_at: detail.created_at,
  };
}

