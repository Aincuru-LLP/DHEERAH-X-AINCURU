import React from 'react';
import { motion } from 'motion/react';
import { Navigation, ArrowDown, MapPin } from 'lucide-react';
import { storeInfo } from '../../config/store';

interface StoreHeroProps {
  onScrollToExperiences?: () => void;
}

/**
 * StoreHero — 100% Clear & Natural Storefront Showcase
 * Zero dark shade / black color overlay.
 * Redesigned luxury action buttons with no clunky card blocking the storefront.
 * Minimal, fast animations.
 */
export const StoreHero: React.FC<StoreHeroProps> = ({ onScrollToExperiences }) => {
  const handleScrollToVisit = () => {
    if (onScrollToExperiences) {
      onScrollToExperiences();
    } else {
      const element = document.getElementById('more-than-a-store');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full pt-[68px] sm:pt-[76px] md:pt-[84px] bg-[#FAF9F6] border-b border-[color:var(--dheerah-border-soft)] overflow-hidden">
      
      {/* ────── TOP EDITORIAL & REDESIGNED BUTTONS ────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-5 sm:pb-8 text-center">
        
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="section-eyebrow mb-2 justify-center text-[10px] sm:text-[11px]"
        >
          FLAGSHIP BOUTIQUE · VADAPALANI
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="font-display text-2xl sm:text-4xl md:text-5xl text-[color:var(--dheerah-black)] tracking-tight leading-tight"
        >
          COME EXPERIENCE DHEERAH
        </motion.h1>

        {/* Slogan */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="font-sans text-[13px] sm:text-[15px] md:text-[16px] text-[color:var(--dheerah-text-muted)] font-light leading-relaxed mt-2 max-w-xl mx-auto"
        >
          Where tradition, craftsmanship and personal style come together.
        </motion.p>

        {/* Redesigned Luxury Action Buttons: Sleek 2-button layout, zero clunky card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex items-center justify-center gap-2.5 sm:gap-4 mt-5 sm:mt-6 max-w-md mx-auto"
        >
          <button
            type="button"
            onClick={handleScrollToVisit}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-3 px-4 sm:px-7 rounded-full bg-[color:var(--dheerah-crimson)] hover:bg-black text-white text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.08em] uppercase transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] min-h-[44px] cursor-pointer"
            id="hero-visit-store-btn"
          >
            <ArrowDown className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">VISIT OUR STORE</span>
          </button>

          <a
            href={storeInfo.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-3 px-4 sm:px-7 rounded-full border border-[color:var(--dheerah-crimson)] bg-white hover:bg-[color:var(--dheerah-charcoal)] hover:text-white hover:border-[color:var(--dheerah-charcoal)] text-[color:var(--dheerah-black)] text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.08em] uppercase transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] min-h-[44px]"
            id="hero-get-directions-btn"
          >
            <Navigation className="w-3.5 h-3.5 text-[color:var(--dheerah-crimson)] shrink-0" />
            <span className="truncate">GET DIRECTIONS</span>
          </a>
        </motion.div>
      </div>

      {/* ────── 100% CLEAR STOREFRONT PHOTOGRAPH (NO BLACK SHADE) ────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8 pb-6 sm:pb-10"
      >
        <div className="relative w-full rounded-xs sm:rounded-sm overflow-hidden border border-[color:var(--dheerah-border)] shadow-md bg-white">
          <img
            src={storeInfo.storefrontImage}
            alt="Dheerah Designer Boutique physical storefront in Vadapalani, Chennai"
            className="w-full h-auto max-h-[560px] md:max-h-[640px] object-cover object-center select-none"
            loading="eager"
            fetchPriority="high"
          />
          
          {/* Subtle Corner Badge for quick location reassurance (non-intrusive) */}
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[color:var(--dheerah-crimson)]/50 shadow-sm text-[10px] sm:text-[12px] font-semibold text-[color:var(--dheerah-charcoal)]">
            <MapPin className="w-3 h-3 text-[color:var(--dheerah-crimson)]" />
            <span>South Sivan Koil St, Vadapalani</span>
          </div>
        </div>
      </motion.div>

    </section>
  );
};

export default StoreHero;
