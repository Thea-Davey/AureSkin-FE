export interface LatestAnalysis {
  id: string;
  skin_type: string;
  conditions: string[];
  health_score: number; // 0.0 - 100.0 from backend Weighted Heuristic Scoring Algorithm
  created_at: string;
}

export interface RoutineStep {
  id?: string;
  step_number: number;
  title: string;
  description: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  image_url?: string | null;
  category?: string;
  published_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
