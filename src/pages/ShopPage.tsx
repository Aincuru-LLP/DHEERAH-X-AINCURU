import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import {
  CATEGORIES,
  MASTER_CATEGORIES,
  MASTER_CATEGORY_TILES
} from '../constants';
import { masterCategoriesFor, subcategoriesFor } from '../lib/subcategories';
import { Fabric } from '../types';
import ProductCard from '../components/ProductCard';
import { useRouter } from '../context/RouterContext';
import { useCatalog } from '../context/CatalogContext';
import { sellableFirst } from '../lib/availability';
import {
  SHOP_FILTER_PRODUCT_CATEGORIES,
  BUSINESS_CATEGORY_MAP,
  matchesBusinessCategory,
  BusinessCategoryKey,
} from '../config/productCategories';
import { FEATURES } from '../config/features';

type SortKey = 'recommended' | 'popularity' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface Props {
  initialCategory?: string;
  initialSubCategory?: string;
}

const PRICE_BRACKETS = [
  { id: '0-2000', label: 'Under ₹2,000', min: 0, max: 2000 },
  { id: '2000-5000', label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { id: '5000-10000', label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { id: '10000-99999999', label: 'Over ₹10,000', min: 10000, max: Number.MAX_SAFE_INTEGER }
];

const Section: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[color:var(--dheerah-beige-soft)] py-4">
      <button onClick={() => setOpen(o => !o)} className="w-full flex justify-between items-center mb-3 text-left">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal)]">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[color:var(--dheerah-charcoal-muted)]" /> : <ChevronDown className="w-4 h-4 text-[color:var(--dheerah-charcoal-muted)]" />}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
};

const Checkbox: React.FC<{ checked: boolean; onChange: () => void; label: React.ReactNode }> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2.5 text-[13px] text-[color:var(--dheerah-charcoal)] cursor-pointer hover:text-[color:var(--dheerah-crimson)] transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="accent-[color:var(--dheerah-crimson)] w-4 h-4 rounded-xs cursor-pointer"
    />
    <span className="font-light">{label}</span>
  </label>
);

const CATEGORY_HERO_BANNERS: Record<string, { src: string; alt: string }> = {
  'maxis': {
    src: '/figma-assets/banners/maxis-hero.png',
    alt: 'Maxis Collection - Dheerah',
  },
  'kalamkari': {
    src: '/figma-assets/banners/kalamkari-hero.png',
    alt: 'Kalamkari Collection - Dheerah',
  },
  'raw-silk': {
    src: '/figma-assets/banners/raw-silk-hero.png',
    alt: 'Raw Silk Collection - Dheerah',
  },
  'salwar-suits': {
    src: '/figma-assets/banners/salwar-suits-hero.png',
    alt: 'Salwar Suits Collection - Dheerah',
  },
  'all-fabrics': {
    src: '/figma-assets/banners/all-fabrics-hero.png',
    alt: 'All Fabrics - Dheerah',
  },
};

function getCategoryHeroBanner(categoryKey?: string | null) {
  if (!categoryKey) return null;
  const key = categoryKey.toLowerCase().trim().replace(/_/g, '-');
  if (key === 'maxis' || key === 'maxi') return CATEGORY_HERO_BANNERS['maxis'];
  if (key === 'kalamkari') return CATEGORY_HERO_BANNERS['kalamkari'];
  if (key === 'raw-silk' || key === 'raw-silks') return CATEGORY_HERO_BANNERS['raw-silk'];
  if (key === 'salwar-suits' || key === 'salwar-suit') return CATEGORY_HERO_BANNERS['salwar-suits'];
  if (key === 'all-fabrics' || key === 'fabrics' || key === 'fabric' || key === 'all') return CATEGORY_HERO_BANNERS['all-fabrics'];
  return CATEGORY_HERO_BANNERS[key] ?? null;
}

