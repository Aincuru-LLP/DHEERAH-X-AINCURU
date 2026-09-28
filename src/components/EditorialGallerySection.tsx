import React from 'react';
import { motion } from 'motion/react';
import { useRouter } from '../context/RouterContext';

interface EditorialSlide {
  id: string;
  image: string;
  alt: string;
  title: string;
  category?: string;
}

const EDITORIAL_SLIDES: EditorialSlide[] = [
  {
    id: 'slide-1',
    image: '/figma-assets/editorial-sitting-chair.jpg',
    alt: 'Dheerah handcrafted beige kurta collection',
    title: 'The Atelier Essence',
    category: 'salwar-suits',
  },
  {
    id: 'slide-2',
    image: '/figma-assets/editorial-garden-portrait.jpg',
    alt: 'Dheerah contemporary festive terracotta kurta',
    title: 'Modern Festive Poetry',
    category: 'kalamkari',
  },
];

/**
 * Editorial Gallery Section — Matching Figma Frame 373 (Desktop) & Frame 435 (Mobile)
 * Placed immediately below Explore More (CategoryStrip).
 * Features high-fashion editorial imagery: dual-grid on desktop, single editorial on mobile.
 */
const EditorialGallerySection: React.FC = () => {
  const { navigate } = useRouter();

  // On mobile responsive, sitting-chair image is removed
  const mobileSlides = EDITORIAL_SLIDES.filter(
    (slide) => slide.image !== '/figma-assets/editorial-sitting-chair.jpg'
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-[color:var(--dheerah-ivory)] py-6 sm:py-8 md:py-12 lg:py-14 select-none"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop View (md+): Dual Editorial Frames Side-by-Side (Matching Frame 373) */}
        <div className="hidden md:grid md:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
          {EDITORIAL_SLIDES.map((slide, idx) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
              onClick={() => navigate({ name: 'shop', category: slide.category })}
              className="group relative cursor-pointer overflow-hidden bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-border-soft)] hover:border-[color:var(--dheerah-gold)]/40 shadow-xs hover:shadow-xl rounded-xs transition-colors duration-500"
            >
              <div className="w-full aspect-[69/80] overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading="lazy"
                  decoding="async"
                  className={
                    slide.id === 'slide-2'
                      ? 'w-full h-full object-cover [object-position:47%_0%] [transform-origin:47%_0%] [transform:scale(1.22)] transition-transform duration-1000 ease-out group-hover:[transform:scale(1.27)]'
                      : 'w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.04]'
                  }
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Mobile View (<md): Single editorial frame (sitting chair removed on mobile) */}
        <div className="md:hidden relative">
          {mobileSlides.map((slide) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate({ name: 'shop', category: slide.category })}
              className="w-full cursor-pointer"
            >
              <div className="relative aspect-[353/373] w-full overflow-hidden bg-[color:var(--dheerah-cream)] rounded-xs border border-[color:var(--dheerah-border-soft)] shadow-xs">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover [object-position:47%_0%] [transform-origin:47%_0%] [transform:scale(1.14)] editorial-garden-mobile-image"
                />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.section>
  );
};

export default EditorialGallerySection;
