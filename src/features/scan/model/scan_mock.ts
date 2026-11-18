import {
  ScanResult,
  CompatibilityResponse,
  SkinGuidanceTip,
  GalleryPhotoItem,
  QuestionnaireQuestion,
  QuestionnaireAnswer,
  SetupPhotos,
} from './scan_types';

export const MOCK_SCAN_RESULT: ScanResult = {
  id: 'mock-scan-001',
  user_id: 'mock-user-001',
  image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85',
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
    {
      id: 'cond-02',
      name: 'pores',
      display_name: 'Enlarged Pores',
      confidence: 82.0,
      description:
        'Visible follicle openings concentrated along the central T-zone and inner cheeks, commonly associated with hyperactive sebaceous gland output and dermal elasticity loss.',
      symptoms: 'Textured dermal surface with enlarged pore diameter and noticeable shine.',
      causes:
        'Elevated sebum excretion, follicular congestion, and natural cellular buildup.',
    },
  ],
  compatible_ingredients: [
    {
      id: 'ingredient-salicylic-acid',
      name: 'Salicylic acid',
      reason: 'Penetrates lipid layers to clear congested pores.',
    },
    {
      id: 'ingredient-niacinamide',
      name: 'Niacinamide',
      reason: 'Regulates sebum production and strengthens barrier integrity.',
    },
    {
      id: 'ingredient-centella-asiatica',
      name: 'Centella Asiatica',
      reason: 'Accelerates skin barrier repair and reduces inflammation.',
    },
    {
      id: 'ingredient-clay',
      name: 'Clay',
      reason: 'Absorbs excess surface oil and clarifies dermal impurities.',
    },
    {
      id: 'ingredient-hyaluronic-acid',
      name: 'Hyaluronic acid',
      reason: 'Provides deep non-comedogenic hydration.',
    },
    {
      id: 'ingredient-retinol',
      name: 'Retinol',
      reason: 'Accelerates cellular turnover and normalizes keratinization.',
    },
    {
      id: 'ingredient-dioic-acid',
      name: 'Dioic acid',
      reason: 'Reduces excessive sebum production and evens tone.',
    },
    {
      id: 'ingredient-omega-fatty-acids',
      name: 'Omega fatty acids',
      reason: 'Replenishes essential skin lipids without clogging pores.',
    },
    {
      id: 'ingredient-aloe-vera',
      name: 'Aloe Vera',
      reason: 'Soothes dermal inflammation and cools irritated skin.',
    },
    {
      id: 'ingredient-aloe-vera',
      name: 'Aloe Vera',
      reason: 'Supports hydration and soothes the feel of irritated skin.',
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
  filtered_ingredients: [
    {
      id: 'filtered-retinoids',
      ingredient_id: 'ing-retinoids',
      name: 'Retinoids / Retinol',
      filter_type: 'pregnancy',
      reason: 'Contraindicated during pregnancy due to fetal risk.',
      details: 'Avoid oral and high-concentration topical vitamin A derivatives during pregnancy and lactation.',
    },
    {
      id: 'filtered-fragrance',
      ingredient_id: 'ing-fragrance',
      name: 'Synthetic Fragrance',
      filter_type: 'allergen',
      reason: 'Matches your active allergy profile: Fragrance.',
      details: 'Synthetic aroma chemicals can trigger contact dermatitis and barrier sensitization.',
    },
    {
      id: 'filtered-salicylic',
      ingredient_id: 'ing-salicylic',
      name: 'High-Strength Salicylic Acid (>2%)',
      filter_type: 'age',
      reason: 'High-strength keratolytics are not recommended for adolescent barrier resilience.',
      details: 'Adolescent skin benefits from gentle low-percentage BHAs rather than concentrated acid peels.',
    },
  ],
  created_at: new Date().toISOString(),
};

export const MOCK_COMPATIBILITY: CompatibilityResponse = {
  analysis_id: MOCK_SCAN_RESULT.id,
  compatible_ingredients: MOCK_SCAN_RESULT.compatible_ingredients,
  incompatible_pairs: MOCK_SCAN_RESULT.incompatible_pairs,
  filtered_ingredients: MOCK_SCAN_RESULT.filtered_ingredients,
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

// ── Setup & Questionnaire Mock Data ───────────────────────────

export const MOCK_QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: 1,
    questionNumber: 1,
    section: 'A',
    sectionTitle: 'Oiliness and sebum distribution',
    question: 'How does your facial skin usually feel throughout the day?',
    measures:
      'Measures: Overall perceived oiliness and dryness. Supported by self-reported symptom research.',
    choices: [
      { id: 'q1_1', label: 'Mostly dry or tight' },
      { id: 'q1_2', label: 'Comfortable and balanced' },
      { id: 'q1_3', label: 'Mostly oily or greasy' },
      { id: 'q1_4', label: 'Oily in some areas but dry or comfortable in others' },
      { id: 'q1_5', label: 'Not sure' },
    ],
  },
  {
    id: 2,
    questionNumber: 2,
    section: 'A',
    sectionTitle: 'Oiliness and sebum distribution',
    question: 'Which parts of your face usually become shiny or oily during the day?',
    measures:
      'Measures: Distribution of sebum across facial regions. Especially useful for distinguishing combination from generally oily skin.',
    choices: [
      { id: 'q2_1', label: 'Forehead and nose (T-zone)' },
      { id: 'q2_2', label: 'Forehead, nose, chin, and cheeks' },
      { id: 'q2_3', label: 'Only the cheeks' },
      { id: 'q2_4', label: 'My face usually does not become oily' },
      { id: 'q2_5', label: 'Not sure' },
    ],
  },
  {
    id: 3,
    questionNumber: 3,
    section: 'A',
    sectionTitle: 'Oiliness and sebum distribution',
    question: 'Compared with your forehead and nose, how do your cheeks usually feel?',
    measures:
      'Measures: Differences between cheek and T-zone characteristics. This can help identify a combination pattern.',
    choices: [
      { id: 'q3_1', label: 'Drier than my forehead and nose' },
      { id: 'q3_2', label: 'Just as oily as my forehead and nose' },
      { id: 'q3_3', label: 'Similar and comfortable across my face' },
      { id: 'q3_4', label: 'Sometimes dry, sometimes oily' },
      { id: 'q3_5', label: 'Not sure' },
    ],
  },
  {
    id: 4,
    questionNumber: 4,
    section: 'B',
    sectionTitle: 'Dryness and moisture-related symptoms',
    question: 'After washing your face, how often does your skin feel tight or uncomfortable?',
    measures:
      'Measures: Tightness, a reported symptom associated with dryness. Cleanser irritation can also cause tightness, so this cannot identify dry skin on its own.',
    choices: [
      { id: 'q4_1', label: 'Never' },
      { id: 'q4_2', label: 'Rarely' },
      { id: 'q4_3', label: 'Sometimes' },
      { id: 'q4_4', label: 'Often' },
      { id: 'q4_5', label: 'Not sure' },
    ],
  },
  {
    id: 5,
    questionNumber: 5,
    section: 'B',
    sectionTitle: 'Dryness and moisture-related symptoms',
    question: 'How often do you notice dry, flaky, or rough patches on your face?',
    measures:
      'Measures: Visible or felt dryness. These are recognized symptoms in AAD clinical guidance.',
    choices: [
      { id: 'q5_1', label: 'Never' },
      { id: 'q5_2', label: 'Rarely' },
      { id: 'q5_3', label: 'Sometimes' },
      { id: 'q5_4', label: 'Often' },
      { id: 'q5_5', label: 'Not sure' },
    ],
  },
  {
    id: 6,
    questionNumber: 6,
    section: 'B',
    sectionTitle: 'Dryness and moisture-related symptoms',
    question: 'On a typical day, how often does your face become noticeably shiny or greasy?',
    measures:
      'Measures: Frequency of perceived excess oil production. This provides a second oiliness indicator for comparison with dryness symptoms.',
    choices: [
      { id: 'q6_1', label: 'Never' },
      { id: 'q6_2', label: 'Rarely' },
      { id: 'q6_3', label: 'Sometimes' },
      { id: 'q6_4', label: 'Often' },
      { id: 'q6_5', label: 'Not sure' },
    ],
  },
  {
    id: 7,
    questionNumber: 7,
    section: 'B',
    sectionTitle: 'Dryness and moisture-related symptoms',
    question: 'If your face feels dry, where do you usually notice it?',
    measures:
      'Measures: Regional dryness. Combined with Q2 and Q3, this can help separate combination skin from widespread dryness.',
    choices: [
      { id: 'q7_1', label: 'Cheeks' },
      { id: 'q7_2', label: 'Forehead, nose, or chin' },
      { id: 'q7_3', label: 'Both T-zone and cheeks' },
      { id: 'q7_4', label: 'I do not usually experience facial dryness' },
      { id: 'q7_5', label: 'Not sure' },
    ],
  },
  {
    id: 8,
    questionNumber: 8,
    section: 'C',
    sectionTitle: 'Acne tendency',
    question: 'During the past three months, how often have you developed new pimples or acne breakouts?',
    measures:
      'Measures: Self-reported breakout frequency. The three-month observation window is our proposed design choice, not an externally validated cutoff for acne-prone skin.',
    choices: [
      { id: 'q8_1', label: 'Never' },
      { id: 'q8_2', label: 'Less than once a month' },
      { id: 'q8_3', label: 'A few times a month' },
      { id: 'q8_4', label: 'About once a week' },
      { id: 'q8_5', label: 'Several times a week or more' },
      { id: 'q8_6', label: 'Not sure' },
    ],
  },
  {
    id: 9,
    questionNumber: 9,
    section: 'C',
    sectionTitle: 'Acne tendency',
    question: 'Which of the following acne-related concerns have you experienced repeatedly?',
    isMultiSelect: true,
    measures:
      'Measures: Reported acne lesion characteristics. Blackheads, whiteheads, inflamed pimples, and deep bumps are recognized clinical acne presentations.',
    choices: [
      { id: 'q9_1', label: 'Blackheads' },
      { id: 'q9_2', label: 'Whiteheads' },
      { id: 'q9_3', label: 'Red or inflamed pimples' },
      { id: 'q9_4', label: 'Deep or painful bumps' },
      { id: 'q9_5', label: 'None of these' },
      { id: 'q9_6', label: 'Not sure' },
    ],
  },
  {
    id: 10,
    questionNumber: 10,
    section: 'C',
    sectionTitle: 'Acne tendency',
    question: 'Do acne breakouts tend to return even after your skin becomes clear?',
    measures:
      'Measures: Recurrent acne tendency. Useful as supporting history, but this specific wording and response scale need validation for AureSkin.',
    choices: [
      { id: 'q10_1', label: 'No, rarely or never' },
      { id: 'q10_2', label: 'Yes, occasionally' },
      { id: 'q10_3', label: 'Yes, repeatedly over several months' },
      { id: 'q10_4', label: 'Not sure' },
    ],
  },
];

