import { FAQ } from './home_types';

export const STATIC_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How does the app analyze my skin and generate personalized skincare recommendations?',
    answer:
      'AureSkin uses trained computer vision models to assess visible facial features (sebum balance, texture, and active breakouts) to determine your skin type and detect conditions. It then applies rule-based dermatological algorithms to curate personalized product steps and active ingredients matching your profile.',
  },
  {
    id: 'faq-2',
    question: 'What should I do if my skin condition changes after using the recommended routine?',
    answer:
      'Skin reacts dynamically to weather, hormonal shifts, and active ingredients. Perform a new scan in the app so AureSkin can detect improvements or new concerns (e.g. skin redness or dryness) and automatically adjust your morning and evening routine recommendations.',
  },
  {
    id: 'faq-3',
    question: 'What skin concerns can the app detect during the skin-analysis process?',
    answer:
      'The model is trained to detect various acne types (papules, pustules, comedones, nodules), erythema (skin redness), dark spots and hyperpigmentation, fine lines, and enlarged pores, while providing an overall 0–100% Skin Health Score.',
  },
  {
    id: 'faq-4',
    question: 'Can AureSkin diagnose clinical or medical skin diseases?',
    answer:
      'No. AureSkin is an AI-assisted cosmetic and educational research tool designed for skin monitoring and routine recommendations. It is not a substitute for clinical dermatological diagnosis. For medical skin conditions, always consult a dermatologist.',
  },
];

export const SKIN_TEST_GUIDANCE = {
  title: 'Skin Test Guide Tip',
  description:
    'To ensure accurate and reliable skin analysis results, follow these steps before scanning your face!',
  steps: [
    'Cleanse your face thoroughly to remove dirt, excess sebum, and makeup.',
    'Stand in front of bright, even, natural indirect lighting; avoid backlighting.',
    'Keep a relaxed, neutral facial expression and pull hair back from your forehead.',
    'Hold your phone at eye level, roughly 12 to 18 inches away from your face.',
  ],
};
