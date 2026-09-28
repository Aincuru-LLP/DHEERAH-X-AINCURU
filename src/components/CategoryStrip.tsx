import React from 'react';
import { motion } from 'motion/react';
import { useRouter } from '../context/RouterContext';

interface CategoryTile {
  name: string;
  categoryKey: string;
  image: string;
}

const CATEGORIES: CategoryTile[] = [
  {
    name: 'Raw Silks',
    categoryKey: 'raw-silk',
    image: '/figma-assets/cat-raw-silks.png',
  },
  {
    name: 'Maxis',
    categoryKey: 'maxis',
    image: '/figma-assets/cat-maxis.png',
  },
  {
    name: 'Kalamkari',
    categoryKey: 'kalamkari',
    image: '/figma-assets/cat-kalamkari.png',
  },
  {
    name: 'Salwar Suits',
    categoryKey: 'salwar-suits',
    image: '/figma-assets/cat-salwar-suits.png',
  },
];

/**
 * Explore More — Category Strip matching Figma Frame 309
 * Features warm terracotta (#C47457) canvas with arched category cards.
 */
const CategoryStrip: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-[#C47457] py-10 md:py-14 my-8 md:my-12 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-white text-center lg:text-left shrink-0"
          >
            <p className="text-[18px] md:text-[22px] tracking-[0.2em] uppercase font-display font-medium opacity-90">
              EXPLORE
            </p>
            <h2 className="text-[32px] md:text-[44px] font-display font-normal leading-none uppercase tracking-wide">
              MORE
            </h2>
          </motion.div>

          {/* Category Cards Carousel / Grid */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto max-w-full pb-3 scrollbar-none snap-x snap-mandatory">
            {CATEGORIES.map((cat, idx) => (
              <motion.button
                key={cat.categoryKey}
                initial={{ opacity: 0, y: 20, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.12 * idx, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate({ name: 'shop', category: cat.categoryKey })}
                className="group flex flex-col items-center shrink-0 snap-center text-center cursor-pointer"
                aria-label={`Explore ${cat.name}`}
              >
                {/* Arched image container matching Figma — increased scale while preserving 4:5 aspect ratio and arched crown */}
                <div className="w-[155px] sm:w-[185px] md:w-[215px] lg:w-[235px] xl:w-[248px] aspect-[4/5] rounded-t-[78px] sm:rounded-t-[93px] md:rounded-t-[108px] lg:rounded-t-[118px] xl:rounded-t-[124px] rounded-b-[24px] overflow-hidden bg-white/20 shadow-md border border-white/25 group-hover:border-white/80 group-hover:shadow-xl transition-all duration-500">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                </div>
                <span className="mt-3 text-[14px] sm:text-[16px] font-medium text-white tracking-wide transition-opacity group-hover:opacity-90">
                  {cat.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CategoryStrip;
