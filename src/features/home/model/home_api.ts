import { api } from '../../../shared/services/api';
import { supabase } from '../../../shared/services/supabase';
import { LatestAnalysis, RoutineStep, Article } from './home_types';
import { MOCK_LATEST_ANALYSIS, MOCK_ROUTINE_STEPS, MOCK_ARTICLES } from './home_mock';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Home screen features (Latest Analysis,
// Today's Routine, Skincare Articles).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

/**
 * Fetch the user's latest skin analysis from the backend or mock data.
 */
export async function fetchLatestAnalysis(): Promise<LatestAnalysis | null> {
  if (USE_MOCK) {
    return MOCK_LATEST_ANALYSIS;
  }

  try {
    const response = await api.get('/history?limit=1');
    const items = response.data?.data?.items || [];
    if (items.length === 0) return null;

    const latestItem = items[0];

    // Fetch detail to get exact conditions array
    let conditions: string[] = [];
    try {
      const detailRes = await api.get(`/history/${latestItem.id}`);
      const rawConditions = detailRes.data?.data?.conditions || [];
      conditions = rawConditions.map(
        (c: { display_name?: string; name?: string }) =>
          c.display_name || c.name || ''
      );
    } catch {
      conditions = [];
    }

    return {
      id: latestItem.id,
      skin_type: latestItem.skin_type,
      conditions,
      health_score: latestItem.health_score ?? 0,
      created_at: latestItem.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch today's personalized routine steps from the backend or mock data.
 */
export async function fetchTodayRoutine(timePeriod: string): Promise<RoutineStep[]> {
  if (USE_MOCK) {
    return MOCK_ROUTINE_STEPS;
  }

  try {
    const res = await api.get('/routine');
    const allSteps = res.data?.data?.steps || [];
    const filtered = allSteps.filter(
      (s: { time_of_day?: string }) =>
        !s.time_of_day ||
        s.time_of_day.toLowerCase() === 'both' ||
        s.time_of_day.toLowerCase() === timePeriod
    );

    return filtered.map((s: { step_number: number; step_name: string; description: string }) => ({
      step_number: s.step_number,
      title: s.step_name,
      description: s.description,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch curated skincare articles from the Supabase articles table or mock data.
 */
export async function fetchArticles(): Promise<Article[]> {
  if (USE_MOCK) {
    return MOCK_ARTICLES;
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as Article[];
  } catch {
    return [];
  }
}
