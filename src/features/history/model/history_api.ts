import { api } from '../../../shared/services/api';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { MOCK_HISTORY_DETAILS, MOCK_HISTORY_ENTRIES } from './history_mock';
import {
  HistoryCompatibleIngredient,
  HistoryCondition,
  HistoryDetail,
  HistoryEntry,
  HistoryIncompatiblePair,
  HistoryPage,
  HistoryPageParams,
} from './history_types';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all History screen features (history list,
// pagination, and deletion).
// Set to `false` to fetch real-time live data from FastAPI.
export const USE_MOCK: boolean = isMockEnabled('history');
// ============================================================================

const deletedMockEntryIds = new Set<string>();

interface HistoryConditionItem {
  id?: string;
  name?: string;
  display_name?: string;
  description?: string | null;
  symptoms?: string | null;
  causes?: string | null;
  confidence?: number | null;
  condition?: {
    id?: string;
    name?: string;
    display_name?: string;
    description?: string | null;
    symptoms?: string | null;
    causes?: string | null;
  };
}

interface HistoryResponseItem {
  id: string;
  image_url?: string | null;
  created_at: string;
  health_score?: number | null;
  skin_type?: string | null;
  conditions?: Array<string | HistoryConditionItem> | null;
  analysis_conditions?: HistoryConditionItem[] | null;
}

interface HistoryDetailResponse extends HistoryResponseItem {
  summary?: string | null;
  skin_type_confidence?: number | null;
  skin_type_description?: string | null;
  analysis_compatible_ingredients?: CompatibleIngredientItem[] | null;
  compatible_ingredients?: CompatibleIngredientItem[] | null;
  analysis_incompatible_pairs?: IncompatiblePairItem[] | null;
  incompatible_pairs?: IncompatiblePairItem[] | null;
  filtered_ingredients?: Array<{
    id?: string;
    ingredient_id?: string;
    name?: string;
    filter_type?: string;
    reason?: string;
    details?: string;
  }> | null;
}

interface CompatibleIngredientItem {
  id?: string;
  ingredient_id?: string;
  name?: string;
  reason?: string | null;
  ingredient?: {
    id?: string;
    name?: string;
  } | null;
}

interface IncompatiblePairItem {
  id?: string;
  ingredient_a?: string;
  ingredient_b?: string;
  reason?: string | null;
}

function normalizeEntry(item: HistoryResponseItem): HistoryEntry {
  const conditions = item.conditions?.length ? item.conditions : item.analysis_conditions ?? [];

  return {
    id: item.id,
    image_url: item.image_url ?? null,
    created_at: item.created_at,
    health_score: item.health_score ?? 0,
    skin_type: item.skin_type ?? null,
    conditions: conditions
      .map((condition) => {
        if (typeof condition === 'string') return condition;
        return condition.display_name ?? condition.name ?? condition.condition?.display_name ?? condition.condition?.name ?? '';
      })
      .filter(Boolean),
  };
}

export async function fetchHistoryPage({ limit, offset }: HistoryPageParams): Promise<HistoryPage> {
  if (isMockEnabled('history')) {
    const availableEntries = MOCK_HISTORY_ENTRIES.filter((entry) => !deletedMockEntryIds.has(entry.id));
    const items = availableEntries.slice(offset, offset + limit);
    return {
      items,
      nextOffset: offset + items.length < availableEntries.length ? offset + items.length : null,
    };
  }

  const response = await api.get('/history', { params: { limit, offset } });
  const rawItems = response.data?.data?.items;
  if (!Array.isArray(rawItems)) {
    throw new Error('The history response was not in the expected format.');
  }

  const items = (rawItems as HistoryResponseItem[]).map(normalizeEntry);
  const total = response.data?.data?.total;
  const hasMore =
    typeof total === 'number' ? offset + items.length < total : items.length === limit;

  return {
    items,
    nextOffset: hasMore ? offset + items.length : null,
  };
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  if (isMockEnabled('history')) {
    deletedMockEntryIds.add(id);
    return;
  }

  await api.delete(`/history/${encodeURIComponent(id)}`);
}

function normalizeDetail(item: HistoryDetailResponse): HistoryDetail {
  const rawConditions = item.conditions?.length ? item.conditions : item.analysis_conditions ?? [];
  const conditions: HistoryCondition[] = rawConditions.map((rawCondition, index) => {
    const condition = typeof rawCondition === 'string' ? { display_name: rawCondition } : rawCondition;
    const joinedCondition = condition.condition ?? condition;
    const displayName = joinedCondition.display_name ?? joinedCondition.name ?? condition.display_name ?? condition.name ?? 'Skin concern';

    return {
      id: `${item.id}-condition-${index}`,
      name: joinedCondition.name ?? condition.name ?? displayName,
      display_name: displayName,
      description: null,
      confidence: null,
    };
  });
  const normalizedConditions = conditions.map((condition, index) => {
    const rawCondition = rawConditions[index];
    if (typeof rawCondition === 'string') return condition;
    const joinedCondition = rawCondition.condition ?? rawCondition;
    return {
      ...condition,
      id: rawCondition.id ?? joinedCondition.id ?? condition.id,
      description: joinedCondition.description ?? null,
      symptoms: joinedCondition.symptoms ?? null,
      causes: joinedCondition.causes ?? null,
      confidence: rawCondition.confidence ?? null,
    };
  });
  const rawCompatibleIngredients = item.analysis_compatible_ingredients ?? item.compatible_ingredients;
  const rawIncompatiblePairs = item.analysis_incompatible_pairs ?? item.incompatible_pairs;

  const compatibleIngredients: HistoryCompatibleIngredient[] | null = rawCompatibleIngredients === undefined || rawCompatibleIngredients === null
    ? null
    : rawCompatibleIngredients.map((item, index) => {
      const ingredient = item.ingredient ?? item;
      const name = ingredient.name ?? item.name;
      if (!name) throw new Error('A compatible ingredient was missing its name.');
      const resolvedId = item.id ?? item.ingredient_id ?? ingredient.id;
      return {
        id: resolvedId ?? name,
        ingredient_id: resolvedId,
        name,
        reason: item.reason ?? null,
      };
    });

  const incompatiblePairs: HistoryIncompatiblePair[] | null = rawIncompatiblePairs === undefined || rawIncompatiblePairs === null
    ? null
    : rawIncompatiblePairs.map((item, index) => {
      if (!item.ingredient_a || !item.ingredient_b) {
        throw new Error('An incompatible ingredient pair was missing an ingredient name.');
      }
      return {
        id: item.id ?? `${item.ingredient_a}-${item.ingredient_b}-${index}`,
        ingredient_a: item.ingredient_a,
        ingredient_b: item.ingredient_b,
        reason: item.reason ?? null,
      };
    });

  const rawFiltered = item.filtered_ingredients;
  const filteredIngredients = Array.isArray(rawFiltered)
    ? rawFiltered.map((f: any, index: number) => ({
        id: f.id ?? f.ingredient_id ?? `filtered-${index}`,
        ingredient_id: f.ingredient_id ?? f.id ?? `filtered-${index}`,
        name: f.name ?? 'Filtered Ingredient',
        filter_type: f.filter_type ?? 'allergen',
        reason: f.reason ?? '',
        details: f.details ?? undefined,
      }))
    : [];

  return {
    ...normalizeEntry(item),
    summary: item.summary ?? null,
    skin_type_confidence: item.skin_type_confidence ?? null,
    skin_type_description: item.skin_type_description ?? null,
    conditions: normalizedConditions,
    compatible_ingredients: compatibleIngredients,
    incompatible_pairs: incompatiblePairs,
    filtered_ingredients: filteredIngredients,
  };
}

export async function fetchHistoryDetail(id: string): Promise<HistoryDetail> {
  // If mock mode is explicitly active, or if ID is an explicit mock fixture ID, resolve from mock store
  if (isMockEnabled('history') || id.startsWith('mock-')) {
    if (deletedMockEntryIds.has(id)) {
      throw new Error('This scan is no longer available.');
    }
    const detail = MOCK_HISTORY_DETAILS[id];
    if (detail) return detail;
  }

  try {
    const response = await api.get(`/history/${encodeURIComponent(id)}`);
    const payload = response.data?.data;
    if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
      throw new Error('The history detail response was not in the expected format.');
    }

    return normalizeDetail(payload as HistoryDetailResponse);
  } catch (err: any) {
    // Only fall back to mock details if this was an explicit mock fixture ID
    if (id.startsWith('mock-') && MOCK_HISTORY_DETAILS[id]) {
      return MOCK_HISTORY_DETAILS[id];
    }
    throw err;
  }
}