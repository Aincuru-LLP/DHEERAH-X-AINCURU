/**
 * WhatsApp configuration & link-building utilities for Dheerah Designer Boutique.
 * 
 * Centralises the business WhatsApp number and URL-generation logic so all
 * storefront contact points stay consistent, typed, and maintainable.
 */

import { storeInfo } from '../config/store';
import type { Fabric } from '../types';

/**
 * Normalized WhatsApp digits only with country code (e.g. '919962176172').
 * Source of truth: storeInfo.whatsapp or VITE_WHATSAPP_NUMBER environment override.
 */
const envNumber =
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env?.VITE_WHATSAPP_NUMBER;

export const DHEERAH_WHATSAPP_NUMBER: string = String(
  envNumber || storeInfo.whatsapp || '919962176172'
).replace(/\D/g, '');

export interface BuildCustomisationMessageParams {
  product: Pick<Fabric, 'id' | 'name'>;
  selectedColor?: string;
  selectedSize?: string | null;
  quantity?: number;
  productUrl?: string;
}

/**
 * Formats a clean pre-filled WhatsApp customisation message using current product state.
 * Only includes fields (shade, size, quantity) that are actually available and selected.
 * 
 * Example output:
 * Hi Dheerah, I'm interested in customising this product.
 * 
 * Product: Bandhani Tie-Dye Silk Fabric
 * Product ID: 11
 * Product link: https://dheerah.com/product/11
 * Selected Shade: Vermilion
 * Selected Size: M
 * Quantity: 2
 * 
 * Please share the available customisation options, pricing and process.
 */
export function buildProductCustomisationMessage({
  product,
  selectedColor,
  selectedSize,
  quantity,
  productUrl,
}: BuildCustomisationMessageParams): string {
  const lines: string[] = [
    "Hi Dheerah, I'm interested in customising this product.",
    "",
    `Product: ${product.name}`,
    `Product ID: ${product.id}`,
  ];

  if (productUrl && productUrl.trim()) {
    lines.push(`Product link: ${productUrl.trim()}`);
  }

  if (selectedColor && selectedColor.trim()) {
    lines.push(`Selected Shade: ${selectedColor.trim()}`);
  }

  if (selectedSize && selectedSize.trim()) {
    lines.push(`Selected Size: ${selectedSize.trim()}`);
  }

  if (typeof quantity === 'number' && quantity > 0) {
    lines.push(`Quantity: ${quantity}`);
  }

  lines.push("");
  lines.push("Please share the available customisation options, pricing and process.");

  return lines.join("\n");
}

/**
 * Builds the complete wa.me link with encoded customisation message.
 */
export function getProductCustomisationWhatsAppUrl(
  params: BuildCustomisationMessageParams
): string {
  const message = buildProductCustomisationMessage(params);
  return `https://wa.me/${DHEERAH_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
