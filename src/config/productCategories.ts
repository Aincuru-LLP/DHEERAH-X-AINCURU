import type { Fabric, MasterCategory, BusinessCategoryKey } from '../types';

export type { BusinessCategoryKey };

export interface BusinessCategoryConfig {
  key: BusinessCategoryKey;
  label: string;
  slug: string;
  tagline: string;
  color: string;
  description: string;
  visibility: 'header' | 'shop-filter' | 'both';
  storageValue?: MasterCategory;
  businessKey?: BusinessCategoryKey;
  displayLabel?: string;
  /** Storage defaults applied ONLY when an admin creates a product under this business category. */
  defaultStorage: {
    category: MasterCategory;
    masterCategory: MasterCategory;
    subCategory?: string;
    materialType?: string;
    weaveType?: string;
    tags?: string[];
  };
}

/**
 * PRIMARY HEADER CATEGORIES (5 categories ONLY)
 * Surfaced in:
 * - Desktop Header navigation
 * - Mobile navigation drawer
 * - Primary boutique collections
 */
export const HEADER_PRODUCT_CATEGORIES: BusinessCategoryConfig[] = [
  {
    key: 'all-fabrics',
    label: 'All Fabrics',
    slug: 'all-fabrics',
    tagline: 'Artisanal running yardage & heritage textiles',
    color: '#F2E4C4',
    description: 'Handwoven yardage across silk, cotton, linen, wool, and handloom blends.',
    visibility: 'both',
    defaultStorage: {
      category: 'Fabrics',
      masterCategory: 'Fabrics',
      materialType: 'Cotton',
    },
  },
  {
    key: 'maxis',
    label: 'Maxis',
    slug: 'maxis',
    tagline: 'Floor-sweeping silhouettes & evening wear',
    color: '#E3C9C0',
    description: 'Floor-length gowns, Indo-Western maxis, and flowing occasion dresses.',
    visibility: 'both',
    defaultStorage: {
      category: 'Gown',
      masterCategory: 'Gown',
      subCategory: 'Evening',
    },
  },
  {
    key: 'kalamkari',
    label: 'Kalamkari',
    slug: 'kalamkari',
    tagline: 'Mythological narrative cloth & organic dyes',
    color: '#E8C7C8',
    description: 'Ancient pen-drawn and block-printed cottons painted with natural vegetable dyes.',
    visibility: 'both',
    defaultStorage: {
      category: 'Fabrics',
      masterCategory: 'Fabrics',
      materialType: 'Cotton',
      weaveType: 'Kalamkari',
      tags: ['Kalamkari', 'Hand-painted', 'Natural Dyes'],
    },
  },
  {
    key: 'raw-silk',
    label: 'Raw Silk',
    slug: 'raw-silk',
    tagline: 'Lustrous, natural slubbed pure silks',
    color: '#C9A267',
    description: 'Textured pure raw silk, mulberry greige, and handloom silk yardage.',
    visibility: 'both',
    defaultStorage: {
      category: 'Fabrics',
      masterCategory: 'Fabrics',
      materialType: 'Silk',
      subCategory: 'Silk',
      tags: ['Raw Silk', 'Pure Silk'],
    },
  },
  {
    key: 'salwar-suits',
    label: 'Salwar Suits',
    slug: 'salwar-suits',
    tagline: 'Three-piece sets, kurta sets & festive coords',
    color: '#DED0B6',
    description: 'Tailored and unstitched kurta-pant-dupatta sets, anarkali sets, and festive ensembles.',
    visibility: 'both',
    defaultStorage: {
      category: 'Three Piece Set',
      masterCategory: 'Three Piece Set',
      subCategory: 'Kurta Pant Dupatta',
    },
  },
];

/**
 * SHOP FILTER & ADMIN CATEGORIES (8 categories)
 * Surfaced in:
 * - Shop Page sidebar & mobile filter sheet
 * - Admin Product CRUD & category filter dropdowns
 * - Admin Inventory & Batch Add
 */
