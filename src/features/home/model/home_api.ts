import { api } from '../../../shared/services/api';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { supabase } from '../../../shared/services/supabase';
import {
  getCachedArticles,
  saveCachedArticles,
  isMockCatalogItemId,
} from '../../../shared/storage/catalogStorage';
import { LatestAnalysis, RoutineStep, Article } from './home_types';
import { MOCK_LATEST_ANALYSIS, MOCK_ROUTINE_STEPS, MOCK_ARTICLES } from './home_mock';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Home screen features (Latest Analysis,
// Today's Routine, Skincare Articles).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = isMockEnabled('home');
// ============================================================================

/**
 * Fetch the user's latest skin analysis from the backend or mock data.
 */
export async function fetchLatestAnalysis(): Promise<LatestAnalysis | null> {
  if (isMockEnabled('home')) {
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
  if (isMockEnabled('home')) {
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

    return filtered.map((s: any, idx: number) => ({
      id: s.id,
      step_number: s.step_number ?? idx + 1,
      title: s.step_name || s.category || `Step ${idx + 1}`,
      category: s.step_name || s.category || 'Step',
      product_name: s.product?.name || s.product_name || null,
      description: s.description || '',
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch skincare articles from Supabase.
 * Supports both 'articles' and 'article' table names, with flexible column mappings,
 * ensuring articles created or updated in Supabase are displayed directly to users.
 */
export async function fetchArticles(): Promise<Article[]> {
  if (isMockEnabled('home')) {
    return MOCK_ARTICLES;
  }

  try {
    let rawData: Record<string, unknown>[] | null = null;
    let lastError: unknown = null;

    // 1. Try 'articles' (plural) with published_at order
    const resArticles = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (!resArticles.error && Array.isArray(resArticles.data) && resArticles.data.length > 0) {
      rawData = resArticles.data as Record<string, unknown>[];
    } else if (resArticles.error) {
      lastError = resArticles.error;
      // If order by published_at failed (e.g. column not yet indexed or renamed), try plain select
      const plainArticles = await supabase.from('articles').select('*');
      if (!plainArticles.error && Array.isArray(plainArticles.data) && plainArticles.data.length > 0) {
        rawData = plainArticles.data as Record<string, unknown>[];
        lastError = null;
      }
    }

    // 2. If 'articles' failed or was empty, also try 'article' (singular)
    if (!rawData || rawData.length === 0) {
      const resArticle = await supabase
        .from('article')
        .select('*')
        .order('published_at', { ascending: false });

      if (!resArticle.error && Array.isArray(resArticle.data) && resArticle.data.length > 0) {
        rawData = resArticle.data as Record<string, unknown>[];
        lastError = null;
      } else {
        const plainArticle = await supabase.from('article').select('*');
        if (!plainArticle.error && Array.isArray(plainArticle.data) && plainArticle.data.length > 0) {
          rawData = plainArticle.data as Record<string, unknown>[];
          lastError = null;
        } else if (!rawData) {
          lastError = plainArticle.error || resArticle.error || lastError;
        }
      }
    }

    if (rawData && rawData.length > 0) {
      const articles: Article[] = rawData.map((item: Record<string, unknown>, idx: number) => ({
        id: String(item.id ?? `article-${idx}`),
        title: String(item.title ?? item.name ?? item.headline ?? 'Untitled Article'),
        summary: String(item.summary ?? item.description ?? item.content ?? item.snippet ?? ''),
        source: String(item.source ?? item.author ?? item.publisher ?? 'AureSkin Skincare'),
        url: String(item.url ?? item.link ?? item.article_url ?? item.source_url ?? ''),
        image_url: item.image_url
          ? String(item.image_url)
          : item.image
            ? String(item.image)
            : item.thumbnail
              ? String(item.thumbnail)
              : null,
        category: String(item.category ?? item.tag ?? item.topic ?? 'General'),
        published_at: item.published_at
          ? String(item.published_at)
          : item.created_at
            ? String(item.created_at)
            : undefined,
      }));

      void saveCachedArticles(articles);
      return articles;
    }

    if (lastError) {
      console.warn('[HomeApi] Error fetching articles from Supabase:', lastError);
    }

    const cached = await getCachedArticles();
    if (cached && cached.length > 0 && !cached.some((a) => isMockCatalogItemId(a?.id))) {
      return cached;
    }
    return [];
  } catch (err) {
    console.warn('[HomeApi] Unexpected error fetching articles:', err);
    const cached = await getCachedArticles();
    if (cached && cached.length > 0 && !cached.some((a) => isMockCatalogItemId(a?.id))) {
      return cached;
    }
    return [];
  }
}
