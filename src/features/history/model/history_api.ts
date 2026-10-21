import { api } from '../../../shared/services/api';
import { MOCK_HISTORY_ENTRIES } from './history_mock';
import { HistoryEntry, HistoryPage, HistoryPageParams } from './history_types';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all History screen features (history list,
// pagination, and deletion).
// Set to `false` to fetch real-time live data from FastAPI.
export const USE_MOCK: boolean = true;
// ============================================================================

const deletedMockEntryIds = new Set<string>();

interface HistoryConditionItem {
  name?: string;
  display_name?: string;
  condition?: {
    name?: string;
    display_name?: string;
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
  if (USE_MOCK) {
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
  return {
    items,
    nextOffset: items.length === limit ? offset + items.length : null,
  };
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  if (USE_MOCK) {
    deletedMockEntryIds.add(id);
    return;
  }

  await api.delete(`/history/${encodeURIComponent(id)}`);
}