export const SHOP_FILTER_PRODUCT_CATEGORIES: BusinessCategoryConfig[] = [
  ...HEADER_PRODUCT_CATEGORIES,
  {
    key: 'three-piece-sets',
    label: '3 PC Sets',
    slug: '3-pc-sets',
    tagline: 'Kurta, bottom and dupatta ensembles',
    color: '#DED0B6',
    description: 'Tailored and unstitched kurta, pant, and dupatta ensembles.',
    visibility: 'shop-filter',
    storageValue: 'Three Piece Set',
    businessKey: 'three-piece-sets',
    displayLabel: '3 PC Sets',
    defaultStorage: {
      category: 'Three Piece Set',
      masterCategory: 'Three Piece Set',
      subCategory: 'Kurta Pant Dupatta',
    },
  },
  {
    key: 'two-piece-sets',
    label: '2 PC Sets',
    slug: 'two-piece-sets',
    tagline: 'Curated two-piece co-ord sets & silhouettes',
    color: '#CBC0A7',
    description: 'Two-piece co-ord sets, tops, and contemporary silhouettes.',
    visibility: 'shop-filter',
    storageValue: 'Western Wear',
    businessKey: 'two-piece-sets',
    displayLabel: '2 PC Sets',
    defaultStorage: {
      category: 'Western Wear',
      masterCategory: 'Western Wear',
      subCategory: 'Co-ords',
    },
  },
  {
    key: 'sarees',
    label: 'Sarees',
    slug: 'sarees',
    tagline: 'Six yards of timeless elegance & heritage weaves',
    color: '#C9A267',
    description: 'Banarasi, Kanjivaram, and handloom silks.',
    visibility: 'shop-filter',
    storageValue: 'Sarees',
    businessKey: 'sarees',
    displayLabel: 'Sarees',
    defaultStorage: {
      category: 'Sarees',
      masterCategory: 'Sarees',
      subCategory: 'Banarasi',
    },
  },
];

/** Alias for backward compatibility with existing components */
export const VISIBLE_PRODUCT_CATEGORIES: BusinessCategoryConfig[] = HEADER_PRODUCT_CATEGORIES;
export const ADMIN_PRODUCT_CATEGORIES: BusinessCategoryConfig[] = SHOP_FILTER_PRODUCT_CATEGORIES;
export const ALL_BUSINESS_CATEGORIES: BusinessCategoryConfig[] = SHOP_FILTER_PRODUCT_CATEGORIES;

/** Quick lookup dictionary by key with alias resolution */
export const BUSINESS_CATEGORY_MAP = new Map<string, BusinessCategoryConfig>();
ALL_BUSINESS_CATEGORIES.forEach(c => {
  BUSINESS_CATEGORY_MAP.set(c.key, c);
  BUSINESS_CATEGORY_MAP.set(c.slug, c);
});

// Aliases for 2 PC Sets
const twoPiece = ALL_BUSINESS_CATEGORIES.find(c => c.key === 'two-piece-sets')!;
BUSINESS_CATEGORY_MAP.set('2-pc-sets', twoPiece);
BUSINESS_CATEGORY_MAP.set('2-pc-set', twoPiece);
BUSINESS_CATEGORY_MAP.set('western-wear', twoPiece);
BUSINESS_CATEGORY_MAP.set('western_wear', twoPiece);

// Aliases for 3 PC Sets
const threePiece = ALL_BUSINESS_CATEGORIES.find(c => c.key === 'three-piece-sets')!;
BUSINESS_CATEGORY_MAP.set('3-pc-sets', threePiece);
BUSINESS_CATEGORY_MAP.set('3-pc-set', threePiece);
BUSINESS_CATEGORY_MAP.set('three-piece-set', threePiece);

// Aliases for Sarees
const sareesCat = ALL_BUSINESS_CATEGORIES.find(c => c.key === 'sarees')!;
BUSINESS_CATEGORY_MAP.set('saree', sareesCat);

/**
 * HIGH-CONFIDENCE MATCHING RULES
 * Uses existing structured product data:
 * - masterCategory
 * - category
 * - subCategory
 * - materialType
 * - tags
 * - weaveType
 */
function isTwoPieceSet(f: Fabric): boolean {
  if (f.masterCategory === 'Western Wear' || f.category === 'Western Wear') return true;
  const bCat = f.businessCategory as string | undefined;
  if (bCat === 'two-piece-sets' || bCat === '2-pc-sets' || bCat === 'western-wear') return true;
  return false;
}

function isThreePieceSet(f: Fabric): boolean {
  if (f.masterCategory === 'Three Piece Set' || f.category === 'Three Piece Set') return true;
  const bCat = f.businessCategory as string | undefined;
  if (bCat === 'three-piece-sets' || bCat === '3-pc-sets' || bCat === 'three-piece-set') return true;
  return false;
}

