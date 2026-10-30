import { api } from '../../../shared/services/api';
import {
  Ingredient,
  IngredientPage,
  IngredientQuery,
  Product,
  ProductDetail,
  ProductIngredient,
  ProductPage,
  ProductQuery,
} from './library_types';
import { MOCK_INGREDIENTS, MOCK_PRODUCTS, MOCK_PRODUCT_DETAILS } from './library_mock';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Library screen features (ingredient
// and product browsing, detail views, search, and pagination).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

const MOCK_ADDED_PRODUCTS: ProductDetail[] = [];

export function addMockProduct(input: {
  name: string;
  description: string;
  ingredients: string[];
}): ProductDetail {
  if (!USE_MOCK) {
    throw new Error('Mock product creation is only available while Library mock mode is enabled.');
  }

  const id = `mock-user-product-${Date.now()}-${MOCK_ADDED_PRODUCTS.length + 1}`;
  const product: ProductDetail = {
    id,
    name: input.name.trim(),
    brand: null,
    category: 'other',
    description: input.description.trim() || null,
    image_url: null,
    is_user_added: true,
    ingredients: input.ingredients.map((name, order) => ({
      id: `${id}-ingredient-${order + 1}`,
      name,
      order,
    })),
  };

  MOCK_ADDED_PRODUCTS.unshift(product);
  return product;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Ingredient response is missing a valid "${key}" field.`);
  }
  return value;
}

function nullableString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`Ingredient response has an invalid "${key}" field.`);
  }
  return value;
}

function normalizeIngredient(value: unknown): Ingredient {
  if (!isRecord(value)) {
    throw new Error('Ingredient response contains an invalid item.');
  }

  const skinTypes = value.skin_types;
  const goodFor = value.good_for;
  const avoid = value.avoid;
  for (const [field, fieldValue] of [
    ['skin_types', skinTypes],
    ['good_for', goodFor],
    ['avoid', avoid],
  ] as const) {
    if (fieldValue !== undefined && fieldValue !== null && (
      !Array.isArray(fieldValue) || !fieldValue.every((item) => typeof item === 'string')
    )) {
      throw new Error(`Ingredient response has an invalid "${field}" field.`);
    }
  }

  return {
    id: requiredString(value, 'id'),
    name: requiredString(value, 'name'),
    preview_description: nullableString(value, 'preview_description'),
    description: nullableString(value, 'description'),
    benefits: nullableString(value, 'benefits'),
    skin_types: Array.isArray(skinTypes) ? skinTypes : [],
    caution: nullableString(value, 'caution'),
    what_is_it: nullableString(value, 'what_is_it'),
    good_for: Array.isArray(goodFor) ? goodFor : undefined,
    avoid: Array.isArray(avoid) ? avoid : undefined,
  };
}

function getNextOffset(offset: number, limit: number, items: Ingredient[]): number | null {
  return items.length === limit ? offset + items.length : null;
}

function getNextProductOffset(offset: number, limit: number, items: Product[]): number | null {
  return items.length === limit ? offset + items.length : null;
}

export async function fetchIngredients(
  params: IngredientQuery
): Promise<IngredientPage> {
  const { q, limit, offset } = params;

  if (USE_MOCK) {
    const normalizedQuery = q.trim().toLocaleLowerCase();
    const matchingItems = MOCK_INGREDIENTS.filter((ingredient) =>
      ingredient.name.toLocaleLowerCase().includes(normalizedQuery)
    );
    const items = matchingItems.slice(offset, offset + limit);

    return {
      items,
      nextOffset: getNextOffset(offset, limit, items),
    };
  }

  const response = await api.get<unknown>('/ingredients', {
    params: { q, limit, offset },
  });

  if (!isRecord(response.data) || !isRecord(response.data.data)) {
    throw new Error('The ingredient service returned an unexpected response.');
  }

  const rawItems = response.data.data.items;
  if (!Array.isArray(rawItems)) {
    throw new Error('The ingredient service response did not contain an item list.');
  }

  const items = rawItems.map(normalizeIngredient);
  return {
    items,
    nextOffset: getNextOffset(offset, limit, items),
  };
}

export async function fetchIngredientById(id: string): Promise<Ingredient> {
  if (!id.trim()) {
    throw new Error('An ingredient ID is required.');
  }

  if (USE_MOCK) {
    const ingredient = MOCK_INGREDIENTS.find((item) => item.id === id);
    if (!ingredient) {
      throw new Error('This ingredient could not be found.');
    }
    return ingredient;
  }

  const response = await api.get<unknown>(`/ingredients/${encodeURIComponent(id)}`);
  if (!isRecord(response.data) || !isRecord(response.data.data)) {
    throw new Error('The ingredient service returned an unexpected detail response.');
  }

  return normalizeIngredient(response.data.data);
}

function requiredProductString(record: Record<string, unknown>, key: string): string {
  const fieldValue = record[key];
  if (typeof fieldValue !== 'string' || fieldValue.length === 0) {
    throw new Error(`Product response is missing a valid "${key}" field.`);
  }
  return fieldValue;
}

function nullableProductString(
  record: Record<string, unknown>,
  key: string
): string | null {
  const fieldValue = record[key];
  if (fieldValue === null || fieldValue === undefined) {
    return null;
  }
  if (typeof fieldValue !== 'string') {
    throw new Error(`Product response has an invalid "${key}" field.`);
  }
  return fieldValue;
}

function normalizeProduct(value: unknown): Product {
  if (!isRecord(value)) {
    throw new Error('Product response contains an invalid item.');
  }

  const imageUrl = nullableProductString(value, 'image_url');
  const brand = nullableProductString(value, 'brand');
  const description = nullableProductString(value, 'description');
  const isUserAdded = value.is_user_added;
  if (isUserAdded !== undefined && typeof isUserAdded !== 'boolean') {
    throw new Error('Product response has an invalid "is_user_added" field.');
  }

  return {
    id: requiredProductString(value, 'id'),
    name: requiredProductString(value, 'name'),
    brand,
    category: requiredProductString(value, 'category'),
    description,
    image_url: imageUrl,
    is_user_added: isUserAdded ?? false,
  };
}

function normalizeProductIngredient(value: unknown): ProductIngredient {
  if (!isRecord(value)) {
    throw new Error('Product detail contains an invalid ingredient item.');
  }

  const joinedIngredient = isRecord(value.ingredient)
    ? value.ingredient
    : isRecord(value.ingredients)
      ? value.ingredients
      : null;
  const ingredientId = joinedIngredient?.id
    ?? value.ingredient_id
    ?? value.id;
  const ingredientName = joinedIngredient?.name ?? value.name;
  const order = value.order;

  if (typeof ingredientId !== 'string' || ingredientId.length === 0) {
    throw new Error('Product detail contains an ingredient without a valid ID.');
  }
  if (typeof ingredientName !== 'string' || ingredientName.length === 0) {
    throw new Error('Product detail contains an ingredient without a valid name.');
  }
  if (typeof order !== 'number' || !Number.isInteger(order) || order < 0) {
    throw new Error('Product detail contains an ingredient with an invalid label order.');
  }

  return { id: ingredientId, name: ingredientName, order };
}

function normalizeProductDetail(value: unknown, requestedId: string): ProductDetail {
  if (!isRecord(value)) {
    throw new Error('Product detail response contains an invalid item.');
  }

  const productRecord = isRecord(value.product) ? value.product : value;
  const product = normalizeProduct(productRecord);
  if (product.id !== requestedId) {
    throw new Error('The product service returned details for a different product.');
  }

  const rawIngredients = value.ingredients
    ?? value.product_ingredients
    ?? productRecord.ingredients
    ?? productRecord.product_ingredients;
  if (!Array.isArray(rawIngredients)) {
    throw new Error('Product detail response did not contain its ingredient list.');
  }

  const ingredients = rawIngredients
    .map(normalizeProductIngredient)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));

  const rawGoodFor = productRecord.good_for ?? value.good_for;
  if (
    rawGoodFor !== undefined
    && rawGoodFor !== null
    && (
      !Array.isArray(rawGoodFor)
      || !rawGoodFor.every((item) => typeof item === 'string' && item.trim().length > 0)
    )
  ) {
    throw new Error('Product detail response contains an invalid "good_for" list.');
  }

  return {
    ...product,
    ingredients,
    good_for: Array.isArray(rawGoodFor) ? rawGoodFor : undefined,
  };
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  if (!id.trim()) {
    throw new Error('A product ID is required.');
  }

  if (USE_MOCK) {
    const product = MOCK_ADDED_PRODUCTS.find((item) => item.id === id)
      ?? MOCK_PRODUCT_DETAILS.find((item) => item.id === id);
    if (!product) {
      throw new Error('This product could not be found.');
    }
    return product;
  }

  const response = await api.get<unknown>(`/products/${encodeURIComponent(id)}`);
  if (!isRecord(response.data) || !isRecord(response.data.data)) {
    throw new Error('The product service returned an unexpected detail response.');
  }

  return normalizeProductDetail(response.data.data, id);
}

export async function fetchProducts(params: ProductQuery): Promise<ProductPage> {
  const { q, category, limit, offset } = params;

  if (USE_MOCK) {
    const normalizedQuery = q.trim().toLocaleLowerCase();
    const matchingItems = [...MOCK_ADDED_PRODUCTS, ...MOCK_PRODUCTS].filter((product) => {
      const matchesQuery = normalizedQuery.length === 0
        || product.name.toLocaleLowerCase().includes(normalizedQuery)
        || product.brand?.toLocaleLowerCase().includes(normalizedQuery);
      const matchesCategory = category === null || product.category === category;
      return matchesQuery && matchesCategory;
    });
    const items = matchingItems.slice(offset, offset + limit);

    return {
      items,
      nextOffset: getNextProductOffset(offset, limit, items),
    };
  }

  const response = await api.get<unknown>('/products', {
    params: { q, category, limit, offset },
  });

  if (!isRecord(response.data) || !isRecord(response.data.data)) {
    throw new Error('The product service returned an unexpected response.');
  }

  const rawItems = response.data.data.items;
  if (!Array.isArray(rawItems)) {
    throw new Error('The product service response did not contain an item list.');
  }

  const items = rawItems.map(normalizeProduct);
  return {
    items,
    nextOffset: getNextProductOffset(offset, limit, items),
  };
}
