export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'moisturizer'
  | 'sunscreen'
  | 'serum'
  | 'other';

export const PRODUCT_CATEGORY_IMAGES: Record<string, number> = {
  cleanser: require('../../../assets/images/library_cleanser.png'),
  cleansers: require('../../../assets/images/library_cleanser.png'),
  toner: require('../../../assets/images/library_toner.png'),
  toners: require('../../../assets/images/library_toner.png'),
  serum: require('../../../assets/images/library_serum&treatment.png'),
  serums: require('../../../assets/images/library_serum&treatment.png'),
  'serum & treatment': require('../../../assets/images/library_serum&treatment.png'),
  'serums & treatments': require('../../../assets/images/library_serum&treatment.png'),
  'serum / treatment': require('../../../assets/images/library_serum&treatment.png'),
  treatment: require('../../../assets/images/library_serum&treatment.png'),
  treatments: require('../../../assets/images/library_serum&treatment.png'),
  moisturizer: require('../../../assets/images/library_moisturizer.png'),
  moisturizers: require('../../../assets/images/library_moisturizer.png'),
  sunscreen: require('../../../assets/images/library_sunscreen.png'),
  sunscreens: require('../../../assets/images/library_sunscreen.png'),
  other: require('../../../assets/images/library_others.png'),
  others: require('../../../assets/images/library_others.png'),
};

/**
 * Normalizes any category string into one of AureSkin's canonical category keys:
 * 'cleanser' | 'toner' | 'moisturizer' | 'sunscreen' | 'serum' | 'other'.
 * Any category outside the standard 5 categories (e.g. 'essence', 'oil', etc.) is mapped to 'other'.
 */
export function toCanonicalCategory(category: string | null | undefined): ProductCategory {
  if (!category) return 'other';
  const normalized = category.toLowerCase().trim();

  switch (normalized) {
    case 'cleanser':
    case 'cleansers':
      return 'cleanser';
    case 'toner':
    case 'toners':
      return 'toner';
    case 'moisturizer':
    case 'moisturizers':
      return 'moisturizer';
    case 'sunscreen':
    case 'sunscreens':
      return 'sunscreen';
    case 'serum':
    case 'serums':
    case 'treatment':
    case 'treatments':
    case 'serum & treatment':
    case 'serums & treatments':
    case 'serum / treatment':
      return 'serum';
    default:
      return 'other';
  }
}

/**
 * Returns the corresponding illustration asset for a product category.
 * Falls back to library_others.png if the category is unspecified, unknown, or outside the 5 standard categories.
 */
export function getProductCategoryImage(category: string | null | undefined): number {
  const canonical = toCanonicalCategory(category);
  return PRODUCT_CATEGORY_IMAGES[canonical] ?? PRODUCT_CATEGORY_IMAGES.other;
}

/**
 * Normalizes any category string into one of the canonical AureSkin display labels:
 * - 'Cleanser'
 * - 'Toner'
 * - 'Moisturizer'
 * - 'Sunscreen'
 * - 'Serum / Treatment'
 * - 'Other' (all products that fall outside the standard list, e.g. essences, oils, masks)
 */
export function formatCategory(category: string | null | undefined): string {
  const canonical = toCanonicalCategory(category);

  switch (canonical) {
    case 'cleanser':
      return 'Cleanser';
    case 'toner':
      return 'Toner';
    case 'moisturizer':
      return 'Moisturizer';
    case 'sunscreen':
      return 'Sunscreen';
    case 'serum':
      return 'Serum / Treatment';
    case 'other':
    default:
      return 'Other';
  }
}
