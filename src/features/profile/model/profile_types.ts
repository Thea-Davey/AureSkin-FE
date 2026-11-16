export type GenderOption = 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';

export const GENDER_OPTIONS: GenderOption[] = [
  'Female',
  'Male',
  'Non-binary',
  'Prefer not to say',
];

export const COMMON_ALLERGENS: string[] = [
  'Fragrance',
  'Essential Oils',
  'Tea Tree Oil',
  'Lavender Oil',
  'Citrus Oils / Extracts',
  'Parabens',
  'Formaldehyde Releasers',
  'MI / MCI',
  'Chemical Sunscreens / Oxybenzone',
  'Lanolin & Derivatives',
  'Propolis & Beeswax',
  'Nut-Derived Oils (Almond / Macadamia)',
  'Soy & Soy Isoflavones',
  'Propylene Glycol',
  'Sulfates (SLS / SLES)',
  'Benzoyl Peroxide',
];

export interface CommonAllergy {
  code: string;
  name: string;
  category: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phoneNumber: string;
  gender: GenderOption | '';
  dateOfBirth: string; // YYYY-MM-DD
  age: number | string;
  ageGroup?: string;
  ageGroupLabel?: string;
  avatarUri: string | null;
  skinType: string;
  healthScore: number;
  skinConditions: string[];
  allergens: string[];
  isPregnant?: boolean;
}

export interface EditProfileDraft {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  email: string;
  phoneNumber: string;
  allergens: string[];
  isPregnant: boolean;
  avatarUri: string | null;
}

