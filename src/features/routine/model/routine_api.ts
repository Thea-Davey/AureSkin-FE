import { api } from '../../../shared/services/api';
import {
    MOCK_ACTIVE_ROUTINE,
    MOCK_CURRENT_ROUTINE,
    MOCK_GENERATED_ROUTINE,
    MOCK_PRODUCT_OPTIONS,
    MOCK_SKIN_PROFILE,
} from './routine_mock';
import {
    RoutineProduct,
    RoutineProductPage,
    RoutineSkinProfile,
    RoutineStep,
    RoutineStepUpdate,
    RoutineTimeOfDay,
    SkincareRoutine,
} from './routine_types';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for Routine screen features (current routine,
// latest skin profile, generation, product options, and step updates).
// Set to `false` to fetch real-time live data from FastAPI.
export const USE_MOCK: boolean = true;
// ============================================================================

let mockCurrentRoutine = MOCK_CURRENT_ROUTINE;

interface RoutineResponse {
  id?: string;
  based_on_analysis_id?: string | null;
  created_at?: string | null;
  steps?: RoutineStepResponse[];
  routine?: RoutineResponse | null;
  rationale?: string | null;
}

interface RoutineProductResponse {
  id?: string;
  name?: string;
  brand?: string | null;
  category?: string | null;
  image_url?: string | null;
}

interface RoutineProductListItem extends RoutineProductResponse {
  id: string;
  name: string;
}

interface RoutineStepResponse {
  id?: string;
  step_number?: number;
  step_name?: string;
  description?: string;
  time_of_day?: string;
  product_id?: string | null;
  product?: RoutineProductResponse | null;
}

interface AnalysisListItem {
  id: string;
  skin_type?: string | null;
  health_score?: number | null;
}

function normalizeTimeOfDay(value: string | undefined): RoutineTimeOfDay {
  const normalized = value?.toLowerCase();
  if (normalized === 'morning' || normalized === 'evening' || normalized === 'both') return normalized;
  return 'both';
}

function normalizeProduct(product: RoutineProductResponse | null | undefined): RoutineProduct | null {
  if (!product) return null;
  if (!product.id || !product.name) {
    throw new Error('A routine product was missing its ID or name.');
  }
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? '',
    category: product.category ?? '',
    image_url: product.image_url ?? null,
  };
}

function normalizeStep(step: RoutineStepResponse, fallbackId: string, index: number): RoutineStep {
  if (typeof step.step_name !== 'string' || typeof step.description !== 'string') {
    throw new Error('A routine step was missing its name or description.');
  }
  const product = normalizeProduct(step.product);
  return {
    id: step.id ?? `${fallbackId}-step-${index + 1}`,
    step_number: step.step_number ?? index + 1,
    step_name: step.step_name,
    description: step.description,
    time_of_day: normalizeTimeOfDay(step.time_of_day),
    product_id: step.product_id ?? product?.id ?? null,
    product,
  };
}

function normalizeRoutine(payload: RoutineResponse): SkincareRoutine {
  if (typeof payload.id !== 'string' || !Array.isArray(payload.steps)) {
    throw new Error('The routine response was not in the expected format.');
  }

  return {
    id: payload.id,
    based_on_analysis_id: payload.based_on_analysis_id ?? '',
    created_at: payload.created_at ?? '',
    steps: payload.steps.map((step, index) => normalizeStep(step, payload.id as string, index)),
    rationale: payload.rationale ?? null,
  };
}

export async function fetchRoutine(): Promise<SkincareRoutine | null> {
  if (USE_MOCK) return mockCurrentRoutine;

  const response = await api.get('/routine');
  const payload = response.data?.data;
  if (payload === null || payload?.routine === null) return null;
  if (!payload || typeof payload !== 'object') {
    throw new Error('The routine response was not in the expected format.');
  }
  return normalizeRoutine(payload.routine ?? payload);
}

function getConditionName(condition: unknown): string {
  if (typeof condition === 'string') return condition;
  if (!condition || typeof condition !== 'object') return '';
  const item = condition as { display_name?: string; name?: string; condition?: { display_name?: string; name?: string } };
  return item.display_name ?? item.name ?? item.condition?.display_name ?? item.condition?.name ?? '';
}

