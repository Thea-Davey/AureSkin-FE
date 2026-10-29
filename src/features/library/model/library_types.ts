export interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  benefits: string | null;
  skin_types: string[];
  caution: string | null;
  what_is_it?: string | null;
  good_for?: string[];
  avoid?: string[];
}

export type IngredientCompatibilityStatus =
  | 'compatible'
  | 'not_listed'
  | 'scan_needed'
  | 'unavailable';

export interface IngredientPage {
  items: Ingredient[];
  nextOffset: number | null;
}

export interface IngredientQuery {
  q: string;
  limit: number;
  offset: number;
}

export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'moisturizer'
  | 'sunscreen'
  | 'serum'
  | 'other';

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  image_url: string | null;
  is_user_added: boolean;
}

export type ProductCameraFacing = 'back' | 'front';

export interface CapturedProductPhoto {
  uri: string;
  width: number;
  height: number;
}

export interface ProductIngredient {
  id: string;
  name: string;
  order: number;
}

export interface ProductDetail extends Product {
  ingredients: ProductIngredient[];
  good_for?: string[];
}

export type ProductCompatibilityStatus =
  | 'compatible'
  | 'review'
  | 'scan_needed'
  | 'unavailable';

export interface ProductPage {
  items: Product[];
  nextOffset: number | null;
}

export interface ProductQuery {
  q: string;
  category: ProductCategory | null;
  limit: number;
  offset: number;
}

export type ProductListFilter = 'all' | 'favorites';

export type ProductFilterTarget = 'category' | 'list';

export interface ProductListItemModel {
  product: Product;
  isFavorite: boolean;
}
