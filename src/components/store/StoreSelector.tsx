import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';
import { storeExperiences, type StoreExperience } from '../../config/store';
import { useRouter } from '../../context/RouterContext';

/**
 * StoreSelector — Section 07 WHAT ARE YOU LOOKING FOR?
 * Strict 3-color palette: Crimson (#C7042B), Gold (#CC9E00), Charcoal (#2E2E2E) on White
 * Compact mobile padding & minimal animations
 */
export const StoreSelector: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedKey, setSelectedKey] = useState<string>(storeExperiences[0].key);

  const currentExperience = storeExperiences.find(exp => exp.key === selectedKey) || storeExperiences[0];

  const handleCta = (exp: StoreExperience) => {
    if (exp.ctaAction === 'shop') {
      navigate({ name: 'shop', category: 'Sarees' });
    } else {
      const msg = encodeURIComponent(`Hello Dheerah Boutique, I am planning a visit for ${exp.title}. Please provide more details on appointment slots.`);
      window.open(`https://wa.me/919962176172?text=${msg}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="w-full bg-[#FAF9F6] py-8 sm:py-14 md:py-18 border-b border-[color:var(--dheerah-border-soft)] overflow-hidden">
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
            DISCOVERY CONCIERGE
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="font-display text-xl sm:text-3xl md:text-4xl text-[color:var(--dheerah-black)] tracking-tight"
          >
            WHAT ARE YOU LOOKING FOR?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-sans text-[12px] sm:text-[14px] text-[color:var(--dheerah-text-muted)] mt-1.5 leading-relaxed font-light px-2"
          >
            Select a service to see how our team tailors your in-store consultation.
          </motion.p>
        </div>

        {/* Interactive Selection Tabs: Smooth horizontal swipe row */}
        <div className="flex items-center sm:justify-center gap-2 sm:gap-2.5 mb-6 sm:mb-8 overflow-x-auto scrollbar-none pb-1.5 px-0.5 -mx-3.5 px-3.5 sm:mx-0">
          {storeExperiences.map((exp) => {
            const isSelected = exp.key === selectedKey;
            return (
              <button
                key={exp.key}
                type="button"
                onClick={() => setSelectedKey(exp.key)}
                className={`whitespace-nowrap px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[12px] font-sans font-semibold tracking-[0.06em] uppercase transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[color:var(--dheerah-crimson)] text-white shadow-xs'
                    : 'bg-white text-[color:var(--dheerah-charcoal)] border border-[color:var(--dheerah-border)] hover:border-[color:var(--dheerah-crimson)]'
                }`}
              >
                {exp.title}
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Panel in 3-color palette */}
        <div className="relative rounded-xs border border-[color:var(--dheerah-border)] bg-white overflow-hidden shadow-2xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExperience.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center p-4 sm:p-6 lg:p-8"
            >
              
              {/* Left Column: Description & CTAs */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-crimson)]">
                    {currentExperience.subtitle}
                  </span>
                  <h3 className="font-display text-lg sm:text-2xl lg:text-3xl text-[color:var(--dheerah-black)] tracking-tight mt-0.5">
                    {currentExperience.title}
                  </h3>
                  <p className="font-sans font-medium text-[12px] sm:text-[13px] text-[color:var(--dheerah-charcoal)] mt-1">
                    {currentExperience.tagline}
                  </p>
                </div>

                <p className="font-sans text-[11px] sm:text-[13px] text-[color:var(--dheerah-text-muted)] leading-relaxed">
                  {currentExperience.description}
                </p>

                {/* Key Benefits List */}
                <div className="space-y-1.5 pt-2 border-t border-[color:var(--dheerah-border-soft)]">
                  {currentExperience.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--dheerah-crimson)] shrink-0 mt-0.5" />
                      <span className="font-sans text-[11px] sm:text-[12px] text-[color:var(--dheerah-charcoal)] font-medium">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Relevant CTA Buttons in 3 colors */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCta(currentExperience)}
                    className="btn-primary inline-flex items-center justify-center gap-2 py-2.5 px-5 text-[11px] sm:text-[12px] min-h-[42px] cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    {currentExperience.ctaAction === 'shop' ? (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>{currentExperience.ctaText}</span>
                  </button>

                  <a
                    href="https://wa.me/919962176172?text=Hello%20Dheerah%2C%20I%20have%20questions%20regarding%20store%20timings%20and%20consultations."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline inline-flex items-center justify-center gap-2 py-2.5 px-5 text-[11px] sm:text-[12px] min-h-[42px] cursor-pointer text-center active:scale-[0.98]"
                  >
                    ASK CONCIERGE ON WHATSAPP
                  </a>
                </div>

              </div>

              {/* Right Column: Visual Frame */}
              <div className="lg:col-span-5">
                <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-xs overflow-hidden bg-[#FAF9F6] border border-[color:var(--dheerah-border)] shadow-2xs">
                  <img
                    src={currentExperience.image}
                    alt={currentExperience.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-[10px] sm:text-[11px] font-medium tracking-wide">
                    Dheerah Designer Boutique · Vadapalani
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default StoreSelector;
