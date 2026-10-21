import axios from 'axios';
import { api } from '../../../shared/services/api';
import { MOCK_GENERATED_ROUTINE, MOCK_ROUTINE } from './routine_mock';
import { Routine, RoutineApiEnvelope } from './routine_types';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Routine screen features
// (Current Routine, Routine Generation).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

export async function fetchRoutine(): Promise<Routine | null> {
  if (USE_MOCK) {
    return MOCK_ROUTINE;
  }

  try {
    const response = await api.get<RoutineApiEnvelope>('/routine');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function generateRoutine(): Promise<Routine> {
  if (USE_MOCK) {
    return MOCK_GENERATED_ROUTINE;
  }

  try {
    const response = await api.post<RoutineApiEnvelope>('/routine/generate');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Complete a skin scan before generating your routine.');
    }

    throw error;
  }
}