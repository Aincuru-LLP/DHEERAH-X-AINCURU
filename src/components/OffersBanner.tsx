import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from '../context/RouterContext';

interface OfferBannerItem {
  id: string;
  image: string;
  alt: string;
  category?: string;
}

const OFFERS: OfferBannerItem[] = [
  {
    id: 'offer-1',
    image: '/figma-assets/offers-banner-1.png',
    alt: 'Your Everyday Kurtas - Buy 2 Get Rs 200 Off',
    category: 'salwar-suits',
  },
  {
    id: 'offer-2',
    image: '/figma-assets/offers-banner-2.png',
    alt: 'Price Slashed Sale - Up to 50% Off',
  },
  {
    id: 'offer-3',
    image: '/figma-assets/offers-banner-3.png',
    alt: 'Special Seasonal Boutique Offers - End of Season Sale',
    category: 'maxis',
  },
];

/**
 * Offers and Promotional Banners
 * - Desktop (md+): 3-column promotional grid
 * - Mobile (<md): Smooth horizontal swipeable carousel slider with dot indicators
 */
const OffersBanner: React.FC = () => {
  const { navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (category?: string) => {
    if (category) {
      navigate({ name: 'shop', category });
    } else {
      navigate({ name: 'shop' });
    }
  };

  const scrollToSlide = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    setActiveIndex(index);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, offsetWidth } = container;
    if (offsetWidth > 0) {
      const card = container.firstElementChild as HTMLElement | null;
      const cardWidth = card ? card.offsetWidth + 12 : offsetWidth * 0.9;
      const idx = Math.round(scrollLeft / cardWidth);
      const clamped = Math.max(0, Math.min(idx, OFFERS.length - 1));
      if (clamped !== activeIndex) {
        setActiveIndex(clamped);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Offers Section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-8 md:py-16 bg-white select-none"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-[32px] sm:text-[44px] md:text-[54px] font-normal text-black mb-5 md:mb-8 text-left">
            Offers
          </h2>

          {/* Desktop View (md+): 3-Column Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6">
            {OFFERS.map((offer, idx) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                onClick={() => handleClick(offer.category)}
                className="group relative aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/9] rounded-sm overflow-hidden bg-[#F9F8F6] border border-[#E8E4DF] hover:border-[color:var(--dheerah-gold)]/40 shadow-xs hover:shadow-xl cursor-pointer transition-colors duration-500"
              >
                <img
                  src={offer.image}
                  alt={offer.alt}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </motion.div>
            ))}
          </div>

          {/* Mobile View (<md): Smooth Horizontal Swipeable Carousel */}
          <div className="md:hidden relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-1 -mx-4 px-4"
            >
              {OFFERS.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => handleClick(offer.category)}
                  className="w-[90vw] max-w-[420px] shrink-0 snap-center cursor-pointer"
                >
                  <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden bg-[#F9F8F6] border border-[#E8E4DF] shadow-xs">
                    <img
                      src={offer.image}
                      alt={offer.alt}
                      loading="lazy"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Dot Indicators (● ○ ○) */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {OFFERS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Go to offer ${i + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === i
                      ? 'w-6 h-2 bg-[color:var(--dheerah-charcoal)]'
                      : 'w-2 h-2 bg-[color:var(--dheerah-charcoal)]/25 hover:bg-[color:var(--dheerah-charcoal)]/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default OffersBanner;

