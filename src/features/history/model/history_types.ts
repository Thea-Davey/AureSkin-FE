import { FilteredIngredient, ShotType } from '@/features/scan/model/scan_types';

export interface HistoryEntry {
  id: string;
  image_url: string | null;
  created_at: string;
  health_score: number;
  skin_type: string | null;
  conditions: string[];
  shot_type?: ShotType | string | null;
  image_urls?: Record<string, string | null> | null;
}

export interface HistoryCondition {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  symptoms?: string | null;
  causes?: string | null;
  confidence: number | null;
}

export interface HistoryCompatibleIngredient {
  id: string;
  ingredient_id?: string;
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
  skin_type_description?: string | null;
  conditions: HistoryCondition[];
  compatible_ingredients: HistoryCompatibleIngredient[] | null;
  incompatible_pairs: HistoryIncompatiblePair[] | null;
  filtered_ingredients?: FilteredIngredient[] | null;
  shot_type?: ShotType | string | null;
  image_urls?: Record<string, string | null> | null;
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