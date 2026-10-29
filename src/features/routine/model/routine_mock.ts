import { RoutineProduct, RoutineSkinProfile, SkincareRoutine } from './routine_types';

export const MOCK_CURRENT_ROUTINE: SkincareRoutine | null = null;

export const MOCK_SKIN_PROFILE: RoutineSkinProfile = {
  skin_type: 'Oily',
  concerns: ['Skin Redness'],
  health_score: 89,
  overall_condition: 'Based on latest analysis',
};

export const MOCK_PRODUCT_OPTIONS: RoutineProduct[] = [
  {
    id: 'mock-product-cleanser',
    name: 'Gentle Foaming Cleanser',
    brand: 'AureSkin Lab',
    category: 'cleanser',
    image_url: null,
  },
  {
    id: 'mock-product-toner',
    name: 'Balancing Hydration Toner',
    brand: 'AureSkin Lab',
    category: 'toner',
    image_url: null,
  },
  {
    id: 'mock-product-serum',
    name: 'Niacinamide Serum',
    brand: 'AureSkin Lab',
    category: 'serum',
    image_url: null,
  },
  {
    id: 'mock-product-moisturizer',
    name: 'Daily Barrier Moisturizer',
    brand: 'AureSkin Lab',
    category: 'moisturizer',
    image_url: null,
  },
  {
    id: 'mock-product-sunscreen',
    name: 'Daily Broad-Spectrum SPF',
    brand: 'AureSkin Lab',
    category: 'sunscreen',
    image_url: null,
  },
];

export const MOCK_ACTIVE_ROUTINE: SkincareRoutine = {
  id: 'mock-routine-active',
  based_on_analysis_id: 'mock-analysis-1',
  created_at: '2026-10-25T09:00:00.000Z',
  rationale: 'This routine keeps daily cleansing and hydration simple while supporting your current skin goals.',
  steps: [
    {
      id: 'mock-routine-step-1',
      step_number: 1,
      step_name: 'Gentle Cleanser',
      description: 'Cleanse gently without stripping the skin barrier.',
      time_of_day: 'both',
      product_id: MOCK_PRODUCT_OPTIONS[0].id,
      product: MOCK_PRODUCT_OPTIONS[0],
    },
    {
      id: 'mock-routine-step-2',
      step_number: 2,
      step_name: 'Balancing Toner',
      description: 'Apply a light layer to prepare skin for the next step.',
      time_of_day: 'morning',
      product_id: MOCK_PRODUCT_OPTIONS[1].id,
      product: MOCK_PRODUCT_OPTIONS[1],
    },
    {
      id: 'mock-routine-step-3',
      step_number: 3,
      step_name: 'Niacinamide Serum',
      description: 'Apply a thin layer and follow the product label instructions.',
      time_of_day: 'both',
      product_id: MOCK_PRODUCT_OPTIONS[2].id,
      product: MOCK_PRODUCT_OPTIONS[2],
    },
    {
      id: 'mock-routine-step-4',
      step_number: 4,
      step_name: 'Daily Barrier Moisturizer',
      description: 'Apply a light layer to support comfortable, hydrated skin.',
      time_of_day: 'both',
      product_id: MOCK_PRODUCT_OPTIONS[3].id,
      product: MOCK_PRODUCT_OPTIONS[3],
    },
    {
      id: 'mock-routine-step-5',
      step_number: 5,
      step_name: 'Broad-Spectrum Sunscreen',
      description: 'Finish the morning routine with sunscreen as directed on its label.',
      time_of_day: 'morning',
      product_id: MOCK_PRODUCT_OPTIONS[4].id,
      product: MOCK_PRODUCT_OPTIONS[4],
    },
  ],
};

export const MOCK_GENERATED_ROUTINE: SkincareRoutine = {
  ...MOCK_ACTIVE_ROUTINE,
  id: 'mock-routine-generated',
};