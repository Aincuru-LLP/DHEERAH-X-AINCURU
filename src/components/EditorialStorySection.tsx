import React from 'react';
import { motion } from 'motion/react';
import { useRouter } from '../context/RouterContext';

/**
 * Editorial Storytelling Section — Matching Figma Frame 316 & Frame 321
 * Placed immediately below New In.
 * 
 * Part 1 (Frame 316):
 * - Left column: Meadow floral footwear image (top) + "Every kurta carries a story..." quote (bottom)
 * - Right column: Tall sunflower meadow portrait
 * 
 * Part 2 (Frame 321):
 * - Left column: Dramatic red backdrop portrait in emerald suit
 * - Right column: "Explore the Collection →" Sand pill CTA + "At Dheerah, every kurta is a bridge..." brand philosophy
 */
const EditorialStorySection: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <section className="w-full bg-[color:var(--dheerah-ivory)] py-6 sm:py-8 md:py-10 lg:py-12 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">

        {/* ───────────── PART 1: Frame 316 ───────────── */}
        <div className="grid grid-cols-12 gap-3 sm:gap-6 md:gap-8 lg:gap-8 items-center">
          {/* Left Column (col-span-6): Top Image + Story Quote */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-6 md:col-span-6 flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-6"
          >
            {/* Top Meadow Footwear Image */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[682/470] overflow-hidden rounded-xs bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-border-soft)] shadow-xs">
              <img
                src="/figma-assets/editorial-feet-flowers.jpg"
                alt="Intricate handcrafted footwear in sunflower meadow"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover [object-position:50%_12%] [transform-origin:50%_20%] transition-transform duration-1000 ease-out hover:scale-106"
              />
            </div>

            {/* Story Quote: Exact Figma Typography */}
            <div className="flex items-center justify-center px-1 sm:px-4 md:px-4 lg:px-6 py-1 sm:py-2 md:py-3">
              <p className="font-sans font-normal text-[11px] xs:text-[12px] sm:text-[15px] md:text-[18px] lg:text-[24px] text-[color:var(--dheerah-charcoal)] leading-[1.5] sm:leading-[1.55] lg:leading-[1.5] tracking-normal sm:tracking-[0.03em] lg:tracking-[0.1em] text-center max-w-xl">
                Every kurta carries a story — heirloom craftsmanship meeting modern grace,
                designed to celebrate tradition while embracing today&apos;s woman effortlessly.
              </p>
            </div>
          </motion.div>

          {/* Right Column (col-span-6): Full-Height Sunflower Meadow Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-6 md:col-span-6"
          >
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[702/838] overflow-hidden rounded-xs bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-border-soft)] shadow-xs">
              <img
                src="/figma-assets/editorial-sunflower-palazzo.jpg"
                alt="Contemporary Dheerah silhouette in sunflower garden"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-106"
              />
            </div>
          </motion.div>
        </div>

        {/* ───────────── PART 2: Frame 321 ───────────── */}
        <div className="grid grid-cols-12 gap-3 sm:gap-6 md:gap-8 lg:gap-10 items-center">
          {/* Left Column (col-span-7, ~58% width): Dramatic Red Wall & Yellow Medallion Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-7 md:col-span-7"
          >
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[849/1083] overflow-hidden rounded-xs bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-border-soft)] shadow-sm">
              <img
                src="/figma-assets/editorial-red-backdrop-suit.jpg"
                alt="Heirloom emerald kurta against festive red floral backdrop"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-106"
              />
            </div>
          </motion.div>

          {/* Right Column (col-span-5, ~42% width): Sand CTA Pill Button + Brand Philosophy Statement */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-5 md:col-span-5 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-7 px-1 sm:px-4 md:px-2 lg:px-6"
          >
            {/* Pill CTA Button matching Figma Frame 302 */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.035, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate({ name: 'shop' })}
              aria-label="Explore the Collection"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 bg-[#CBC4BE] hover:bg-[#B8B0AA] text-[#000000] font-sans font-medium text-[10px] xs:text-[11px] sm:text-[14px] md:text-[18px] lg:text-[22px] px-3 xs:px-4 sm:px-7 md:px-9 lg:px-12 py-1.5 xs:py-2 sm:py-3 md:py-3.5 rounded-full shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <span className="whitespace-nowrap">Explore the Collection</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </motion.button>

            {/* Brand Philosophy: Exact Figma Typography */}
            <div className="max-w-md sm:max-w-lg">
              <p className="font-sans font-normal text-[10.5px] xs:text-[11.5px] sm:text-[14px] md:text-[18px] lg:text-[24px] text-[color:var(--dheerah-charcoal)] leading-[1.5] sm:leading-[1.55] lg:leading-[1.6] tracking-normal sm:tracking-[0.03em] lg:tracking-[0.1em] text-center">
                At Dheerah, every kurta is a bridge between generations — where heritage
                meets modern elegance. Each piece is crafted with care, designed to make
                you feel beautiful, comfortable, and confidently yourself.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default EditorialStorySection;