function isSarees(f: Fabric): boolean {
  const master = f.masterCategory ?? f.category;
  if (master === 'Sarees' || master === 'One Minute Saree' || master === 'Half Saree') return true;
  if (f.category === 'Sarees' || f.category === 'One Minute Saree' || f.category === 'Half Saree') return true;
  const bCat = f.businessCategory as string | undefined;
  if (bCat === 'sarees' || bCat === 'saree') return true;
  return false;
}

function isKalamkari(f: Fabric): boolean {
  const weave = (f.weaveType ?? '').toLowerCase();
  if (weave.includes('kalamkari')) return true;

  const sub = (f.subCategory ?? '').toLowerCase();
  if (sub.includes('kalamkari')) return true;

  const tags = (f.tags ?? []).map(t => t.toLowerCase());
  if (tags.some(t => t.includes('kalamkari'))) return true;

  const name = (f.name ?? '').toLowerCase();
  if (name.includes('kalamkari')) return true;

  return false;
}

function isRawSilk(f: Fabric): boolean {
  const name = (f.name ?? '').toLowerCase();
  const sub = (f.subCategory ?? '').toLowerCase();
  const tags = (f.tags ?? []).map(t => t.toLowerCase());
  const weave = (f.weaveType ?? '').toLowerCase();
  const desc = (f.description ?? '').toLowerCase();

  // Explicit Raw Silk indicators
  if (name.includes('raw silk') || sub.includes('raw silk') || tags.some(t => t.includes('raw silk'))) {
    return true;
  }
  if (weave.includes('raw silk')) return true;

  // Undyed mulberry greige silk fabrics
  if (
    (f.category === 'Fabrics' || f.masterCategory === 'Fabrics' || f.category === 'Dyeable Fabrics' || f.masterCategory === 'Dyeable Fabrics') &&
    f.materialType === 'Silk' &&
    (name.includes('mulberry silk') || name.includes('undyed') || desc.includes('greige') || tags.includes('pure silk'))
  ) {
    return true;
  }

  return false;
}

function isMaxi(f: Fabric): boolean {
  if (isTwoPieceSet(f) || isThreePieceSet(f) || isSarees(f)) return false;

  const master = f.masterCategory ?? f.category;
  const sub = (f.subCategory ?? '').toLowerCase();
  const name = (f.name ?? '').toLowerCase();
  const tags = (f.tags ?? []).map(t => t.toLowerCase());

  if (master === 'Gown') return true;

  if (sub === 'floor-length' || sub === 'evening' || sub === 'reception' || sub === 'anarkali gown' || sub === 'dresses') {
    return true;
  }

  if (name.includes('gown') || name.includes('maxi') || name.includes('slip dress') || name.includes('floor-length')) {
    return true;
  }

  if (tags.some(t => t === 'floor-length' || t === 'gown' || t === 'maxi')) {
    return true;
  }

  return false;
}

function isSalwarSuit(f: Fabric): boolean {
  if (isTwoPieceSet(f)) return false;

  const master = f.masterCategory ?? f.category;
  const sub = (f.subCategory ?? '').toLowerCase();
  const name = (f.name ?? '').toLowerCase();
  const tags = (f.tags ?? []).map(t => t.toLowerCase());

  if (master === 'Three Piece Set') return true;

  if (master === 'Ethnic Wear') {
    if (
      sub.includes('kurta') ||
      sub.includes('salwar') ||
      sub.includes('suit') ||
      sub.includes('sharara') ||
      sub.includes('palazzo') ||
      sub.includes('dupatta')
    ) {
      return true;
    }
  }

  if (master === 'Anarkalis' && !name.includes('floor-length') && !sub.includes('floor-length')) {
    return true;
  }

  if (
    sub.includes('kurta pant') ||
    sub.includes('salwar suit') ||
    sub.includes('sharara') ||
    sub.includes('palazzo set') ||
    sub.includes('co-ord set')
  ) {
    return true;
  }

  if (name.includes('salwar') || name.includes('kurta') || name.includes('three piece set') || name.includes('sharara')) {
    return true;
  }

  if (tags.some(t => t.includes('kurta') || t.includes('salwar') || t.includes('three-piece'))) {
    return true;
  }

  return false;
}

function isAllFabrics(f: Fabric): boolean {
  const master = f.masterCategory ?? f.category;
  if (master === 'Fabrics' || master === 'Dyeable Fabrics') {
    return true;
  }
  return false;
}

/**
 * Resolves an existing product into one of the business categories.
 * 1. Storage checks first: Western Wear -> 2 PC Sets, Three Piece Set -> 3 PC Sets, Sarees -> Sarees.
 * 2. Explicit product.businessCategory if already set.
 * 3. Evaluates high-confidence mapping rules against existing fields.
 * Returns null if the piece is an unmapped legacy category (e.g. Laces, Langha Jacket).
 */
