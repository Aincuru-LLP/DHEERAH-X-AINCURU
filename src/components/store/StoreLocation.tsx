import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Navigation, MessageCircle, ExternalLink, Check } from 'lucide-react';
import { storeInfo } from '../../config/store';

/**
 * StoreLocation — Section 08 VISIT DHEERAH
 * 2-Grid design for contact buttons & amenities on mobile
 * Strict 3-color palette: Crimson (#C7042B), Gold (#CC9E00), Charcoal (#2E2E2E) on White
 * Minimal, fast animations
 */
export const StoreLocation: React.FC = () => {
  return (
    <section id="visit-dheerah" className="w-full bg-white py-8 sm:py-14 md:py-18 border-b border-[color:var(--dheerah-border-soft)] overflow-hidden">
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
            LOCATION & TIMINGS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="font-display text-xl sm:text-3xl md:text-4xl text-[color:var(--dheerah-black)] tracking-tight"
          >
            VISIT DHEERAH
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-sans text-[12px] sm:text-[14px] text-[color:var(--dheerah-text-muted)] mt-1.5 leading-relaxed font-light px-2"
          >
            We welcome you to experience our collections, feel pure silk handlooms, and meet our master tailoring artisans in person.
          </motion.p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-start">
          
          {/* Store Details Column (lg:col-span-6) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-6 space-y-3.5 sm:space-y-5"
          >
            {/* Address Card */}
            <div className="bg-[#FAF9F6] rounded-xs border border-[color:var(--dheerah-border)] p-3.5 sm:p-5 lg:p-6 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[color:var(--dheerah-crimson)]/10 text-[color:var(--dheerah-crimson)] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base sm:text-lg text-[color:var(--dheerah-black)] mb-1">
                    {storeInfo.name}
                  </h3>
                  <address className="not-italic font-sans text-[11px] sm:text-[13px] text-[color:var(--dheerah-text-muted)] leading-relaxed space-y-0.5">
                    {storeInfo.addressLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </address>
                  <p className="text-[10px] sm:text-[11px] font-medium text-[color:var(--dheerah-crimson)] mt-1.5">
                    Landmark: {storeInfo.landmark}
                  </p>
                </div>
              </div>

              {/* 2-Grid Action Buttons on Mobile */}
              <div className="mt-3.5 pt-3.5 border-t border-[color:var(--dheerah-border-soft)] grid grid-cols-2 gap-2 sm:gap-3">
                <a
                  href={storeInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-[12px] py-2.5 px-3 min-h-[40px] active:scale-[0.98]"
                  id="visit-get-directions-btn"
                >
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">GET DIRECTIONS</span>
                </a>
                <a
                  href={storeInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-[12px] py-2.5 px-3 min-h-[40px] active:scale-[0.98]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[color:var(--dheerah-crimson)] shrink-0" />
                  <span className="truncate">WHATSAPP</span>
                </a>
              </div>
            </div>

            {/* Timings Card */}
            <div className="bg-[#FAF9F6] rounded-xs border border-[color:var(--dheerah-border)] p-3.5 sm:p-5 lg:p-6 shadow-2xs">
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[color:var(--dheerah-crimson)]/10 text-[color:var(--dheerah-crimson)] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display text-sm sm:text-base text-[color:var(--dheerah-black)]">
                    Opening Hours
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[color:var(--dheerah-text-muted)]">
                    Walk-ins & appointments warmly accommodated
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {storeInfo.openingHoursList.map((hour, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-1.5 border-b border-[color:var(--dheerah-border-soft)] text-[11px] sm:text-[12px]">
                    <span className="font-semibold text-[color:var(--dheerah-charcoal)]">{hour.days}</span>
                    <span className="text-[color:var(--dheerah-crimson)] font-medium">{hour.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Grid Contact Channels on Mobile & Desktop */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <a
                href={`tel:${storeInfo.phone}`}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xs bg-[#FAF9F6] border border-[color:var(--dheerah-border)] hover:border-[color:var(--dheerah-crimson)] transition-colors group min-h-[46px]"
              >
                <Phone className="w-3.5 h-3.5 text-[color:var(--dheerah-crimson)] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] uppercase tracking-wider text-[color:var(--dheerah-text-muted)]">Phone</div>
                  <div className="text-[11px] sm:text-[12px] font-semibold text-[color:var(--dheerah-charcoal)] group-hover:text-[color:var(--dheerah-crimson)] transition-colors truncate">{storeInfo.phoneDisplay}</div>
                </div>
              </a>

              <a
                href={`mailto:${storeInfo.email}`}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xs bg-[#FAF9F6] border border-[color:var(--dheerah-border)] hover:border-[color:var(--dheerah-crimson)] transition-colors group min-h-[46px]"
              >
                <Mail className="w-3.5 h-3.5 text-[color:var(--dheerah-crimson)] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] uppercase tracking-wider text-[color:var(--dheerah-text-muted)]">Email</div>
                  <div className="text-[11px] sm:text-[12px] font-semibold text-[color:var(--dheerah-charcoal)] group-hover:text-[color:var(--dheerah-crimson)] transition-colors truncate">{storeInfo.email}</div>
                </div>
              </a>
            </div>

            {/* 2-Grid Amenities on Mobile & Desktop */}
            <div className="p-3 sm:p-4 rounded-xs bg-[#FAF9F6] border border-[color:var(--dheerah-border)]">
              <h5 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-crimson)] mb-2">
                Boutique Amenities
              </h5>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px] text-[color:var(--dheerah-charcoal)]">
                {storeInfo.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-[color:var(--dheerah-crimson)] shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

          {/* Interactive Map Column (lg:col-span-6) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-xs overflow-hidden border border-[color:var(--dheerah-border)] bg-white shadow-2xs">
              
              {/* Map Header Ribbon */}
              <div className="p-2.5 sm:p-3.5 bg-[color:var(--dheerah-charcoal)] text-white flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[color:var(--dheerah-crimson)]" />
                  <span className="text-[10px] sm:text-[12px] font-semibold tracking-wide">Google Maps Live Location</span>
                </div>
                <a
                  href={storeInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] sm:text-[11px] text-[color:var(--dheerah-crimson)] hover:underline inline-flex items-center gap-1"
                >
                  Open in Maps <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Map Iframe */}
              <div className="w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] min-h-[260px] sm:min-h-[360px] bg-[#FAF9F6] relative">
                <iframe
                  title="Dheerah Designer Boutique Vadapalani Chennai Location Map"
                  src={storeInfo.embedMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-full min-h-[260px] sm:min-h-[360px]"
                />
              </div>

              {/* Map Footer Prompt */}
              <div className="p-2.5 sm:p-3.5 bg-white border-t border-[color:var(--dheerah-border-soft)] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-sans font-medium text-[11px] sm:text-[12px] text-[color:var(--dheerah-charcoal)] truncate">
                    Need help finding the boutique?
                  </p>
                  <p className="text-[10px] text-[color:var(--dheerah-text-muted)] truncate">
                    Assistance with driving directions or parking.
                  </p>
                </div>

                <a
                  href={`tel:${storeInfo.phone}`}
                  className="btn-outline inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] py-1.5 px-3 whitespace-nowrap min-h-[36px] active:scale-[0.98] shrink-0"
                >
                  <Phone className="w-3 h-3" />
                  <span>CALL</span>
                </a>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default StoreLocation;
