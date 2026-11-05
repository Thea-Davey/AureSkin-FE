import { RoutineProduct, RoutineSkinProfile, SkincareRoutine } from './routine_types';

export const MOCK_CURRENT_ROUTINE: SkincareRoutine | null = null;

export const MOCK_SKIN_PROFILE: RoutineSkinProfile = {
  skin_type: 'Oily',
  concerns: ['Redness', 'Inflammatory Acne', 'Blackheads'],
  health_score: 89,
  overall_condition: 'Healthy',
  analysis_date: 'May 1, 2026',
};

export const MOCK_PRODUCT_OPTIONS: RoutineProduct[] = [
  // Cleansers
  {
    id: 'mock-prod-cleanser-1',
    name: 'Foaming Facial Cleanser',
    brand: 'CeraVe',
    category: 'Cleanser',
    image_url: null,
  },
  {
    id: 'mock-prod-cleanser-2',
    name: 'Low pH Good Morning Gel Cleanser',
    brand: 'COSRX',
    category: 'Cleanser',
    image_url: null,
  },
  {
    id: 'mock-prod-cleanser-3',
    name: 'Toleriane Purifying Foaming Cleanser',
    brand: 'La Roche-Posay',
    category: 'Cleanser',
    image_url: null,
  },

  // Toners
  {
    id: 'mock-prod-toner-1',
    name: 'Glycolic Acid 7% Toning Solution',
    brand: 'The Ordinary',
    category: 'Toner',
    image_url: null,
  },
  {
    id: 'mock-prod-toner-2',
    name: 'AHA/BHA Clarifying Treatment Toner',
    brand: 'COSRX',
    category: 'Toner',
    image_url: null,
  },
  {
    id: 'mock-prod-toner-3',
    name: 'Skin Perfecting 2% BHA Liquid Exfoliant',
    brand: "Paula's Choice",
    category: 'Toner',
    image_url: null,
  },

  // Serums & Treatments
  {
    id: 'mock-prod-serum-1',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Serum / Treatment',
    image_url: null,
  },
  {
    id: 'mock-prod-serum-2',
    name: 'Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    category: 'Serum / Treatment',
    image_url: null,
  },
  {
    id: 'mock-prod-serum-3',
    name: 'Salicylic Acid 2% Solution',
    brand: 'The Ordinary',
    category: 'Serum / Treatment',
    image_url: null,
  },
  {
    id: 'mock-prod-serum-4',
    name: 'Effaclar Duo Dual Action Acne Treatment',
    brand: 'La Roche-Posay',
    category: 'Serum / Treatment',
    image_url: null,
  },

  // Moisturizers
  {
    id: 'mock-prod-moisturizer-1',
    name: 'Natural Moisturizing Factors + HA',
    brand: 'The Ordinary',
    category: 'Moisturizer',
    image_url: null,
  },
  {
    id: 'mock-prod-moisturizer-2',
    name: 'Oil-Free Ultra-Moisturizing Lotion',
    brand: 'COSRX',
    category: 'Moisturizer',
    image_url: null,
  },
  {
    id: 'mock-prod-moisturizer-3',
    name: 'PM Facial Moisturizing Lotion',
    brand: 'CeraVe',
    category: 'Moisturizer',
    image_url: null,
  },

  // Sunscreens
  {
    id: 'mock-prod-sunscreen-1',
    name: 'Anthelios Clear Skin Dry Touch SPF 60',
    brand: 'La Roche-Posay',
    category: 'Sunscreen',
    image_url: null,
  },
  {
    id: 'mock-prod-sunscreen-2',
    name: 'Aloe Soothing Sun Cream SPF 50+ PA+++',
    brand: 'COSRX',
    category: 'Sunscreen',
    image_url: null,
  },
  {
    id: 'mock-prod-sunscreen-3',
    name: 'Mineral UV Filters SPF 30 with Antioxidants',
    brand: 'The Ordinary',
    category: 'Sunscreen',
    image_url: null,
  },
];

export const MOCK_ACTIVE_ROUTINE: SkincareRoutine = {
  id: 'mock-routine-active',
  based_on_analysis_id: 'mock-analysis-1',
  created_at: '2026-05-01T09:00:00.000Z',
  rationale: 'This routine is designed to address your acne & texture concerns while maintaining healthy and balanced skin.',
  steps: [
    // Morning Steps (5 steps)
    {
      id: 'mock-morning-step-1',
      step_number: 1,
      step_name: 'Cleanser',
      description: 'Remove excess oil and impurities gently.',
      time_of_day: 'morning',
      product_id: MOCK_PRODUCT_OPTIONS[0].id,
      product: MOCK_PRODUCT_OPTIONS[0],
    },
    {
      id: 'mock-morning-step-2',
      step_number: 2,
      step_name: 'Toner',
      description: 'Balance skin pH and prepare for hydration.',
      time_of_day: 'morning',
      product_id: MOCK_PRODUCT_OPTIONS[3].id,
      product: MOCK_PRODUCT_OPTIONS[3],
    },
    {
      id: 'mock-morning-step-3',
      step_number: 3,
      step_name: 'Serum / Treatment',
      description: 'Soothe redness and regulate excess sebum.',
      time_of_day: 'morning',
      product_id: MOCK_PRODUCT_OPTIONS[6].id,
      product: MOCK_PRODUCT_OPTIONS[6],
    },
    {
      id: 'mock-morning-step-4',
      step_number: 4,
      step_name: 'Moisturizer',
      description: 'Hydrate lightly without feeling greasy.',
      time_of_day: 'morning',
      product_id: MOCK_PRODUCT_OPTIONS[10].id,
      product: MOCK_PRODUCT_OPTIONS[10],
    },
    {
      id: 'mock-morning-step-5',
      step_number: 5,
      step_name: 'Sunscreen',
      description: 'Shield barrier from daily UV radiation.',
      time_of_day: 'morning',
      product_id: MOCK_PRODUCT_OPTIONS[13].id,
      product: MOCK_PRODUCT_OPTIONS[13],
    },

    // Night Steps (4 steps - sunscreen excluded)
    {
      id: 'mock-night-step-1',
      step_number: 1,
      step_name: 'Cleanser',
      description: 'Deeply wash away pollutants and daily sebum.',
      time_of_day: 'evening',
      product_id: MOCK_PRODUCT_OPTIONS[1].id,
      product: MOCK_PRODUCT_OPTIONS[1],
    },
    {
      id: 'mock-night-step-2',
      step_number: 2,
      step_name: 'Toner',
      description: 'Gently exfoliate and decongest pores.',
      time_of_day: 'evening',
      product_id: MOCK_PRODUCT_OPTIONS[5].id,
      product: MOCK_PRODUCT_OPTIONS[5],
    },
    {
      id: 'mock-night-step-3',
      step_number: 3,
      step_name: 'Serum / Treatment',
      description: 'Target blemishes and promote cell renewal.',
      time_of_day: 'evening',
      product_id: MOCK_PRODUCT_OPTIONS[8].id,
      product: MOCK_PRODUCT_OPTIONS[8],
    },
    {
      id: 'mock-night-step-4',
      step_number: 4,
      step_name: 'Moisturizer',
      description: 'Strengthen your skin barrier overnight.',
      time_of_day: 'evening',
      product_id: MOCK_PRODUCT_OPTIONS[12].id,
      product: MOCK_PRODUCT_OPTIONS[12],
    },
  ],
};

export const MOCK_GENERATED_ROUTINE: SkincareRoutine = {
  ...MOCK_ACTIVE_ROUTINE,
  id: 'mock-routine-generated',
};
