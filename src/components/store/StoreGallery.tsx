import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';
import { storeGalleryItems, type StoreGalleryItem } from '../../config/store';

/**
 * StoreGallery — Section 06 A GLIMPSE INSIDE DHEERAH
 * 2-Grid design on mobile to reduce vertical scrolling
 * Strict 3-color palette: Crimson (#C7042B), Gold (#CC9E00), Charcoal (#2E2E2E) on White
 * Minimal, fast animations
 */
export const StoreGallery: React.FC = () => {
  const [activeItem, setActiveItem] = useState<StoreGalleryItem | null>(null);

  return (
    <section className="w-full bg-white py-8 sm:py-14 md:py-18 border-b border-[color:var(--dheerah-border-soft)] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="section-eyebrow mb-1.5 justify-center text-[10px] sm:text-[11px]"
          >
            BOUTIQUE IMPRESSIONS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="font-display text-xl sm:text-3xl md:text-4xl text-[color:var(--dheerah-black)] tracking-tight"
          >
            A GLIMPSE INSIDE DHEERAH
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-sans text-[12px] sm:text-[14px] text-[color:var(--dheerah-text-muted)] mt-1.5 leading-relaxed font-light px-2"
          >
            An intimate visual anthology of our Vadapalani store, artisan workbenches, and handcrafted collections.
          </motion.p>
        </div>

        {/* 2-Grid Design on Mobile: 2 columns on mobile, 12-column editorial on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3.5 md:gap-4">
          {storeGalleryItems.map((item, idx) => {
            // Determine mobile span: item 0 and item 5 span 2 columns, others take 1 column
            const mobileSpan = (idx === 0 || idx === 5) ? 'col-span-2' : 'col-span-1';
            const desktopSpan = item.span || 'md:col-span-4';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`${mobileSpan} ${desktopSpan} group relative rounded-xs overflow-hidden bg-white border border-[color:var(--dheerah-border)] shadow-2xs cursor-pointer active:scale-[0.99]`}
                onClick={() => setActiveItem(item)}
              >
                <div className={`w-full ${item.aspect} max-h-[340px] overflow-hidden relative`}>
                  <img
                    src={item.image}
                    alt={`${item.label} - ${item.title}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104"
                  />

                  {/* Ambient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-85 transition-opacity" />

                  {/* Category Pill Tag in 3-color Crimson & Charcoal */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span className="inline-flex items-center px-2 py-0.5 bg-black/80 backdrop-blur-md text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] text-white border border-[color:var(--dheerah-crimson)]/50 rounded-full">
                      {item.label}
                    </span>
                  </div>

                  {/* Expand Icon */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <ZoomIn className="w-3 h-3" />
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-4 text-white">
                    <h3 className="font-display text-[12px] sm:text-base lg:text-lg text-white tracking-tight mb-0.5 group-hover:text-[color:var(--dheerah-crimson)] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="font-sans text-[10px] sm:text-[11px] text-[#FAF7F0]/80 line-clamp-1 sm:line-clamp-2 font-light">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl w-full bg-[#111] rounded-sm overflow-hidden border border-[color:var(--dheerah-crimson)]/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-[color:var(--dheerah-crimson)] transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="max-h-[60vh] sm:max-h-[72vh] overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="max-h-[60vh] sm:max-h-[72vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="p-3.5 sm:p-5 bg-[#161616] border-t border-white/10 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[color:var(--dheerah-crimson)]">
                    {activeItem.label}
                  </span>
                </div>
                <h4 className="font-display text-base sm:text-lg text-white">
                  {activeItem.title}
                </h4>
                <p className="font-sans text-[11px] text-white/80 mt-1 font-light">
                  {activeItem.caption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default StoreGallery;
