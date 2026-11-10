import { api } from '../../../shared/services/api';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { getCachedIngredients, getCachedProducts } from '../../../shared/storage/catalogStorage';
import {
  Ingredient,
  IngredientPage,
  IngredientQuery,
  Product,
  ProductCategory,
  ProductDetail,
  ProductIngredient,
  ProductPage,
  ProductQuery,
} from './library_types';
import { MOCK_INGREDIENTS, MOCK_PRODUCTS, MOCK_PRODUCT_DETAILS } from './library_mock';
import { toCanonicalCategory } from '../../../shared/utils/productCategory';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Library screen features (ingredient
// and product browsing, detail views, search, and pagination).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export function isLibraryMock(): boolean {
  return isMockEnabled('library');
}

export const USE_MOCK: boolean = isMockEnabled('library');
// ============================================================================

const MOCK_ADDED_PRODUCTS: ProductDetail[] = [];

export function addMockProduct(input: {
  name: string;
  description: string;
  category?: ProductCategory;
  ingredients: string[];
  skinTypes?: string[];
  skinConditions?: string[];
}): ProductDetail {
  if (!isMockEnabled('library')) {
    throw new Error('Mock product creation is only available while Library mock mode is enabled.');
  }

  const id = `mock-user-product-${Date.now()}-${MOCK_ADDED_PRODUCTS.length + 1}`;
  const product: ProductDetail = {
    id,
    name: input.name.trim(),
    brand: null,
    category: input.category || 'other',
    description: input.description.trim() || null,
    image_url: null,
    is_user_added: true,
    compatible_skin_types: input.skinTypes && input.skinTypes.length > 0 ? input.skinTypes : undefined,
    target_skin_conditions: input.skinConditions && input.skinConditions.length > 0 ? input.skinConditions : undefined,
    good_for: input.skinConditions && input.skinConditions.length > 0 ? input.skinConditions : undefined,
    ingredients: input.ingredients.map((name, order) => ({
      id: `${id}-ingredient-${order + 1}`,
      name,
      order,
    })),
  };

  MOCK_ADDED_PRODUCTS.unshift(product);
  return product;
}

