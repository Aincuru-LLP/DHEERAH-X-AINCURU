import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { storeExperiences, type StoreExperience } from '../../config/store';
import { useRouter } from '../../context/RouterContext';

/**
 * StoreExperiences — Section 02 MORE THAN A STORE
 * 2-grid design on mobile for reduced scrolling + 3-color brand palette + minimal animations
 */
export const StoreExperiences: React.FC = () => {
  const { navigate } = useRouter();

  const handleAction = (exp: StoreExperience) => {
    if (exp.ctaAction === 'shop') {
      navigate({ name: 'shop', category: 'Sarees' });
    } else {
      const message = encodeURIComponent(`Hello Dheerah Boutique, I would like to inquire about ${exp.title} services at your Vadapalani store.`);
      window.open(`https://wa.me/919962176172?text=${message}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="more-than-a-store" className="w-full bg-white py-8 sm:py-14 md:py-18 border-b border-[color:var(--dheerah-border-soft)]">
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
            THE FOUR PILLARS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="font-display text-xl sm:text-3xl md:text-4xl text-[color:var(--dheerah-black)] tracking-tight"
          >
            MORE THAN A STORE
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-sans text-[12px] sm:text-[14px] text-[color:var(--dheerah-text-muted)] mt-1.5 leading-relaxed font-light px-2"
          >
            A space where fabrics, design, craftsmanship and personal styling come together under one roof.
          </motion.p>
        </div>

        {/* 2-Grid Design on Mobile: 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 lg:gap-5">
          {storeExperiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="card-product group flex flex-col justify-between overflow-hidden bg-white border border-[color:var(--dheerah-border)] rounded-xs transition-all duration-200 hover:border-[color:var(--dheerah-crimson)] hover:shadow-xs"
            >
              <div>
                {/* Image Frame */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#F9F8F6]">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
                  />
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-black/80 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] text-white rounded-xs border border-[color:var(--dheerah-crimson)]/40">
                      0{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Card Body: Compact for 2-column mobile */}
                <div className="p-2.5 sm:p-4">
                  <div className="mb-1 sm:mb-2">
                    <h3 className="font-display text-[12px] sm:text-base lg:text-lg text-[color:var(--dheerah-black)] tracking-tight leading-snug group-hover:text-[color:var(--dheerah-crimson)] transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--dheerah-crimson)] mt-0.5 truncate">
                      {exp.subtitle}
                    </p>
                  </div>

                  <p className="font-sans text-[10px] sm:text-[12px] text-[color:var(--dheerah-text-muted)] leading-relaxed mb-2 line-clamp-2 sm:line-clamp-3">
                    {exp.description}
                  </p>

                  {/* Feature Highlights: 2 compact bullets */}
                  <ul className="space-y-0.5 pt-1.5 border-t border-[color:var(--dheerah-border-soft)] mb-2">
                    {exp.features.slice(0, 2).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1 text-[9px] sm:text-[11px] text-[color:var(--dheerah-charcoal)] leading-tight">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[color:var(--dheerah-crimson)] shrink-0 mt-0.5" />
                        <span className="truncate">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="p-2.5 sm:p-4 pt-0">
                <button
                  type="button"
                  onClick={() => handleAction(exp)}
                  className="w-full btn-outline flex items-center justify-center gap-1 text-[9px] sm:text-[11px] py-1.5 sm:py-2 min-h-[34px] sm:min-h-[38px] group/btn hover:bg-[color:var(--dheerah-crimson)] hover:text-white hover:border-[color:var(--dheerah-crimson)] transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span className="truncate">{exp.ctaText}</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StoreExperiences;
