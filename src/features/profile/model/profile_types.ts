export type GenderOption = 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';

export const GENDER_OPTIONS: GenderOption[] = [
  'Female',
  'Male',
  'Non-binary',
  'Prefer not to say',
];

export const COMMON_ALLERGENS: string[] = [
  'Fragrance',
  'Sulfates (SLS/SLES)',
  'Parabens',
  'Essential Oils',
  'Denatured Alcohol',
  'Retinoids',
  'Salicylic Acid (BHA)',
  'Benzoyl Peroxide',
  'Lanolin',
  'Propylene Glycol',
];

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
  avatarUri: string | null;
  skinType: string;
  healthScore: number;
  skinConditions: string[];
  allergens: string[];
}

export interface EditProfileDraft {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  email: string;
  phoneNumber: string;
  allergens: string[];
  avatarUri: string | null;
}

