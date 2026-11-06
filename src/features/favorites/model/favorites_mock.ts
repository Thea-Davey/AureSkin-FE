import { FavoriteItem } from './favorites_types';

export const MOCK_FAVORITE_ITEMS: FavoriteItem[] = [
  {
    type: 'ingredient',
    id: 'fav-ing-1',
    ingredient: {
      id: 'ing-1',
      name: 'Niacinamide (Vitamin B3)',
      preview_description:
        'Strengthens skin barrier function and visibly balances sebum production without overdrying.',
      description:
        'A multifunctional skincare active that strengthens epidermal barrier function, reduces trans-epidermal water loss (TEWL), and regulates sebum excretion.',
      benefits: 'Strengthens moisture barrier, minimizes enlarged pores, regulates oil, and calms redness.',
      skin_types: ['Oily', 'Combination', 'Sensitive', 'Normal'],
      caution: 'Avoid pairing with pure high-concentration ascorbic acid formulas concurrently.',
      what_is_it: 'Water-soluble form of Vitamin B3 that works with natural skin enzymes.',
      good_for: ['Enlarged pores', 'Redness', 'Excess sebum'],
      avoid: ['High-percentage direct acids'],
    },
    isCompatible: true,
  },
  {
    type: 'product',
    id: 'fav-prod-1',
    product: {
      id: 'prod-1',
      name: 'Hydrating Facial Cleanser',
      brand: 'CeraVe',
      category: 'Cleanser',
      description:
        'A non-foaming hydrating lotion cleanser developed with dermatologists that cleanses and hydrates without disrupting the protective barrier.',
      image_url: null,
      is_user_added: false,
    },
    isCompatible: true,
  },
  {
    type: 'ingredient',
    id: 'fav-ing-2',
    ingredient: {
      id: 'ing-2',
      name: 'Hyaluronic Acid',
      preview_description:
        'Powerful natural humectant that draws deep moisture into the stratum corneum for supple skin.',
      description:
        'High and low molecular weight glycosaminoglycan capable of binding up to 1000 times its molecular weight in water, promoting intense hydration.',
      benefits: 'Draws moisture to surface layers, smooths fine lines, and promotes skin elasticity.',
      skin_types: ['Dry', 'Normal', 'Combination', 'Sensitive'],
      caution: 'Always apply onto slightly damp skin before heavy occlusive moisturizers.',
      what_is_it: 'Naturally occurring substance in human connective tissue and skin matrix.',
      good_for: ['Dehydration', 'Dry patches', 'Fine dryness lines'],
      avoid: [],
    },
    isCompatible: true,
  },
  {
    type: 'product',
    id: 'fav-prod-2',
    product: {
      id: 'prod-2',
      name: 'Anthelios UV Mineral Sunscreen SPF 50',
      brand: 'La Roche-Posay',
      category: 'Sunscreen',
      description:
        '100% physical mineral sunscreen formulated with zinc oxide and titanium dioxide for sensitive, post-procedure skin.',
      image_url: null,
      is_user_added: false,
    },
    isCompatible: true,
  },
  {
    type: 'ingredient',
    id: 'fav-ing-3',
    ingredient: {
      id: 'ing-3',
      name: 'Centella Asiatica (Cica)',
      preview_description:
        'Potent herbal extract that calms inflamed skin, reduces redness, and accelerates healing.',
      description:
        'Contains active madecassoside and asiatic acid compounds that reduce cutaneous erythema and accelerate re-epithelialization.',
      benefits: 'Anti-inflammatory, speeds skin repair, soothes irritation and barrier breakdown.',
      skin_types: ['Sensitive', 'Acne-Prone', 'All Skin Types'],
      caution: null,
      what_is_it: 'Traditional medicinal herb native to Asian wetlands known for reparative properties.',
      good_for: ['Barrier damage', 'Redness', 'Post-inflammatory marks'],
      avoid: [],
    },
    isCompatible: true,
  },
  {
    type: 'product',
    id: 'fav-prod-3',
    product: {
      id: 'prod-3',
      name: 'Lipikar Balm AP+M Moisture Therapy',
      brand: 'La Roche-Posay',
      category: 'Moisturizer',
      description:
        'Intensive triple-repair lipid-replenishing body and face cream for very dry, eczema-prone skin.',
      image_url: null,
      is_user_added: false,
    },
    isCompatible: true,
  },
];
