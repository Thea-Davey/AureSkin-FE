import {
  ScanResult,
  CompatibilityResponse,
  SkinGuidanceTip,
  GalleryPhotoItem,
} from './scan_types';

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
      reason: 'Regulates sebum production and strengthens barrier integrity.',
    },
    {
      id: 'ing-03',
      name: 'Clay',
      reason: 'Absorbs excess surface oil and clarifies dermal impurities.',
    },
    {
      id: 'ing-04',
      name: 'Hyaluronic acid',
      reason: 'Provides deep non-comedogenic hydration.',
    },
    {
      id: 'ing-05',
      name: 'Retinol',
      reason: 'Accelerates cellular turnover and normalizes keratinization.',
    },
    {
      id: 'ing-06',
      name: 'Dioic acid',
      reason: 'Reduces excessive sebum production and evens tone.',
    },
    {
      id: 'ing-07',
      name: 'Omega fatty acids',
      reason: 'Replenishes essential skin lipids without clogging pores.',
    },
    {
      id: 'ing-08',
      name: 'Aloe Vera',
      reason: 'Soothes dermal inflammation and cools irritated skin.',
    },
  ],
  incompatible_pairs: [
    {
      ingredient_a: 'Retinol',
      ingredient_b: 'Salicylic Acid',
      reason:
        'Combining strong keratolytics increases barrier irritation and excessive peeling. Alternate days instead.',
    },
    {
      ingredient_a: 'Vitamin C (L-Ascorbic Acid)',
      ingredient_b: 'AHAs / BHAs',
      reason:
        'Low pH active layering destabilizes Vitamin C efficacy and provokes irritation. Use Vitamin C in AM, AHAs/BHAs in PM.',
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

export const MOCK_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 'photo-01',
    uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_natural_01.jpg',
    tag: 'portrait',
  },
  {
    id: 'photo-02',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_clear_02.jpg',
    tag: 'daylight',
  },
  {
    id: 'photo-03',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_window_03.jpg',
    tag: 'studio',
  },
  {
    id: 'photo-04',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    filename: 'selfie_indoor_04.jpg',
    tag: 'indoor',
  },
  {
    id: 'photo-05',
    uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_front_05.jpg',
    tag: 'portrait',
  },
  {
    id: 'photo-06',
    uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_neutral_06.jpg',
    tag: 'daylight',
  },
  {
    id: 'photo-07',
    uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_close_07.jpg',
    tag: 'studio',
  },
  {
    id: 'photo-08',
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    filename: 'daylight_selfie_08.jpg',
    tag: 'daylight',
  },
  {
    id: 'photo-09',
    uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    filename: 'natural_headshot_09.jpg',
    tag: 'portrait',
  },
  {
    id: 'photo-10',
    uri: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    filename: 'clean_light_10.jpg',
    tag: 'indoor',
  },
  {
    id: 'photo-11',
    uri: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=600&q=80',
    filename: 'bright_portrait_11.jpg',
    tag: 'daylight',
  },
  {
    id: 'photo-12',
    uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    filename: 'neutral_tone_12.jpg',
    tag: 'studio',
  },
  {
    id: 'photo-13',
    uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    filename: 'soft_window_13.jpg',
    tag: 'portrait',
  },
  {
    id: 'photo-14',
    uri: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
    filename: 'morning_light_14.jpg',
    tag: 'daylight',
  },
  {
    id: 'photo-15',
    uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    filename: 'balanced_skin_15.jpg',
    tag: 'indoor',
  },
  {
    id: 'photo-16',
    uri: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_clarity_16.jpg',
    tag: 'studio',
  },
  {
    id: 'photo-17',
    uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
    filename: 'clean_selfie_17.jpg',
    tag: 'portrait',
  },
  {
    id: 'photo-18',
    uri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    filename: 'daylight_natural_18.jpg',
    tag: 'daylight',
  },
];

