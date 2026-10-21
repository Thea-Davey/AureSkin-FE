export type RoutineTimeOfDay = 'morning' | 'evening' | 'both';

export interface RoutineProduct {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
}

export interface RoutineStep {
  id: string;
  step_number: number;
  step_name: string;
  description: string;
  time_of_day: RoutineTimeOfDay;
  product: RoutineProduct | null;
}

export interface Routine {
  id: string;
  based_on_analysis_id: string;
  generated_at: string;
  rationale: string | null;
  steps: RoutineStep[];
}

export interface RoutineApiEnvelope {
  data: Routine;
  message: string;
}

export interface RoutineSkinProfile {
  skinType: string | null;
  concerns: string[];
  healthScore: number | null;
}