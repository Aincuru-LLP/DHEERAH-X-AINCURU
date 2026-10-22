import React from 'react';
import { motion } from 'motion/react';
import { Link } from '../context/RouterContext';

/**
 * Home Hero Section matching Figma Design
 * Features responsive hero imagery with real, accessible "Explore the Collection →" CTA.
 */
const Hero: React.FC = () => {
  return (
    <section className="relative pt-[64px] sm:pt-[72px] md:pt-[88px] bg-white overflow-hidden">
      {/* ============================================================ */}
      {/* MOBILE HERO SECTION (< md)                                   */}
      {/* Portrait hero frame with clean image & accessible CTA button */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden relative w-full aspect-[393/656] sm:aspect-[2/3] overflow-hidden bg-[#FAF9F5]"
      >
        <img
          src="/figma-assets/mobile-home-hero-frame.png"
          alt="Evergreen Cotton Gowns - Dheerah"
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />

        {/* Real interactive "Explore the Collection →" CTA Link */}
        <Link
          to="/shop"
          className="hero-cta group absolute left-1/2 -translate-x-1/2 bottom-[8.5%] z-10 inline-flex items-center justify-center gap-2.5 bg-[#FAF7EE] hover:bg-[#F3EFE4] active:bg-[#EBE5D6] text-[#0F1A12] font-sans font-medium text-[13px] xs:text-[14px] sm:text-[15px] px-6 xs:px-7 sm:px-8 py-3 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] active:scale-[0.98] transition-all duration-200 cursor-pointer pointer-events-auto min-h-[44px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A12] focus-visible:ring-offset-2 select-none"
          aria-label="Explore the collection and shop all products"
        >
          <span>Explore the Collection</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </motion.div>

      {/* ============================================================ */}
      {/* DESKTOP HERO SECTION (>= md)                                 */}
      {/* Wide hero layout with heading on left and model on right     */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:block relative w-full overflow-hidden bg-[#FAF9F5]"
      >
        <img
          src="/figma-assets/desktop-home-hero-clean.png"
          alt="Evergreen Cotton Gowns - Dheerah"
          loading="eager"
          fetchPriority="high"
          className="w-full h-auto block pointer-events-none select-none"
        />

        {/* Real interactive "Explore the Collection →" CTA Link */}
        <Link
          to="/shop"
          className="hero-cta group absolute left-[10.2%] top-[39.4%] z-10 inline-flex items-center justify-center gap-2.5 lg:gap-3 bg-[#FAF7EE] hover:bg-[#F3EFE4] active:bg-[#EBE5D6] text-[#0F1A12] font-sans font-medium text-[13px] md:text-[14px] lg:text-[17px] xl:text-[20px] 2xl:text-[23px] px-5 md:px-6 lg:px-8 xl:px-9 2xl:px-10 py-2 md:py-2.5 lg:py-3.5 xl:py-4 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] active:scale-[0.98] transition-all duration-200 cursor-pointer pointer-events-auto min-h-[44px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1A12] focus-visible:ring-offset-2 select-none"
          aria-label="Explore the collection and shop all products"
        >
          <span>Explore the Collection</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </motion.div>
    </section>
  );
};

export default Hero;

