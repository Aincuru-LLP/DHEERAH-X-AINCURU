import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import FabricImage from './FabricImage';
import { formatINR } from '../constants';
import type { Fabric } from '../types';

interface Props {
  product: Fabric;
  onAdd: () => void;
  onWishlist: () => void;
  wished?: boolean;
  /** Disable both buttons (e.g. out-of-stock / invalid length). */
  disabled?: boolean;
  /** id of the in-card "Add to bag" trigger; once the user scrolls past it
   *  the sticky bar appears. */
  triggerId?: string;
  effectivePrice?: number;
  selectedSize?: string | null;
}

const StickyAddToCart: React.FC<Props> = ({
  product,
  onAdd,
  onWishlist,
  wished = false,
  disabled = false,
  triggerId,
  effectivePrice,
  selectedSize
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If we have a trigger id, observe it: bar appears once the original
    // CTA scrolls fully out of view. Otherwise, fall back to a fixed
    // viewport-scroll threshold so the component remains useful in unit
    // tests / pages without the anchor.
    if (triggerId) {
      const el = document.getElementById(triggerId);
      if (!el) {
        setVisible(true);
        return;
      }
      const io = new IntersectionObserver(
        entries => {
          for (const entry of entries) setVisible(!entry.isIntersecting);
        },
        { threshold: 0, rootMargin: '0px 0px 0px 0px' }
      );
      io.observe(el);
      return () => io.disconnect();
    }

    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [triggerId]);

  const displayPrice = typeof effectivePrice === 'number' && Number.isFinite(effectivePrice) ? effectivePrice : product.price;

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden={!visible}
    >
      <div className="bg-white border-t border-[color:var(--dheerah-beige-soft)] shadow-[0_-4px_16px_rgba(5,5,5,0.08)] px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-11 h-14 shrink-0 bg-[color:var(--dheerah-cream)] rounded-xs border border-[color:var(--dheerah-beige-soft)] overflow-hidden">
          <FabricImage
            photo={product.photo}
            fallback={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[color:var(--dheerah-charcoal)] truncate leading-tight">{product.brand}</p>
          <p className="text-[11px] text-[color:var(--dheerah-charcoal-muted)] truncate leading-tight font-light">{product.name}</p>
          <p className="text-[13px] font-bold text-[color:var(--dheerah-charcoal)] leading-tight mt-0.5">
            {formatINR(displayPrice)}
            {selectedSize && (
              <span className="ml-1 text-[11px] font-semibold text-[color:var(--dheerah-crimson)]">
                ({selectedSize})
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className="btn-outline px-3 py-2 inline-flex items-center justify-center rounded-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${wished ? 'fill-[color:var(--dheerah-crimson)] text-[color:var(--dheerah-crimson)]' : 'text-[color:var(--dheerah-charcoal)]'}`} />
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="btn-primary px-4 py-2 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider"
        >
          <ShoppingBag className="w-4 h-4" /> Add to bag
        </button>
      </div>
    </div>
  );
};

export default StickyAddToCart;
