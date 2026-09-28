import React from 'react';
import { motion } from 'motion/react';
import { Fabric, MasterCategory } from '../types';
import ProductCard from './ProductCard';
import { useRouter } from '../context/RouterContext';

interface Props {
  title: string;
  eyebrow?: string;
  items: Fabric[];
  ctaCategory?: string;
  masterCategory?: MasterCategory;
  bg?: 'white' | 'soft';
  /** When true, render placeholder cards instead of items (data still loading). */
  loading?: boolean;
  /** Skeleton card count when loading. */
  skeletonCount?: number;
  /** Subcategory deep-link for the "See all" CTA. */
  ctaSubCategory?: string;
}

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-[color:var(--dheerah-cream)] rounded-sm border border-[color:var(--dheerah-beige-soft)]" />
    <div className="mt-2.5 h-3.5 w-3/4 bg-[color:var(--dheerah-cream)] rounded-xs" />
    <div className="mt-1.5 h-3 w-1/2 bg-[color:var(--dheerah-cream)] rounded-xs" />
    <div className="mt-2 h-4 w-1/3 bg-[color:var(--dheerah-cream)] rounded-xs" />
  </div>
);

const ProductRail: React.FC<Props> = ({
  title,
  eyebrow,
  items,
  ctaCategory,
  ctaSubCategory,
  masterCategory,
  bg = 'white',
  loading = false,
  skeletonCount = 4
}) => {
  const { navigate } = useRouter();
  const ctaTarget = masterCategory ?? ctaCategory;

  // Don't render a sad empty rail — if data has loaded and there's nothing to show,
  // pull the whole section out of the document flow.
  if (!loading && items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={bg === 'soft' ? 'bg-[color:var(--dheerah-cream)] py-10 md:py-14' : 'bg-[color:var(--dheerah-ivory)] py-10 md:py-14'}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10">
        <div className="flex items-end justify-between mb-5 md:mb-7">
          <div>
            {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal text-[color:var(--dheerah-charcoal)] mt-1">{title}</h2>
          </div>
          <button
            onClick={() => navigate({ name: 'shop', category: ctaTarget, subCategory: ctaSubCategory })}
            className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)] transition-colors inline-flex items-center gap-1 group cursor-pointer"
          >
            <span>See All</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {items.slice(0, 5).map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard fabric={f} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default ProductRail;
