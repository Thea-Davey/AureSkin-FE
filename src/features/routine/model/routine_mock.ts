import { Routine } from './routine_types';

export const MOCK_ROUTINE: Routine | null = null;

export const MOCK_GENERATED_ROUTINE: Routine = {
  id: 'mock-routine-1',
  based_on_analysis_id: 'mock-analysis-1',
  generated_at: '2026-05-01T08:00:00Z',
  rationale:
    'This routine is designed around your latest skin analysis and detected concerns.',
  steps: [
    {
      id: 'mock-morning-cleanser',
      step_number: 1,
      step_name: 'Gentle Cleanser',
      description: 'Remove excess oil and impurities without stripping your skin.',
      time_of_day: 'morning',
      product: null,
    },
    {
      id: 'mock-morning-moisturizer',
      step_number: 2,
      step_name: 'Lightweight Moisturizer',
      description: 'Support hydration and help maintain your skin barrier.',
      time_of_day: 'morning',
      product: null,
    },
    {
      id: 'mock-morning-sunscreen',
      step_number: 3,
      step_name: 'Broad-Spectrum Sunscreen',
      description: 'Protect your skin from daily UV exposure.',
      time_of_day: 'morning',
      product: null,
    },
    {
      id: 'mock-evening-cleanser',
      step_number: 1,
      step_name: 'Gentle Cleanser',
      description: 'Wash away sunscreen, oil, and daily buildup.',
      time_of_day: 'evening',
      product: null,
    },
    {
      id: 'mock-evening-moisturizer',
      step_number: 2,
      step_name: 'Barrier Moisturizer',
      description: 'Replenish moisture and support overnight recovery.',
      time_of_day: 'evening',
      product: null,
    },
  ],
};