import { LatestAnalysis, RoutineStep, Article } from './home_types';

export const MOCK_ROUTINE_STEPS: RoutineStep[] = [
  {
    step_number: 1,
    title: 'Cleanser',
    description: 'Remove excess oil and impurities gently.',
  },
  {
    step_number: 2,
    title: 'Toner',
    description: 'Prep skin to better absorb serums and moisturizers.',
  },
  {
    step_number: 3,
    title: 'Lightweight Serum',
    description: 'Used to target troublesome skin problems',
  },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: '5f90dc32-2a19-4bfb-996f-b1108215a8',
    title: "The Beginner's Guide to Active Ingredients",
    summary:
      'A breakdown of how Niacinamide, Hyaluronic Acid, Salicylic Acid, and Retinoids interact with your epidermal barrier.',
    source: 'Healthline',
    url: 'https://www.healthline.com/health/beauty-skin-care/active-ingredients',
    image_url:
      'https://images.unsplash.com/photo-1608248597359-54315264b306?auto=format&fit=crop&w=800&q=80',
    category: 'Ingredients',
    published_at: '2026-03-01',
  },
  {
    id: '6ea71df2-90e5-4dba-88fa-fce37f76cc',
    title: 'Sunscreen 101: Why Daily Broad-Spectrum SPF Matters',
    summary:
      'Why daily UV protection is essential regardless of the weather to prevent hyperpigmentation, collagen degradation, and barrier breakdown.',
    source: 'Skin Cancer Foundation',
    url: 'https://www.skincancer.org/skin-cancer-prevention/sun-protection/sunscreen/',
    image_url:
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    category: 'Sun Protection',
    published_at: '2026-04-05',
  },
  {
    id: 'a44c464e-81f4-4008-b20c-7f97fe632',
    title: 'Skin Care Basics: How to Care for Your Skin Barrier',
    summary:
      'Dermatologists share foundational advice on maintaining a healthy, resilient epidermal moisture barrier without over-exfoliating.',
    source: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/skin-care-basics',
    image_url:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    category: 'Essentials',
    published_at: '2026-01-15',
  },
  {
    id: 'f83fcc09-b01d-4552-ba8c-5ebca7a65',
    title: 'Understanding Skin Types: Dry, Oily, Combination, & Sensitive',
    summary:
      'Learn how sebum production and hydration levels determine your skin type, and how to tailor your daily morning and evening regimen.',
    source: 'Cleveland Clinic',
    url: 'https://health.clevelandclinic.org/how-to-determine-your-skin-type',
    image_url:
      'https://images.unsplash.com/photo-1512290900672-1f55b9a89684?auto=format&fit=crop&w=800&q=80',
    category: 'Skin Types',
    published_at: '2026-02-10',
  },
];

export const MOCK_LATEST_ANALYSIS: LatestAnalysis = {
  id: 'mock-scan-001',
  skin_type: 'Oily',
  conditions: ['Skin Redness'],
  health_score: 89,
  created_at: '2026-05-01T08:00:00Z',
};
