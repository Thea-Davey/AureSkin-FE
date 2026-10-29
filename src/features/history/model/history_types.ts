export interface HistoryEntry {
  id: string;
  image_url: string | null;
  created_at: string;
  health_score: number;
  skin_type: string | null;
  conditions: string[];
}

export interface HistoryPage {
  items: HistoryEntry[];
  nextOffset: number | null;
}

export interface HistoryPageParams {
  limit: number;
  offset: number;
}

export interface HistoryFilters {
  startDate: string | null;
  endDate: string | null;
  skinTypes: string[];
  conditions: string[];
}