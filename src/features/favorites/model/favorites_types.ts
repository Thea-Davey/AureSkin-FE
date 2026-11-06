import { Ingredient, ProductListItemModel, Product } from '@/features/library/model/library_types';

export type FavoriteType = 'ingredient' | 'product';
export type FavoriteFilter = 'all' | 'products' | 'ingredients';

export interface FavoriteIngredientItem {
  type: 'ingredient';
  id: string;
  ingredient: Ingredient;
  isCompatible?: boolean;
}

export interface FavoriteProductItem {
  type: 'product';
  id: string;
  productItem?: ProductListItemModel;
  product?: Product;
  isCompatible?: boolean;
}

export type FavoriteItem = FavoriteIngredientItem | FavoriteProductItem;

export interface FavoriteCounts {
  all: number;
  products: number;
  ingredients: number;
}

