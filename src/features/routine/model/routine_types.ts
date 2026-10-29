export type RoutineTimeOfDay = 'morning' | 'evening' | 'both';

export interface RoutineProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image_url: string | null;
}

export interface RoutineStep {
  id: string;
  step_number: number;
  step_name: string;
  description: string;
  time_of_day: RoutineTimeOfDay;
  product_id: string | null;
  product: RoutineProduct | null;
}

export interface SkincareRoutine {
  id: string;
  based_on_analysis_id: string;
  created_at: string;
  steps: RoutineStep[];
  rationale: string | null;
}

export interface RoutineStepUpdate {
  product_id?: string | null;
  step_name?: string;
  description?: string;
}

export interface RoutineProductPage {
  items: RoutineProduct[];
  nextOffset: number | null;
}

export interface RoutineSkinProfile {
  skin_type: string | null;
  concerns: string[];
  health_score: number | null;
  overall_condition: string | null;
}