const ShopPage: React.FC<Props> = ({ initialCategory, initialSubCategory }) => {
  const { navigate } = useRouter();

  const activeBusinessCategory = useMemo(() => {
    if (!initialCategory) return null;
    const raw = initialCategory.toLowerCase().trim().replace(/_/g, '-');
    const normalizedKey =
      raw === 'maxi' ? 'maxis' :
      raw === 'raw-silks' ? 'raw-silk' :
      raw === 'salwar-suit' ? 'salwar-suits' :
      (raw === 'fabrics' || raw === 'fabric') ? 'all-fabrics' :
      (raw === 'western-wear' || raw === 'western_wear' || raw === '2-pc-sets' || raw === '2-pc-set') ? 'two-piece-sets' :
      (raw === 'three-piece-set' || raw === '3-pc-sets' || raw === '3-pc-set') ? 'three-piece-sets' :
      (raw === 'saree') ? 'sarees' :
      raw;

    const direct = BUSINESS_CATEGORY_MAP.get(normalizedKey as BusinessCategoryKey) || BUSINESS_CATEGORY_MAP.get(raw);
    if (direct) return direct;
    const byLabel = SHOP_FILTER_PRODUCT_CATEGORIES.find(
      c => c.label.toLowerCase() === raw || c.slug === raw
    );
    if (byLabel) return byLabel;
    return null;
  }, [initialCategory]);

  const activeCategoryKey = activeBusinessCategory ? activeBusinessCategory.key : initialCategory;
  const isLegacyCategory = !activeBusinessCategory && Boolean(initialCategory);
  const activeSub = initialSubCategory ?? '';

  const [weaveTypes, setWeaveTypes] = useState<Set<string>>(new Set());
  const [colors, setColors] = useState<Set<string>>(new Set());
  const [priceBrackets, setPriceBrackets] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>('recommended');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setWeaveTypes(new Set());
    setColors(new Set());
    setPriceBrackets(new Set());
  }, [initialCategory, initialSubCategory]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  const { products: allProducts, loading, error: loadError, refresh } = useCatalog();

  const products = useMemo(() => {
    if (!activeCategoryKey) return allProducts;
    return allProducts.filter(p => {
      if (!matchesBusinessCategory(p, activeCategoryKey)) return false;
      if (activeSub && p.subCategory !== activeSub) return false;
      return true;
    });
  }, [allProducts, activeCategoryKey, activeSub]);

  const subOptions = useMemo(() => {
    if (!activeCategoryKey) return [];
    const s = new Set<string>();
    (products ?? []).forEach(f => {
      if (f.subCategory) s.add(f.subCategory);
    });
    return Array.from(s).sort();
  }, [activeCategoryKey, products]);

  const allColors = useMemo(() => {
    const s = new Set<string>();
    (products ?? []).forEach(f => f.colors?.forEach(c => s.add(c.name)));
    return Array.from(s).sort();
  }, [products]);

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, v: string) =>
    setter(prev => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v); else n.add(v);
      return n;
    });

  const filtered = useMemo(() => {
    const source = products ?? [];
    let list: Fabric[] = source.filter(f => {
      if (weaveTypes.size > 0 && !weaveTypes.has(f.category)) return false;
      if (colors.size > 0 && !(f.colors ?? []).some(c => colors.has(c.name))) return false;
      if (priceBrackets.size > 0) {
        const ok = PRICE_BRACKETS.some(b => priceBrackets.has(b.id) && f.price >= b.min && f.price < b.max);
        if (!ok) return false;
      }
      return true;
    });

    switch (sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating':
        if (FEATURES.reviewsAndFeedback) {
          list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        }
        break;
      case 'popularity': list = [...list].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)); break;
      case 'newest': list = [...list].reverse(); break;
    }
    // Applied last, so it outranks every sort: nobody wants "price low to high"
    // to open on a row of pieces they cannot buy. Sold-out stays in the grid —
    // hiding it would collapse thin categories and 404 links already shared —
    // but always below what is in stock.
    return sellableFirst(list);
  }, [products, weaveTypes, colors, priceBrackets, sort]);

  const headerTitle = activeBusinessCategory ? activeBusinessCategory.label : isLegacyCategory ? initialCategory! : 'All Collections';
  const headerTagline = activeBusinessCategory ? activeBusinessCategory.tagline : null;
  const itemCountText = `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}`;

  const activeChips: { label: string; clear: () => void }[] = [];
  weaveTypes.forEach(c => activeChips.push({ label: c, clear: () => toggleSet(setWeaveTypes, c) }));
  colors.forEach(c => activeChips.push({ label: c, clear: () => toggleSet(setColors, c) }));
  priceBrackets.forEach(id => {
    const b = PRICE_BRACKETS.find(p => p.id === id);
    if (b) activeChips.push({ label: b.label, clear: () => toggleSet(setPriceBrackets, id) });
  });

  const clearAll = () => {
    setWeaveTypes(new Set());
    setColors(new Set());
    setPriceBrackets(new Set());
  };

  const selectCategory = (key: string) => {
    clearAll();
    navigate({ name: 'shop', category: key });
  };

  const selectSub = (sub: string) => {
    if (!activeCategoryKey) return;
    const next = activeSub === sub ? undefined : sub;
    navigate({ name: 'shop', category: activeCategoryKey, subCategory: next });
  };

  const showWeaveFacet = !activeCategoryKey || activeCategoryKey === 'all-fabrics' || activeCategoryKey === 'Fabrics';

  const Sidebar = (
    <aside className="text-[color:var(--dheerah-charcoal)]">
      <div className="flex justify-between items-center pb-3 border-b border-[color:var(--dheerah-beige-soft)]">
        <span className="text-[12px] font-bold uppercase tracking-[0.16em]">Filters</span>
        {(activeChips.length > 0 || activeCategoryKey || activeSub) && (
          <button
            onClick={() => { clearAll(); navigate({ name: 'shop' }); }}
            className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)]"
          >
            Clear All
          </button>
        )}
      </div>

      <Section title="Category">
        {SHOP_FILTER_PRODUCT_CATEGORIES.map(c => {
          const active = activeCategoryKey === c.key;
          const count = allProducts.filter(p => matchesBusinessCategory(p, c.key)).length;
          return (
            <button
              key={c.key}
              onClick={() => selectCategory(c.key)}
              className={`flex items-center justify-between w-full text-left text-[13px] py-1.5 transition-colors ${
                active
                  ? 'font-bold text-[color:var(--dheerah-crimson)]'
                  : 'text-[color:var(--dheerah-charcoal)] hover:text-[color:var(--dheerah-crimson)] font-light'
              }`}
            >
              <span>{c.label}</span>
              <span className="text-[11px] text-[color:var(--dheerah-charcoal-muted)]">({count})</span>
            </button>
          );
        })}
        {isLegacyCategory && (
          <div className="pt-2 mt-2 border-t border-[color:var(--dheerah-beige-soft)]">
            <span className="text-[12px] font-bold text-[color:var(--dheerah-crimson)] block">
              {initialCategory} (Legacy)
            </span>
          </div>
        )}
      </Section>

      {showWeaveFacet && (
        <Section title="Weave Type">
          {CATEGORIES.map(c => (
            <Checkbox key={c} checked={weaveTypes.has(c)} onChange={() => toggleSet(setWeaveTypes, c)} label={c} />
          ))}
        </Section>
      )}

      <Section title="Price">
        {PRICE_BRACKETS.map(b => (
          <Checkbox key={b.id} checked={priceBrackets.has(b.id)} onChange={() => toggleSet(setPriceBrackets, b.id)} label={b.label} />
        ))}
      </Section>

      <Section title="Colour" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-2">
          {allColors.map(c => {
            const hex = (products ?? []).find(f => f.colors?.find(x => x.name === c))?.colors?.find(x => x.name === c)?.hex ?? '#ccc';
            const active = colors.has(c);
            return (
              <button
                key={c}
                onClick={() => toggleSet(setColors, c)}
                className={`flex flex-col items-center gap-1.5 p-1 rounded-sm border transition-all ${
                  active
                    ? 'border-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] shadow-2xs'
                    : 'border-transparent hover:border-[color:var(--dheerah-beige-soft)]'
                }`}
                title={c}
              >
                <span className="swatch-dot" style={{ background: hex }} />
                <span className="text-[10px] truncate w-full text-center text-[color:var(--dheerah-charcoal)] font-light">{c}</span>
              </button>
            );
          })}
        </div>
      </Section>
    </aside>
  );

  const banner = activeCategoryKey ? getCategoryHeroBanner(activeCategoryKey) : null;

  return (
    <main className="pt-[72px] md:pt-[84px] pb-14 md:pb-20 bg-white min-h-screen">
      {/* Category Hero Banner matching Figma Frame 370 exactly (1440x759) */}
      {banner && (
        <motion.section
          key={banner.src}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-[#FAF9F5] flex justify-center overflow-hidden mb-6 md:mb-10"
        >
          <div className="w-full max-w-[1440px] aspect-[1440/759] max-h-[759px] overflow-hidden">
            <img
              src={banner.src}
              alt={banner.alt}
              className="w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </motion.section>
      )}

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10">
        {/* Breadcrumb */}
        {activeCategoryKey && (
          <nav className="text-[12px] text-[#8E8A83] mb-6 font-light">
            <button onClick={() => navigate({ name: 'home' })} className="hover:text-black transition-colors">Home</button>
            <span className="mx-2 text-[#E8E4DF]">/</span>
            <button
              onClick={() => navigate({ name: 'shop', category: activeCategoryKey })}
              className={`hover:text-black transition-colors ${!activeSub ? 'text-black font-semibold' : ''}`}
            >
              {headerTitle}
            </button>
            {activeSub && (
              <>
                <span className="mx-2 text-[#E8E4DF]">/</span>
                <span className="text-black font-semibold">{activeSub}</span>
              </>
            )}
          </nav>
        )}

        {/* ============================================================ */}
        {/* FIGMA FILTER BAR                                             */}
        {/* Border outline box: [232 items] | [FILTER]                   */}
        {/* ============================================================ */}
        <div className="border border-[#E8E4DF] bg-white rounded-sm px-4 sm:px-6 py-3.5 mb-8 flex items-center justify-between gap-4">
          <span className="text-[13px] sm:text-[14px] text-[#8E8A83] font-body">
            {filtered.length} items
          </span>

          <div className="flex items-center gap-4 sm:gap-6 divide-x divide-[#E8E4DF]">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="appearance-none pr-6 text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider text-black bg-transparent focus:outline-none cursor-pointer"
                aria-label="Sort products"
              >
                <option value="recommended">Recommended</option>
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                {FEATURES.reviewsAndFeedback && <option value="rating">Customer Rating</option>}
                <option value="newest">What's New</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-black" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="pl-4 sm:pl-6 text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-black hover:text-[#C47457] transition-colors flex items-center gap-2 cursor-pointer"
              aria-label="Open filters"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>FILTER</span>
            </button>
          </div>
        </div>

        {/* Subcategory chip row */}
        {activeCategoryKey && subOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 overflow-x-auto">
            {subOptions.map(sub => {
              const active = activeSub === sub;
              return (
                <button
                  key={sub}
                  onClick={() => selectSub(sub)}
                  className={
                    active
                      ? 'px-3.5 py-1.5 rounded-sm text-[12px] font-bold bg-[color:var(--dheerah-charcoal)] text-white border border-[color:var(--dheerah-charcoal)] shadow-2xs'
                      : 'px-3.5 py-1.5 rounded-sm text-[12px] font-medium bg-white text-[color:var(--dheerah-charcoal)] border border-[color:var(--dheerah-beige-soft)] hover:border-[color:var(--dheerah-gold)] hover:text-[color:var(--dheerah-crimson)] transition-colors'
                  }
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeChips.map((c, i) => (
              <button key={i} onClick={c.clear} className="chip chip-active">
                {c.label} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <div className="hidden lg:block">{Sidebar}</div>

          <div>
            {loadError && (
              <div className="mb-4 border border-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] rounded-sm p-4 flex items-center justify-between gap-3 flex-wrap shadow-2xs">
                <p className="text-[13px] text-[color:var(--dheerah-charcoal)] font-semibold">
                  Couldn't fetch this section. {loadError}
                </p>
                <button
                  type="button"
                  onClick={refresh}
                  className="text-[12px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)] underline hover:text-[color:var(--dheerah-crimson-dark)]"
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-[color:var(--dheerah-cream)] rounded-sm border border-[color:var(--dheerah-beige-soft)]" />
                    <div className="mt-2.5 h-3.5 w-3/4 bg-[color:var(--dheerah-cream)] rounded-xs" />
                    <div className="mt-1.5 h-3 w-1/2 bg-[color:var(--dheerah-cream)] rounded-xs" />
                    <div className="mt-2 h-4 w-1/3 bg-[color:var(--dheerah-cream)] rounded-xs" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 && !loadError ? (
              <div className="border border-[color:var(--dheerah-beige-soft)] py-20 px-6 text-center bg-[color:var(--dheerah-cream)] rounded-sm shadow-2xs">
                <p className="font-serif text-2xl md:text-3xl mb-2 text-[color:var(--dheerah-charcoal)]">
                  Curated stock is on the loom
                </p>
                <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] mb-5 font-light">
                  Check back soon, or browse another atelier collection.
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {SHOP_FILTER_PRODUCT_CATEGORIES.filter(c => c.key !== activeCategoryKey).map(c => (
                    <button
                      key={c.key}
                      onClick={() => navigate({ name: 'shop', category: c.key })}
                      className="chip"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-[color:var(--dheerah-beige-soft)] py-20 px-6 text-center bg-[color:var(--dheerah-cream)] rounded-sm shadow-2xs">
                <p className="font-serif text-2xl md:text-3xl mb-2 text-[color:var(--dheerah-charcoal)]">
                  {headerTitle} — curated stock is on the loom
                </p>
                {headerTagline ? (
                  <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] mb-5 italic font-light">{headerTagline}</p>
                ) : (
                  <p className="text-[14px] text-[color:var(--dheerah-charcoal-muted)] mb-5 font-light">
                    Check back soon, or browse another collection.
                  </p>
                )}
                <div className="flex gap-2 justify-center flex-wrap mb-4">
                  {SHOP_FILTER_PRODUCT_CATEGORIES.filter(c => c.key !== activeCategoryKey).map(c => (
                    <button
                      key={c.key}
                      onClick={() => navigate({ name: 'shop', category: c.key })}
                      className="chip"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                {activeChips.length > 0 && (
                  <button onClick={() => { clearAll(); navigate({ name: 'shop' }); }} className="btn-outline">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
              >
                {filtered.map(f => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProductCard fabric={f} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[120] flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 bg-black/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-[86%] max-w-[360px] bg-white overflow-y-auto p-5 border-l border-[color:var(--dheerah-beige-soft)] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[color:var(--dheerah-beige-soft)]">
                <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-charcoal)]">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-[color:var(--dheerah-charcoal-muted)] hover:text-[color:var(--dheerah-charcoal)] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {Sidebar}
              <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full mt-6">
                Apply ({filtered.length})
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ShopPage;
