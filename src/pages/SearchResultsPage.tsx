import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { useRouter } from '../context/RouterContext';
import { useCatalog } from '../context/CatalogContext';
import type { Fabric } from '../types';
import { VISIBLE_PRODUCT_CATEGORIES } from '../config/productCategories';

interface Props {
  q: string;
}

const RECENT_KEY = 'dheerah:search:recent';
const RECENT_MAX = 5;

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
};

const writeRecent = (list: string[]) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch {
    /* localStorage unavailable (private mode / quota) — silently no-op */
  }
};

const matches = (fabric: Fabric, needle: string): boolean => {
  const n = needle.toLowerCase();
  if (fabric.name?.toLowerCase().includes(n)) return true;
  if (fabric.description?.toLowerCase().includes(n)) return true;
  if (fabric.masterCategory?.toLowerCase().includes(n)) return true;
  if (fabric.category?.toLowerCase().includes(n)) return true;
  if (fabric.subCategory?.toLowerCase().includes(n)) return true;
  if (Array.isArray(fabric.tags) && fabric.tags.some(t => t?.toLowerCase().includes(n))) return true;
  return false;
};

const SuggestionChip: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-3.5 py-1.5 rounded-sm border border-[color:var(--dheerah-beige-soft)] bg-white text-[12px] font-medium text-[color:var(--dheerah-charcoal)] hover:border-[color:var(--dheerah-gold)] hover:text-[color:var(--dheerah-crimson)] transition-colors shadow-2xs"
  >
    {label}
  </button>
);

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-[color:var(--dheerah-cream)] rounded-sm border border-[color:var(--dheerah-beige-soft)]" />
    <div className="px-2.5 pt-2.5 pb-3 space-y-2">
      <div className="h-3 w-2/3 bg-[color:var(--dheerah-cream)] rounded-xs" />
      <div className="h-3 w-1/2 bg-[color:var(--dheerah-cream)] rounded-xs" />
      <div className="h-3 w-1/3 bg-[color:var(--dheerah-cream)] rounded-xs" />
    </div>
  </div>
);

const SearchResultsPage: React.FC<Props> = ({ q }) => {
  const { navigate } = useRouter();
  const { products, loading } = useCatalog();
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  // Push current q into the recent-searches stack on mount/change. We dedupe
  // case-insensitively but preserve the most recent casing the user typed.
  useEffect(() => {
    if (!q) return;
    setRecent(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== q.toLowerCase());
      const next = [q, ...filtered].slice(0, RECENT_MAX);
      writeRecent(next);
      return next;
    });
  }, [q]);

  const results = useMemo(() => {
    return products.filter(p => matches(p, q));
  }, [products, q]);

  return (
    <main className="pt-[100px] md:pt-[116px] pb-14 md:pb-20 bg-[color:var(--dheerah-ivory)] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10">
        <header className="mb-5">
          <span className="section-eyebrow">Search Boutique</span>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[color:var(--dheerah-charcoal)] font-normal mt-1">
            Search results for "{q}"
          </h1>
          {!loading && (
            <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] mt-1 font-light">
              {results.length} {results.length === 1 ? 'piece' : 'pieces'} matched in our collection
            </p>
          )}
        </header>

        {recent.filter(t => t.toLowerCase() !== q.toLowerCase()).length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--dheerah-crimson)] font-bold">
              Recent:
            </span>
            {recent.filter(t => t.toLowerCase() !== q.toLowerCase()).map(term => (
              <SuggestionChip
                key={term}
                label={term}
                onClick={() => navigate({ name: 'search', q: term })}
              />
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-beige-soft)] rounded-sm p-6 shadow-2xs">
            <p className="font-serif text-2xl md:text-3xl text-[color:var(--dheerah-charcoal)] mb-2 font-normal">
              No creations match "{q}"
            </p>
            <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] mb-5 font-light">
              Explore our curated boutique categories below or browse our full showcase.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {VISIBLE_PRODUCT_CATEGORIES.map(c => (
                <SuggestionChip
                  key={c.key}
                  label={c.label}
                  onClick={() => navigate({ name: 'shop', category: c.key })}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {results.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard fabric={f} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchResultsPage;
