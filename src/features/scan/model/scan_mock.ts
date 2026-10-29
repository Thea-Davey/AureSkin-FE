import { ScanResult, CompatibilityResponse, SkinGuidanceTip } from './scan_types';

export const MOCK_SCAN_RESULT: ScanResult = {
  id: 'mock-scan-001',
  user_id: 'mock-user-001',
  image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  skin_type: 'oily',
  skin_type_confidence: 91.46,
  health_score: 85.0,
  summary:
    'Your skin shows elevated sebum production in the T-zone and cheeks, with mild surface erythema (skin redness). Overall skin barrier integrity is stable.',
  conditions: [
    {
      id: 'cond-01',
      name: 'redness',
      display_name: 'Skin Redness',
      confidence: 88.5,
      description:
        'Your skin shows symptoms of skin redness (erythema), an inflammatory response characterized by increased blood flow to the superficial capillaries, appearing as pink, red, or discolored patches.',
      symptoms: 'Often feels warm, tender, or itchy, and can be flat, raised, or scaly.',
      causes:
        'Over-exfoliation, barrier compromise, weather irritation, or mild contact sensitivity.',
    },
  ],
  compatible_ingredients: [
    {
      id: 'ing-01',
      name: 'Salicylic acid',
      reason: 'Penetrates lipid layers to clear congested pores.',
    },
    {
      id: 'ing-02',
      name: 'Niacinamide',
      reason: 'Regulates sebum production and soothes vascular redness.',
    },
    {
      id: 'ing-03',
      name: 'Centella Asiatica',
      reason: 'Accelerates skin barrier repair and reduces inflammation.',
    },
  ],
  incompatible_pairs: [
    {
      ingredient_a: 'Retinol',
      ingredient_b: 'Salicylic Acid',
      reason:
        'Combining strong keratolytics increases barrier irritation and excessive peeling. Alternate days instead.',
    },
  ],
  created_at: new Date().toISOString(),
};

export const MOCK_COMPATIBILITY: CompatibilityResponse = {
  analysis_id: MOCK_SCAN_RESULT.id,
  compatible_ingredients: MOCK_SCAN_RESULT.compatible_ingredients,
  incompatible_pairs: MOCK_SCAN_RESULT.incompatible_pairs,
};

export const MOCK_CAMERA_PHOTO_URI =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';

export const MOCK_GALLERY_THUMBNAIL =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';

export const MOCK_SKIN_GUIDANCE_TIPS: SkinGuidanceTip[] = [
  {
    id: 'tip-1',
    title: 'Even Natural Lighting',
    description: 'Face a bright window or evenly diffused light. Avoid strong backlighting or harsh shadows.',
    iconName: 'Sun',
  },
  {
    id: 'tip-2',
    title: 'Clean, Makeup-Free Skin',
    description: 'Cleanse away excess oils and remove foundation or concealer for accurate condition detection.',
    iconName: 'Sparkles',
  },
  {
    id: 'tip-3',
    title: 'Neutral Facial Expression',
    description: 'Keep your face relaxed, look directly into the camera, and tuck stray hair away from your forehead.',
    iconName: 'Smile',
  },
  {
    id: 'tip-4',
    title: 'Remove Glasses & Accessories',
    description: 'Take off eyeglasses and hats to prevent glare and anatomical landmark occlusions.',
    iconName: 'Glasses',
  },
];
