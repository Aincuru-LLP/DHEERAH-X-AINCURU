import React from 'react';
import { motion } from 'motion/react';
import { dheerahExperienceSteps } from '../../config/store';

/**
 * StoreExperienceSteps — Section 04 THE DHEERAH EXPERIENCE
 * 2-Grid design on mobile to drastically reduce vertical scrolling
 * Strict 3-color palette: Crimson (#C7042B), Gold (#CC9E00), Charcoal (#2E2E2E) on White
 * Minimal, fast animations
 */
export const StoreExperienceSteps: React.FC = () => {
  return (
    <section className="w-full bg-white py-8 sm:py-14 md:py-18 border-b border-[color:var(--dheerah-border-soft)]">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="section-eyebrow mb-1.5 justify-center text-[10px] sm:text-[11px]"
          >
            BESPOKE METHODOLOGY
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="font-display text-xl sm:text-3xl md:text-4xl text-[color:var(--dheerah-black)] tracking-tight"
          >
            THE DHEERAH EXPERIENCE
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-sans text-[12px] sm:text-[14px] text-[color:var(--dheerah-text-muted)] mt-1.5 leading-relaxed font-light px-2"
          >
            A dedicated journey designed around your personal style, celebrations and exact comfort.
          </motion.p>
        </div>

        {/* 2-Grid Design on Mobile: 2 columns on mobile, 5 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
          {dheerahExperienceSteps.map((step, idx) => {
            const isLastOnMobile = idx === dheerahExperienceSteps.length - 1;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`${
                  isLastOnMobile ? 'col-span-2 lg:col-span-1' : 'col-span-1'
                } bg-white border border-[color:var(--dheerah-border)] rounded-xs p-3 sm:p-4 lg:p-5 flex flex-col justify-between hover:border-[color:var(--dheerah-crimson)] hover:shadow-md transition-all duration-200 group`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[color:var(--dheerah-border-soft)]">
                    <span className="font-display text-lg sm:text-2xl text-[color:var(--dheerah-crimson)] transition-colors">
                      {step.step}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-text-muted)]">
                      PHASE 0{idx + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-[13px] sm:text-base lg:text-lg text-[color:var(--dheerah-black)] tracking-tight mb-1 group-hover:text-[color:var(--dheerah-crimson)] transition-colors leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans font-medium text-[11px] sm:text-[12px] text-[color:var(--dheerah-charcoal)] leading-snug mb-1">
                    {step.description}
                  </p>

                  {/* Detail */}
                  <p className="font-sans text-[10px] sm:text-[11px] text-[color:var(--dheerah-text-muted)] leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                    {step.detail}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className="mt-3 pt-2 border-t border-[color:var(--dheerah-border-soft)] flex items-center justify-between">
                  <span className="w-3 h-0.5 bg-[color:var(--dheerah-crimson)]/50 rounded-full group-hover:w-6 group-hover:bg-[color:var(--dheerah-crimson)] transition-all duration-200" />
                  <span className="text-[8px] uppercase tracking-wider text-[color:var(--dheerah-text-light)]">Dheerah</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default StoreExperienceSteps;
