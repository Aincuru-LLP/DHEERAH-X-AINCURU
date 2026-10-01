import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Laptop, Store, Eye, Scissors, HeartHandshake } from 'lucide-react';
import { storeJourneySteps } from '../../config/store';

const JOURNEY_ICONS = [Laptop, Store, Eye, Scissors, HeartHandshake];

/**
 * StoreJourney — Section 03 FROM YOUR SCREEN TO OUR STORE
 * Horizontal swipeable carousel on mobile for minimal scrolling + desktop track
 * Minimal animations and strict 3-color palette
 */
export const StoreJourney: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, offsetWidth } = scrollContainerRef.current;
    const index = Math.round(scrollLeft / (offsetWidth * 0.72));
    setActiveSlide(Math.min(Math.max(index, 0), storeJourneySteps.length - 1));
  };

  const scrollToSlide = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.offsetWidth * 0.75;
    scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setActiveSlide(index);
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
            THE JOURNEY
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="font-display text-xl sm:text-3xl md:text-4xl text-[color:var(--dheerah-black)] tracking-tight"
          >
            FROM YOUR SCREEN TO OUR STORE
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-sans text-[12px] sm:text-[14px] text-[color:var(--dheerah-text-muted)] mt-1.5 leading-relaxed font-light px-2"
          >
            Explore Dheerah online, then experience the fabrics, colours and craftsmanship in person.
          </motion.p>
        </div>

        {/* ───────────── DESKTOP VIEW (>= lg): TRACK LAYOUT ───────────── */}
        <div className="hidden lg:block relative">
          <div className="absolute top-[38px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-[color:var(--dheerah-border)] via-[color:var(--dheerah-crimson)]/50 to-[color:var(--dheerah-crimson)] opacity-50 z-0" />

          <div className="grid grid-cols-5 gap-5 relative z-10">
            {storeJourneySteps.map((step, idx) => {
              const Icon = JOURNEY_ICONS[idx] || Sparkles;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-[color:var(--dheerah-border)] group-hover:border-[color:var(--dheerah-crimson)] shadow-2xs flex items-center justify-center transition-all duration-200 group-hover:scale-104">
                      <Icon className="w-6 h-6 text-[color:var(--dheerah-charcoal)] group-hover:text-[color:var(--dheerah-crimson)] transition-colors" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[color:var(--dheerah-crimson)] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-[12px] uppercase tracking-[0.1em] text-[color:var(--dheerah-black)] mb-1 group-hover:text-[color:var(--dheerah-crimson)] transition-colors">
                    {step.label}
                  </h3>

                  <p className="font-sans text-[11px] text-[color:var(--dheerah-text-muted)] leading-relaxed max-w-[180px]">
                    {step.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ───────────── MOBILE / TABLET VIEW (< lg): HORIZONTAL SLIDES ───────────── */}
        <div className="lg:hidden">
          {/* Swipe Track: Drastically cuts vertical scrolling */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 -mx-3.5 px-3.5"
          >
            {storeJourneySteps.map((step, idx) => {
              const Icon = JOURNEY_ICONS[idx] || Sparkles;
              return (
                <div
                  key={step.step}
                  className="w-[72vw] sm:w-[46vw] max-w-[260px] shrink-0 snap-center p-3.5 rounded-xs bg-white border border-[color:var(--dheerah-border)] shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#FAF9F6] border border-[color:var(--dheerah-border)] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[color:var(--dheerah-charcoal)]" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--dheerah-crimson)] px-2 py-0.5 rounded-full bg-[color:var(--dheerah-crimson)]/10">
                        STEP {step.step}
                      </span>
                    </div>

                    <h3 className="font-sans font-bold text-[12px] uppercase tracking-[0.08em] text-[color:var(--dheerah-black)] mb-1">
                      {step.label}
                    </h3>

                    <p className="font-sans text-[11px] text-[color:var(--dheerah-text-muted)] leading-relaxed">
                      {step.text}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-[color:var(--dheerah-border-soft)] flex items-center justify-between text-[9px] text-[color:var(--dheerah-crimson)] font-medium">
                    <span>Swipe slide</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {storeJourneySteps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeSlide === i ? 'w-4 bg-[color:var(--dheerah-crimson)]' : 'w-1.5 bg-[color:var(--dheerah-border)]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default StoreJourney;
