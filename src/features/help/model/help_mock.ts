import { HelpData } from './help_types';

export const MOCK_HELP_DATA: HelpData = {
  guides: [
    {
      id: 'guide-scan',
      category: 'scan',
      title: 'Skin Scan Best Practices',
      summary:
        'Capture consistent facial images for reliable sebum and condition predictions.',
      steps: [
        'Take photos in neutral, indirect daylight facing a window.',
        'Clean your skin prior to analysis to avoid false oil readings.',
        'Keep a neutral facial expression and hold camera 8–12 inches away.',
      ],
      iconType: 'camera',
    },
    {
      id: 'guide-ingredients',
      category: 'ingredients',
      title: 'Ingredient Compatibility & Safety',
      summary:
        'Understand active interactions to protect your skin barrier against irritation.',
      steps: [
        'Review the Incompatible Pairs tab after every scan.',
        'Avoid pairing strong actives (e.g., Retinol + Glycolic Acid) in the same routine.',
        'Tap any ingredient card in the Library for localized safety indications.',
      ],
      iconType: 'sparkles',
    },
    {
      id: 'guide-routine',
      category: 'routine',
      title: 'Routine Customization',
      summary:
        'Personalize morning and evening regimens tailored to your latest scan.',
      steps: [
        'Tap any routine card to view active ingredients and application sequence.',
        'Swap recommended products with compatible alternatives from your Library.',
        'Mark products as favorites to quickly populate custom routine steps.',
      ],
      iconType: 'sliders',
    },
  ],
  diagnostics: [
    {
      id: 'diag-ai',
      label: 'AI Skin Analysis Engine',
      status: 'ready',
      statusText: 'MobileNetV3 Loaded (Ready)',
    },
    {
      id: 'diag-db',
      label: 'Cloud Database & Storage',
      status: 'online',
      statusText: 'Supabase Cloud Sync (Online)',
    },
    {
      id: 'diag-mesh',
      label: 'Facial Landmark Detection',
      status: 'active',
      statusText: 'MediaPipe 468-Point Mesh (Active)',
    },
  ],
  support: {
    email: 'support@aureskin.app',
    responseTime: '24 to 48 hours',
    faqHint:
      'Looking for common questions? Check the dedicated FAQ carousel right on your Home dashboard.',
  },
};

