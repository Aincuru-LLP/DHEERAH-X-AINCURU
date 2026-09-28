import React from 'react';
import { motion } from 'motion/react';
import { useRouter } from '../context/RouterContext';

/**
 * Home Hero Section matching Figma Design
 * (Desktop & Mobile Figma frames: 2107-6466 / 2126-10432)
 */
const Hero: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <section className="relative pt-[72px] md:pt-[88px] bg-white overflow-hidden">
      {/* ============================================================ */}
      {/* MOBILE HERO SECTION (< md)                                   */}
      {/* Exact match to Figma Mobile Hero (Frame 306 / Node 2126-10454) */}
      {/* Yellow-dress model with complete head, face, outfit & CTA    */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden relative w-full aspect-[393/656] overflow-hidden bg-[#FAF9F5]"
      >
        <img
          src="/figma-assets/mobile-home-hero-frame.png"
          alt="Evergreen Cotton Gowns - Dheerah"
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover object-center"
        />

        {/* Interactive clickable hotspot matching 'Explore the Collection →' pill */}
        <motion.button
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ name: 'shop' })}
          className="absolute left-[12%] top-[76.2%] w-[49%] h-[8.4%] rounded-full cursor-pointer hover:bg-black/5 active:bg-black/10 focus:outline-none focus:ring-2 focus:ring-[#C47457] transition-shadow"
          aria-label="Explore the Collection"
        >
          <span className="sr-only">Explore the Collection</span>
        </motion.button>
      </motion.div>

      {/* ============================================================ */}
      {/* DESKTOP HERO SECTION (>= md)                                 */}
      {/* Exact match to user's uploaded reference image (Frame 296)   */}
      {/* Full width edge-to-edge on left and right side               */}
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
          className="w-full h-auto block"
        />

        {/* Interactive clickable hotspot matching 'Explore the Collection →' pill */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate({ name: 'shop' })}
          className="absolute left-[38.4%] top-[80.0%] w-[23.2%] h-[5.4%] rounded-full cursor-pointer hover:bg-black/5 active:bg-black/10 focus:outline-none focus:ring-2 focus:ring-[#C47457] transition-shadow"
          aria-label="Explore the Collection"
        >
          <span className="sr-only">Explore the Collection</span>
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Hero;