export function getBusinessCategory(product: Fabric): BusinessCategoryConfig | null {
  // 1. Exact storage check for Western Wear -> 2 PC Sets (authoritative storage mapping)
  if (isTwoPieceSet(product)) {
    return BUSINESS_CATEGORY_MAP.get('two-piece-sets')!;
  }

  // 2. Exact storage check for Three Piece Set -> 3 PC Sets
  if (isThreePieceSet(product)) {
    return BUSINESS_CATEGORY_MAP.get('three-piece-sets')!;
  }

  // 3. Exact storage check for Sarees -> Sarees
  if (isSarees(product)) {
    return BUSINESS_CATEGORY_MAP.get('sarees')!;
  }

  // 4. Explicit businessCategory saved on product
  if (product.businessCategory && BUSINESS_CATEGORY_MAP.has(product.businessCategory)) {
    return BUSINESS_CATEGORY_MAP.get(product.businessCategory)!;
  }

  // 5. High-confidence heuristic checks on existing structured product data
  if (isKalamkari(product)) {
    return BUSINESS_CATEGORY_MAP.get('kalamkari')!;
  }
  if (isRawSilk(product)) {
    return BUSINESS_CATEGORY_MAP.get('raw-silk')!;
  }
  if (isSalwarSuit(product)) {
    return BUSINESS_CATEGORY_MAP.get('salwar-suits')!;
  }
  if (isMaxi(product)) {
    return BUSINESS_CATEGORY_MAP.get('maxis')!;
  }
  if (isAllFabrics(product)) {
    return BUSINESS_CATEGORY_MAP.get('all-fabrics')!;
  }

  return null;
}

/**
 * Determines whether a product matches a given business category key.
 * Strictly checks the high-confidence rules for that specific key.
 */
export function matchesBusinessCategory(product: Fabric, key: BusinessCategoryKey | string): boolean {
  const normalizedKey = key.toLowerCase().trim().replace(/[\s_]+/g, '-');

  // CRITICAL BUSINESS RULE: "All Fabrics" is the master / all-products view.
  // Every product in the catalogue matches.
  if (normalizedKey === 'all-fabrics' || normalizedKey === 'all' || normalizedKey === 'all-products') {
    return true;
  }

  // 1. Exact storage & alias checks for 2 PC Sets, 3 PC Sets, Sarees
  if (normalizedKey === 'two-piece-sets' || normalizedKey === '2-pc-sets' || normalizedKey === 'western-wear') {
    return isTwoPieceSet(product);
  }
  if (normalizedKey === 'three-piece-sets' || normalizedKey === '3-pc-sets' || normalizedKey === 'three-piece-set') {
    return isThreePieceSet(product);
  }
  if (normalizedKey === 'sarees' || normalizedKey === 'saree') {
    return isSarees(product);
  }

  // Products classified as Two Piece Sets (Western Wear) belong to 2 PC Sets only
  if (isTwoPieceSet(product)) {
    return false;
  }

  // 2. Check explicit product.businessCategory
  if (product.businessCategory) {
    if (product.businessCategory === normalizedKey) return true;
    if (normalizedKey === 'maxis' && product.businessCategory === 'maxis') return true;
    if (normalizedKey === 'salwar-suits' && product.businessCategory === 'salwar-suits') return true;
    if (normalizedKey === 'kalamkari' && product.businessCategory === 'kalamkari') return true;
    if (normalizedKey === 'raw-silk' && product.businessCategory === 'raw-silk') return true;
  }

  // 3. Heuristic matching
  switch (normalizedKey) {
    case 'kalamkari':
      return isKalamkari(product);
    case 'raw-silk':
    case 'raw-silks':
      return isRawSilk(product);
    case 'salwar-suits':
    case 'salwar-suit':
      return isSalwarSuit(product);
    case 'maxis':
    case 'maxi':
      return isMaxi(product);
    default:
      // Backward compatibility: If the key happens to be a legacy category name (e.g. "Laces")
      return product.category === key || product.masterCategory === key;
  }
}

/**
 * Returns the category label to display in the UI.
 * - If product is stored as 'Western Wear', ALWAYS returns '2 PC Sets'.
 * - If product is stored as 'Three Piece Set', ALWAYS returns '3 PC Sets'.
 * - If product is stored as 'Sarees', ALWAYS returns 'Sarees'.
 * - Customer mode: Returns business category label (e.g. 'Maxis', '2 PC Sets') or subCategory.
 * - Admin mode: Returns business category label (e.g. '2 PC Sets') or 'Legacy: <category>'.
 */
