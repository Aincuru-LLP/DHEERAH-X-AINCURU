import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { storeInfo } from '../../config/store';

/**
 * StoreRedDoor — Section 05 BEHIND THE RED DOOR
 * Strict 3-color palette: Crimson (#C7042B), Gold (#CC9E00), Charcoal (#2E2E2E) on White
 * Mobile-first responsive split layout with fluid touch targets
 */
export const StoreRedDoor: React.FC = () => {
  const handleConsultation = () => {
    const text = encodeURIComponent("Hello Dheerah Boutique, I would like to schedule a private styling consultation at your Vadapalani store.");
    window.open(`https://wa.me/919962176172?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleScrollToVisit = () => {
    const el = document.getElementById('visit-dheerah');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-[#FAF9F6] py-12 sm:py-16 md:py-20 lg:py-24 border-b border-[color:var(--dheerah-border-soft)] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Showcase (Storefront & Red Door Atmosphere) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-[5/6] rounded-xs overflow-hidden bg-white border border-[color:var(--dheerah-border)] shadow-md group">
              <img
                src={storeInfo.interiorImage}
                alt="Inside Dheerah Designer Boutique showroom - Designer gowns, pure silks, and tailored collections"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              
              {/* Subtle red emblem badge */}
              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 p-3 sm:p-4 rounded-xs bg-black/85 backdrop-blur-md border border-[color:var(--dheerah-crimson)]/50 text-white max-w-[260px] sm:max-w-[280px]">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--dheerah-crimson)] mb-1">
                  ATELIER SANCTUARY
                </p>
                <p className="font-sans text-[11px] sm:text-[12px] text-[#FAF7F0] font-light leading-snug">
                  Curated designer wear, festive gowns & pure silks on South Sivan Koil Street.
                </p>
              </div>
            </div>

            {/* Accent backdrop shadow */}
            <div className="absolute -bottom-3 -right-3 w-full h-full border border-[color:var(--dheerah-crimson)]/20 -z-10 rounded-xs hidden sm:block" />
          </motion.div>

          {/* Right Column: Editorial Copy & Personal Attention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-6"
          >
            <div className="section-eyebrow text-[10px] sm:text-[11px]">
              THE BOUTIQUE SANCTUARY
            </div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[color:var(--dheerah-black)] tracking-tight leading-[1.1]">
              BEHIND THE RED DOOR
            </h2>

            <p className="font-sans text-[14px] sm:text-[16px] md:text-[17px] text-[color:var(--dheerah-charcoal)] leading-relaxed font-normal">
              Step inside Dheerah and discover a boutique experience built around design, craftsmanship and personal attention.
            </p>

            <p className="font-sans text-[12px] sm:text-[13px] md:text-[14px] text-[color:var(--dheerah-text-muted)] leading-relaxed font-light">
              Beyond the iconic crimson entryway in Vadapalani lies an intimate sanctuary dedicated to authentic Indian sartorial heritage. Here, fabric bolts aren&apos;t just displayed; they are unrolled onto master cutting tables, draped across shoulders to test natural falls, and paired with custom-dyed yarns under warm boutique lighting.
            </p>

            {/* Two key pillars in 3-color palette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2.5 p-3 rounded-xs bg-white border border-[color:var(--dheerah-border)] shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[color:var(--dheerah-crimson)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sans font-semibold text-[12px] sm:text-[13px] text-[color:var(--dheerah-black)]">Master Tailoring</h4>
                  <p className="text-[11px] text-[color:var(--dheerah-text-muted)] mt-0.5 leading-snug">Precise personal measurements taken on-site by experienced pattern makers.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xs bg-white border border-[color:var(--dheerah-border)] shadow-2xs">
                <Heart className="w-4 h-4 text-[color:var(--dheerah-crimson)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sans font-semibold text-[12px] sm:text-[13px] text-[color:var(--dheerah-black)]">Private Bridal Suite</h4>
                  <p className="text-[11px] text-[color:var(--dheerah-text-muted)] mt-0.5 leading-snug">Relaxed family consultations for muhurtham silk sarees and lehengas.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Full-width on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConsultation}
                className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-6 text-[12px] min-h-[44px] cursor-pointer active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                BOOK AN APPOINTMENT
              </button>

              <button
                type="button"
                onClick={handleScrollToVisit}
                className="btn-outline inline-flex items-center justify-center gap-2 py-3 px-6 text-[12px] min-h-[44px] cursor-pointer active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                PLAN YOUR VISIT
              </button>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default StoreRedDoor;
