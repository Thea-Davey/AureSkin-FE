export interface Ingredient {
  id: string;
  name: string;
  scientific_name?: string | null;
  preview_description?: string | null;
  short_description?: string | null;
  description: string | null;
  what_is_it?: string | null;
  what_does_it_do?: string | null;
  who_is_it_good_for?: string | null;
  who_should_avoid?: string | null;
  url?: string | null;
  benefits: string | null;
  skin_types: string[];
  skin_conditions?: string[];
  caution: string | null;
  good_for?: string[];
  avoid?: string[];
  [key: string]: unknown; // Allow any future Supabase columns without stripping
}

export interface IngredientSection {
  title: string;
  data: Ingredient[];
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

import { ProductCategory } from '../../../shared/utils/productCategory';
export type { ProductCategory };

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  type?: string | null;
  country?: string | null;
  description: string | null;
  image_url: string | null;
  raw_ingredients?: string | null;
  after_use?: string | null;
  skin_types?: string[] | null;
  skin_conditions?: string[] | null;
  is_user_added: boolean;
  added_by?: string | null;
  created_at?: string | null;
  [key: string]: unknown; // Allow any future Supabase columns without stripping
}


export interface ProductIngredient {
  id: string;
  name: string;
  order: number;
}

export interface ProductDetail extends Product {
  ingredients: ProductIngredient[];
  good_for?: string[];
  compatible_skin_types?: string[];
  target_skin_conditions?: string[];
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
  isCompatible?: boolean;
}
