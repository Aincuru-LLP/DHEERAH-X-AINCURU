import React from 'react';
import { motion } from 'motion/react';
import { Navigation, MessageCircle } from 'lucide-react';
import { storeInfo } from '../../config/store';

/**
 * StoreCTA — Section 09 FINAL CTA
 * Strict 3-color palette: Crimson (#C7042B), Gold (#CC9E00), Charcoal (#2E2E2E) on White
 * Compact mobile padding & minimal animations
 */
export const StoreCTA: React.FC = () => {
  const handleContact = () => {
    const text = encodeURIComponent("Hello Dheerah Designer Boutique, I would like to contact your styling team.");
    window.open(`https://wa.me/919962176172?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="w-full bg-white py-8 sm:py-14 md:py-18 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Luxury Banner Card in 3-color palette */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.35 }}
          className="relative rounded-xs overflow-hidden bg-gradient-to-br from-[#141414] via-[#1C1A18] to-[#0A0A0A] border border-[color:var(--dheerah-crimson)]/40 text-white p-5 sm:p-8 md:p-12 text-center shadow-lg"
        >
          {/* Subtle Background Pattern in brand colors */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(204,158,0,0.12),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(199,4,43,0.12),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-[color:var(--dheerah-crimson)]/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8D7BD] mb-2 sm:mb-3">
              THE DHEERAH ATELIER
            </div>

            {/* Heading */}
            <h2 className="font-display text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight mb-2 sm:mb-3">
              YOUR NEXT LOOK STARTS HERE.
            </h2>

            {/* Supporting Copy */}
            <p className="font-sans text-[12px] sm:text-[14px] text-[#E8D7BD]/85 font-light leading-relaxed max-w-lg mx-auto mb-5 sm:mb-6">
              Visit Dheerah and experience the collection, craftsmanship and personal styling in person.
            </p>

            {/* 2-Grid Action Buttons on Mobile */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md mx-auto">
              <a
                href={storeInfo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-6 min-h-[42px] shadow-sm hover:shadow-md cursor-pointer text-[11px] sm:text-[12px] active:scale-[0.98]"
                id="cta-get-directions-btn"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">GET DIRECTIONS</span>
              </a>

              <button
                type="button"
                onClick={handleContact}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-6 min-h-[42px] rounded-[4px] border border-white/50 bg-white/5 hover:bg-white hover:text-black hover:border-white text-white font-sans text-[11px] sm:text-[12px] font-semibold tracking-[0.06em] uppercase transition-all backdrop-blur-xs cursor-pointer active:scale-[0.98]"
                id="cta-contact-us-btn"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="truncate">CONTACT US</span>
              </button>
            </div>

            {/* Store Location Footer note */}
            <p className="text-[10px] sm:text-[11px] text-[#A69B8D] mt-5 sm:mt-6 tracking-wider uppercase font-medium">
              No. 14, South Sivan Koil Street · Vadapalani · Chennai
            </p>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default StoreCTA;