export const MOCK_DEFAULT_ANSWERS: Record<number, QuestionnaireAnswer> = {
  1: { questionId: 1, selectedChoiceId: 'q1_2', selectedChoiceLabel: 'Comfortable and balanced' },
  2: { questionId: 2, selectedChoiceId: 'q2_4', selectedChoiceLabel: 'My face usually does not become oily' },
  3: { questionId: 3, selectedChoiceId: 'q3_3', selectedChoiceLabel: 'Similar and comfortable across my face' },
  4: { questionId: 4, selectedChoiceId: 'q4_1', selectedChoiceLabel: 'Never' },
  5: { questionId: 5, selectedChoiceId: 'q5_1', selectedChoiceLabel: 'Never' },
  6: { questionId: 6, selectedChoiceId: 'q6_1', selectedChoiceLabel: 'Never' },
  7: { questionId: 7, selectedChoiceId: 'q7_4', selectedChoiceLabel: 'I do not usually experience facial dryness' },
  8: { questionId: 8, selectedChoiceId: 'q8_1', selectedChoiceLabel: 'Never' },
  9: { questionId: 9, selectedChoiceId: 'q9_5', selectedChoiceLabel: 'None of these' },
  10: { questionId: 10, selectedChoiceId: 'q10_1', selectedChoiceLabel: 'No, rarely or never' },
};

export const MOCK_SETUP_PHOTOS: SetupPhotos = {
  front: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  left: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  right: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
};

