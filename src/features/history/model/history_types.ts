export interface HistoryEntry {
  id: string;
  image_url: string | null;
  created_at: string;
  health_score: number;
  skin_type: string | null;
  conditions: string[];
}

export interface HistoryCondition {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  confidence: number | null;
}

export interface HistoryCompatibleIngredient {
  id: string;
  name: string;
  reason: string | null;
}

export interface HistoryIncompatiblePair {
  id: string;
  ingredient_a: string;
  ingredient_b: string;
  reason: string | null;
}

export interface HistoryDetail extends Omit<HistoryEntry, 'conditions'> {
  summary: string | null;
  skin_type_confidence: number | null;
  conditions: HistoryCondition[];
  compatible_ingredients: HistoryCompatibleIngredient[] | null;
  incompatible_pairs: HistoryIncompatiblePair[] | null;
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