export async function fetchLatestSkinProfile(): Promise<RoutineSkinProfile | null> {
  if (USE_MOCK) return MOCK_SKIN_PROFILE;

  const response = await api.get('/history', { params: { limit: 1, offset: 0 } });
  const rawItems = response.data?.data?.items;
  if (!Array.isArray(rawItems)) {
    throw new Error('The latest scan response was not in the expected format.');
  }
  if (rawItems.length === 0) return null;

  const latest = rawItems[0] as AnalysisListItem;
  const detailResponse = await api.get(`/history/${encodeURIComponent(latest.id)}`);
  const detail = detailResponse.data?.data;
  if (!detail || typeof detail !== 'object') {
    throw new Error('The latest scan details were not in the expected format.');
  }

  const rawConditions = detail.conditions?.length ? detail.conditions : detail.analysis_conditions ?? [];
  const concerns = Array.isArray(rawConditions)
    ? rawConditions.map(getConditionName).filter(Boolean)
    : [];
  const healthScore = latest.health_score ?? detail.health_score ?? null;

  return {
    skin_type: latest.skin_type ?? detail.skin_type ?? null,
    concerns,
    health_score: typeof healthScore === 'number' ? healthScore : null,
    overall_condition: healthScore === null ? null : 'Based on latest analysis',
  };
}

export async function generateRoutine(): Promise<SkincareRoutine> {
  if (USE_MOCK) {
    mockCurrentRoutine = MOCK_GENERATED_ROUTINE;
    return mockCurrentRoutine;
  }

  const response = await api.post('/routine/generate');
  const payload = response.data?.data?.routine ?? response.data?.data;
  if (!payload || typeof payload !== 'object') {
    throw new Error('The generated routine response was not in the expected format.');
  }
  return normalizeRoutine(payload as RoutineResponse);
}

export async function fetchProductOptions({
  query = '',
  limit,
  offset,
}: {
  query?: string;
  limit: number;
  offset: number;
}): Promise<RoutineProductPage> {
  if (USE_MOCK) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = MOCK_PRODUCT_OPTIONS.filter((product) =>
      `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase().includes(normalizedQuery)
    );
    const items = filtered.slice(offset, offset + limit);
    return {
      items,
      nextOffset: offset + items.length < filtered.length ? offset + items.length : null,
    };
  }

  const response = await api.get('/products', {
    params: { q: query || undefined, limit, offset },
  });
  const rawItems = response.data?.data?.items;
  if (!Array.isArray(rawItems)) {
    throw new Error('The product response was not in the expected format.');
  }
  const items = (rawItems as RoutineProductListItem[]).map((item) => {
    const product = normalizeProduct(item);
    if (!product) throw new Error('A product result could not be normalized.');
    return product;
  });
  return {
    items,
    nextOffset: items.length === limit ? offset + items.length : null,
  };
}

export async function updateRoutineStep(
  stepId: string,
  updates: RoutineStepUpdate
): Promise<RoutineStep> {
  if (USE_MOCK) {
    const activeRoutine = mockCurrentRoutine ?? MOCK_ACTIVE_ROUTINE;
    const existingStep = activeRoutine.steps.find((step) => step.id === stepId);
    if (!existingStep) throw new Error('The routine step could not be found.');
    const product = updates.product_id === undefined
      ? existingStep.product
      : updates.product_id === null
        ? null
        : MOCK_PRODUCT_OPTIONS.find((option) => option.id === updates.product_id) ?? null;
    const updatedStep: RoutineStep = {
      ...existingStep,
      ...updates,
      product_id: updates.product_id === undefined ? existingStep.product_id : updates.product_id,
      product,
    };
    mockCurrentRoutine = {
      ...activeRoutine,
      steps: activeRoutine.steps.map((step) => step.id === stepId ? updatedStep : step),
    };
    return updatedStep;
  }

  const response = await api.put(`/routine/steps/${encodeURIComponent(stepId)}`, updates);
  const payload = response.data?.data?.step ?? response.data?.data;
  if (!payload || typeof payload !== 'object') {
    throw new Error('The updated routine step response was not in the expected format.');
  }
  return normalizeStep(payload as RoutineStepResponse, 'updated-routine-step', 0);
}