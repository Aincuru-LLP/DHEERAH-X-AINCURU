import type { Fabric } from '../types';

/** Standard size vocabulary for Dheerah couture creations. */
export const STANDARD_PRODUCT_SIZES: readonly string[] = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
  '6XL'
] as const;

/**
 * Resolves the effective selling price for a product given an optional selected size.
 * If size is absent, unconfigured, or has no custom price, falls back to `product.price`.
 */
export function getEffectiveProductPrice(
  product: Fabric | null | undefined,
  selectedSize?: string | null
): number {
  if (!product) return 0;
  if (selectedSize && Array.isArray(product.sizes)) {
    const matched = product.sizes.find(
      s => s && (s.name === selectedSize || s.id === selectedSize)
    );
    if (matched && typeof matched.price === 'number' && Number.isFinite(matched.price) && matched.price > 0) {
      return matched.price;
    }
  }
  return product.price ?? 0;
}

/**
 * Resolves the effective MRP for a product given an optional selected size.
 * If size is absent, unconfigured, or has no custom MRP, falls back to `product.mrp`.
 */
export function getEffectiveProductMrp(
  product: Fabric | null | undefined,
  selectedSize?: string | null
): number {
  if (!product) return 0;
  if (selectedSize && Array.isArray(product.sizes)) {
    const matched = product.sizes.find(
      s => s && (s.name === selectedSize || s.id === selectedSize)
    );
    if (matched && typeof matched.mrp === 'number' && Number.isFinite(matched.mrp) && matched.mrp > 0) {
      return matched.mrp;
    }
  }
  return product.mrp ?? 0;
}

/**
 * Calculates the discount percentage based on effective price and effective MRP.
 */
export function getEffectiveProductDiscount(
  product: Fabric | null | undefined,
  selectedSize?: string | null
): number {
  const price = getEffectiveProductPrice(product, selectedSize);
  const mrp = getEffectiveProductMrp(product, selectedSize);
  if (!Number.isFinite(price) || !Number.isFinite(mrp) || mrp <= 0 || price >= mrp) {
    return 0;
  }
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Analyzes whether configured sizes have variable pricing, returning the min/max prices.
 */
export function getProductPriceRange(product: Fabric | null | undefined): {
  minPrice: number;
  maxPrice: number;
  hasVariablePrice: boolean;
} {
  if (!product) {
    return { minPrice: 0, maxPrice: 0, hasVariablePrice: false };
  }
  if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
    return { minPrice: product.price, maxPrice: product.price, hasVariablePrice: false };
  }

  const prices = product.sizes.map(s =>
    typeof s.price === 'number' && Number.isFinite(s.price) && s.price > 0
      ? s.price
      : product.price
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  return {
    minPrice,
    maxPrice,
    hasVariablePrice: minPrice !== maxPrice
  };
}