export function deleteMockProduct(id: string): void {
  const addedIndex = MOCK_ADDED_PRODUCTS.findIndex((item) => item.id === id);
  if (addedIndex !== -1) {
    MOCK_ADDED_PRODUCTS.splice(addedIndex, 1);
    return;
  }
  const mockProductIndex = MOCK_PRODUCTS.findIndex((item) => item.id === id);
  if (mockProductIndex !== -1) {
    MOCK_PRODUCTS.splice(mockProductIndex, 1);
  }
  const mockDetailIndex = MOCK_PRODUCT_DETAILS.findIndex((item) => item.id === id);
  if (mockDetailIndex !== -1) {
    MOCK_PRODUCT_DETAILS.splice(mockDetailIndex, 1);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!id.trim()) {
    throw new Error('A product ID is required.');
  }

  if (isMockEnabled('library')) {
    console.log('[Library API] Using MOCK mode');
    deleteMockProduct(id);
    return;
  }

  await api.delete(`/products/${encodeURIComponent(id)}`);
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

function parseStringList(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const cleaned = trimmed.replace(/'/g, '"');
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {
        const matches = trimmed.match(/['"]([^'"]+)['"]/g);
        if (matches) {
          return matches.map((m) => m.replace(/['"]/g, '').trim()).filter(Boolean);
        }
      }
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function cleanIngredientDescription(rawText: string | null | undefined): string | null {
  if (!rawText || !rawText.trim()) return null;
  const paragraphs = rawText
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Filter out category-level boilerplate paragraphs
  const filtered = paragraphs.filter((p) => {
    return !/\b(are a class of ingredients|is in a class of prebiotic|class of prebiotic ingredients|group of naturally occurring substances)\b/i.test(p);
  });

  if (filtered.length > 0) {
    return filtered[0];
  }
  return paragraphs[0] ?? null;
}

function normalizeIngredient(value: unknown): Ingredient {
  if (!isRecord(value)) {
    throw new Error('Ingredient response contains an invalid item.');
  }

  const skinTypes = parseStringList(value.skin_types);
  const skinConditions = parseStringList(value.skin_conditions);
  const rawAvoid = value.avoid ?? value.who_should_avoid;
  const avoid = parseStringList(rawAvoid);
  const goodFor = parseStringList(value.good_for ?? value.who_is_it_good_for);

  const rawDescription = nullableString(value, 'description') ?? nullableString(value, 'short_description');
  const cleanedDescription = cleanIngredientDescription(rawDescription);

  return {
    ...value,
    id: requiredString(value, 'id'),
    name: requiredString(value, 'name'),
    preview_description: nullableString(value, 'preview_description'),
    description: cleanedDescription,
    short_description: nullableString(value, 'short_description'),
    what_is_it: nullableString(value, 'what_is_it'),
    what_does_it_do: nullableString(value, 'what_does_it_do'),
    who_is_it_good_for: nullableString(value, 'who_is_it_good_for'),
    who_should_avoid: nullableString(value, 'who_should_avoid'),
    url: nullableString(value, 'url'),
    benefits: nullableString(value, 'benefits') ?? nullableString(value, 'what_does_it_do'),
    skin_types: skinTypes,
    skin_conditions: skinConditions.length > 0 ? skinConditions : undefined,
    caution: nullableString(value, 'caution'),
    good_for: goodFor.length > 0 ? goodFor : undefined,
    avoid: avoid.length > 0 ? avoid : undefined,
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

  if (isMockEnabled('library')) {
    console.log('[Library API] Using MOCK mode');
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

  console.log('[Library API] fetchIngredients: Requesting LIVE backend at', api.defaults.baseURL);
  const response = await api.get<unknown>('/ingredients', {
    params: { q, limit, offset },
  });

  const rawPayload = (response.data as any)?.data;
  let rawItems: unknown[] = [];
  if (Array.isArray(rawPayload)) {
    rawItems = rawPayload;
  } else if (rawPayload && typeof rawPayload === 'object' && Array.isArray(rawPayload.items)) {
    rawItems = rawPayload.items;
  } else {
    throw new Error('The ingredient service returned an unexpected response.');
  }

  const items = rawItems.map(normalizeIngredient);
  return {
    items,
    nextOffset: getNextOffset(offset, limit, items),
  };
}

/**
 * Fetches the entire ingredients catalog from the backend (or mock)
 * by iterating pages of 100 items until complete.
 */
export async function fetchAllIngredients(): Promise<Ingredient[]> {
  if (isMockEnabled('library')) {
    return [...MOCK_INGREDIENTS];
  }

  const allIngredients: Ingredient[] = [];
  const pageSize = 100;
  let offset = 0;
  let hasMore = true;
  let safetyCounter = 0;

  while (hasMore && safetyCounter < 50) {
    safetyCounter++;
    const page = await fetchIngredients({
      q: '',
      limit: pageSize,
      offset,
    });
    allIngredients.push(...page.items);
    if (page.nextOffset !== null && page.items.length === pageSize) {
      offset = page.nextOffset;
    } else {
      hasMore = false;
    }
  }

  return allIngredients;
}

export async function fetchIngredientById(id: string): Promise<Ingredient> {
  if (!id.trim()) {
    throw new Error('An ingredient ID is required.');
  }

  if (isMockEnabled('library')) {
    console.log('[Library API] Using MOCK mode');
    const rawTarget = id.trim();
    const target = rawTarget.toLowerCase();
    const slugTarget = `ingredient-`;

    // 1. Direct match by id or slug
    let ingredient = MOCK_INGREDIENTS.find(
      (item) => item.id.toLowerCase() === target || item.id.toLowerCase() === slugTarget
    );

    // 2. Exact match by name
    if (!ingredient) {
      ingredient = MOCK_INGREDIENTS.find(
        (item) => item.name.toLowerCase() === target
      );
    }

    // 3. Substring match
    if (!ingredient) {
      ingredient = MOCK_INGREDIENTS.find(
        (item) =>
          target.includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(target)
      );
    }

    // 4. Common skincare clinical aliases
    if (!ingredient) {
      if (target.includes('aha') || target.includes('glycolic')) {
        ingredient = MOCK_INGREDIENTS.find((item) => item.id === 'ingredient-glycolic-acid');
      } else if (target.includes('bha') || target.includes('salicylic')) {
        ingredient = MOCK_INGREDIENTS.find((item) => item.id === 'ingredient-salicylic-acid');
      } else if (target.includes('cica') || target.includes('centella')) {
        ingredient = MOCK_INGREDIENTS.find((item) => item.id === 'ingredient-centella-asiatica');
      } else if (target.includes('vitamin c') || target.includes('ascorbic')) {
        ingredient = MOCK_INGREDIENTS.find((item) => item.id === 'ingredient-vitamin-c');
      }
    }

    if (!ingredient) {
      throw new Error('This ingredient could not be found.');
    }
    return ingredient;
  }

  // 1. Instant Cache-First Lookup: Use pre-downloaded catalog for 0ms response
  try {
    const cached = await getCachedIngredients();
    const localItem = cached?.find((item) => item.id === id);
    if (localItem && localItem.description) {
      return localItem;
    }
  } catch {
    // Continue to network fetch
  }

  try {
    const response = await api.get<unknown>(`/ingredients/${encodeURIComponent(id)}`);
    if (!isRecord(response.data) || !isRecord(response.data.data)) {
      throw new Error('The ingredient service returned an unexpected detail response.');
    }

    return normalizeIngredient(response.data.data);
  } catch (err) {
    // Offline / Network fallback: look up in cached ingredients list
    const cached = await getCachedIngredients();
    const found = cached?.find((item) => item.id === id);
    if (found) {
      return found;
    }
    throw err;
  }
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
    ...value,
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

  const rawCompatibleSkinTypes = productRecord.compatible_skin_types ?? value.compatible_skin_types;
  const rawTargetSkinConditions = productRecord.target_skin_conditions ?? value.target_skin_conditions;

  const compatibleSkinTypes = Array.isArray(rawCompatibleSkinTypes)
    ? rawCompatibleSkinTypes.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;
  const targetSkinConditions = Array.isArray(rawTargetSkinConditions)
    ? rawTargetSkinConditions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;

  return {
    ...product,
    ingredients,
    good_for: Array.isArray(rawGoodFor) ? rawGoodFor : undefined,
    compatible_skin_types: compatibleSkinTypes,
    target_skin_conditions: targetSkinConditions,
  };
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  if (!id.trim()) {
    throw new Error('A product ID is required.');
  }

  if (isMockEnabled('library')) {
    console.log('[Library API] Using MOCK mode');
    const product = MOCK_ADDED_PRODUCTS.find((item) => item.id === id)
      ?? MOCK_PRODUCT_DETAILS.find((item) => item.id === id);
    if (!product) {
      throw new Error('This product could not be found.');
    }
    return product;
  }

  // 1. Instant Cache-First Lookup: Use pre-downloaded catalog for 0ms response
  try {
    const cached = await getCachedProducts();
    const localItem = cached?.find((item) => item.id === id);
    if (localItem && (localItem as any).ingredients && (localItem as any).ingredients.length > 0) {
      return localItem as ProductDetail;
    }
  } catch {
    // Continue to network fetch
  }

  try {
    const response = await api.get<unknown>(`/products/${encodeURIComponent(id)}`);
    if (!isRecord(response.data) || !isRecord(response.data.data)) {
      throw new Error('The product service returned an unexpected detail response.');
    }

    return normalizeProductDetail(response.data.data, id);
  } catch (err) {
    // Offline / Network fallback: look up in cached products list
    const cached = await getCachedProducts();
    const found = cached?.find((item) => item.id === id);
    if (found) {
      return {
        ...found,
        ingredients: [],
      };
    }
    throw err;
  }
}

export async function fetchProducts(params: ProductQuery): Promise<ProductPage> {
  const { q, category, limit, offset } = params;

  if (isMockEnabled('library')) {
    console.log('[Library API] Using MOCK mode');
    const normalizedQuery = q.trim().toLocaleLowerCase();
    const matchingItems = [...MOCK_ADDED_PRODUCTS, ...MOCK_PRODUCTS].filter((product) => {
      const matchesQuery = normalizedQuery.length === 0
        || product.name.toLocaleLowerCase().includes(normalizedQuery)
        || product.brand?.toLocaleLowerCase().includes(normalizedQuery);
      const matchesCategory = category === null || toCanonicalCategory(product.category) === category;
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

  const rawPayload = (response.data as any)?.data;
  let rawItems: unknown[] = [];
  if (Array.isArray(rawPayload)) {
    rawItems = rawPayload;
  } else if (rawPayload && typeof rawPayload === 'object' && Array.isArray(rawPayload.items)) {
    rawItems = rawPayload.items;
  } else {
    throw new Error('The product service returned an unexpected response.');
  }

  const items = rawItems.map(normalizeProduct);
  return {
    items,
    nextOffset: getNextProductOffset(offset, limit, items),
  };
}

/**
 * Fetches the entire products catalog from the backend (or mock)
 * by iterating pages of 100 items until complete.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  if (isMockEnabled('library')) {
    return [...MOCK_ADDED_PRODUCTS, ...MOCK_PRODUCTS];
  }

  const allProducts: Product[] = [];
  const pageSize = 100;
  let offset = 0;
  let hasMore = true;
  let safetyCounter = 0;

  while (hasMore && safetyCounter < 50) {
    safetyCounter++;
    const page = await fetchProducts({
      q: '',
      category: null,
      limit: pageSize,
      offset,
    });
    allProducts.push(...page.items);
    if (page.nextOffset !== null && page.items.length === pageSize) {
      offset = page.nextOffset;
    } else {
      hasMore = false;
    }
  }

  return allProducts;
}