export function getDisplayCategory(
  product: Fabric,
  mode: 'customer' | 'admin' = 'customer'
): string {
  // Explicit Western Wear -> 2 PC Sets rename in ALL surfaces (customer and admin)
  if (
    product.category === 'Western Wear' ||
    product.masterCategory === 'Western Wear' ||
    product.businessCategory === 'two-piece-sets' ||
    (product.businessCategory as string) === 'western-wear'
  ) {
    return '2 PC Sets';
  }

  // Explicit Three Piece Set -> 3 PC Sets rename in ALL surfaces
  if (
    product.category === 'Three Piece Set' ||
    product.masterCategory === 'Three Piece Set' ||
    product.businessCategory === 'three-piece-sets'
  ) {
    return '3 PC Sets';
  }

  // Explicit Sarees
  if (
    product.category === 'Sarees' ||
    product.masterCategory === 'Sarees' ||
    product.businessCategory === 'sarees'
  ) {
    return 'Sarees';
  }

  const match = getBusinessCategory(product);
  if (match) {
    return match.label;
  }

  const legacyName = product.category || product.masterCategory || 'Uncategorized';
  if (mode === 'admin') {
    return `Legacy: ${legacyName}`;
  }

  // Customer mode: For any piece in the store that doesn't strictly match a known category,
  // display its specific subcategory if available, or its category, or 'All Fabrics'.
  return product.subCategory || legacyName;
}

/**
 * Maps a business category key to existing storage fields.
 *
 * CRITICAL SAFETY:
 * ONLY use this during EXPLICIT CREATION or EXPLICIT CHANGE of a product's category.
 * NEVER invoke this during an ordinary read.
 * NEVER invoke this automatically during an edit-save when the category was not changed.
 * NEVER bulk-convert existing records.
 */
export function mapBusinessCategoryToStorage(
  key: BusinessCategoryKey | string,
  existing?: Partial<Fabric>
): {
  category: MasterCategory;
  masterCategory: MasterCategory;
  subCategory?: string;
  materialType?: string;
  weaveType?: string;
  tags?: string[];
} {
  const normalizedKey = key.toLowerCase().trim().replace(/[\s_]+/g, '-');
  const cfg =
    BUSINESS_CATEGORY_MAP.get(normalizedKey as BusinessCategoryKey) ||
    BUSINESS_CATEGORY_MAP.get(key as BusinessCategoryKey);

  if (!cfg) {
    // Safety fallback to Fabrics
    return {
      category: 'Fabrics',
      masterCategory: 'Fabrics',
      subCategory: existing?.subCategory,
      materialType: existing?.materialType,
      weaveType: existing?.weaveType,
      tags: existing?.tags,
    };
  }

  const base = cfg.defaultStorage;

  // Preserve existing subCategory / materialType / tags unless explicitly empty
  const tagsSet = new Set<string>([...(existing?.tags ?? []), ...(base.tags ?? [])]);

  return {
    category: base.category,
    masterCategory: base.masterCategory,
    subCategory: existing?.subCategory || base.subCategory,
    materialType: existing?.materialType || base.materialType,
    weaveType: existing?.weaveType || base.weaveType,
    tags: Array.from(tagsSet),
  };
}

/**
 * Derives showcase presentation for each of the primary header categories from live catalog products.
 * Used by Homepage CategoryStrip and Hero.
 */
export function businessCategoryShowcase(products: Fabric[]): {
  config: BusinessCategoryConfig;
  count: number;
  heroPhoto: string;
  heroProduct?: Fabric;
}[] {
  return HEADER_PRODUCT_CATEGORIES.map(config => {
    const matching = products.filter(p => matchesBusinessCategory(p, config.key));

    // Sort to pick best hero: featured first, then with real photo, then in stock
    const sorted = [...matching].sort((a, b) => {
      const score = (f: Fabric) =>
        (f.featured ? 16 : 0) + (f.photo && !f.photo.startsWith('data:') ? 4 : 0) + ((f.stock ?? 0) > 0 ? 2 : 0);
      return score(b) - score(a) || (b.price ?? 0) - (a.price ?? 0);
    });

    const hero = sorted[0];
    const heroPhoto = hero?.photo || hero?.image || '';

    return {
      config,
      count: matching.length,
      heroPhoto,
      heroProduct: hero,
    };
  });
}
