import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Fabric } from '../types';
import { formatINR } from '../constants';
import { useRouter } from '../context/RouterContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import FabricImage from './FabricImage';
import QuickAddModal from './QuickAddModal';
import { inStock } from '../lib/availability';
import { getDisplayCategory } from '../config/productCategories';
import { FEATURES } from '../config/features';
import { getProductPriceRange } from '../lib/productPricing';

interface Props {
  fabric: Fabric;
  /** Optional compact mode for horizontal scroll rails. */
  compact?: boolean;
}

const ProductCard: React.FC<Props> = ({ fabric, compact = false }) => {
  const { navigate } = useRouter();
  const { has, toggle } = useWishlist();
  const { addItem } = useCart();
  const wished = has(fabric.id);
  const soldOut = !inStock(fabric);

  const [justAdded, setJustAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (quantity: number, color?: string, size?: string) => {
    addItem({ fabricId: fabric.id, quantity, color: color ?? fabric.colors?.[0]?.name, size });
    setModalOpen(false);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soldOut) return;
    setModalOpen(true);
  };

  const goToProduct = () => navigate({ name: 'product', id: fabric.id });

  return (
    <div className={`card-product group ${compact ? 'w-[170px] md:w-[200px] shrink-0' : ''}`}>
      {/* Card link area: not a <button> so action buttons remain valid and clickable. */}
      <div
        role="button"
        tabIndex={0}
        onClick={goToProduct}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToProduct();
          }
        }}
        className="block w-full text-left no-tap-highlight outline-none cursor-pointer"
        aria-label={fabric.name}
      >
        <div className="relative aspect-[3/4] bg-[color:var(--dheerah-ivory)] overflow-hidden">
          <FabricImage
            photo={fabric.photo}
            fallback={fabric.image}
            alt={fabric.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              soldOut ? 'opacity-45 grayscale' : 'group-hover:scale-105'
            }`}
          />
          {soldOut && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-[#050505]/90 py-1.5 border-y border-[color:var(--dheerah-gold)]/30 backdrop-blur-xs">
              Sold out
            </span>
          )}
          {/* A stock-out outranks a marketing sticker */}
          {fabric.sticker && !soldOut && (
            <span className="badge-trending">{fabric.sticker}</span>
          )}
          {FEATURES.reviewsAndFeedback && fabric.rating !== undefined && (
            <span className="absolute bottom-2 left-2 badge-rating">
              {fabric.rating.toFixed(1)} <Star className="w-3 h-3 fill-current star" />
              {fabric.reviewCount !== undefined && (
                <span className="text-[color:var(--dheerah-charcoal-muted)] font-medium ml-1">| {fabric.reviewCount}</span>
              )}
            </span>
          )}
        </div>

        <div className="px-3 pt-2.5 pb-3 bg-white">
          <p className="text-[13px] md:text-[14px] font-bold text-[color:var(--dheerah-charcoal)] tracking-wide truncate">
            {fabric.brand}
          </p>
          <p className="text-[12px] md:text-[13px] text-[color:var(--dheerah-charcoal-muted)] truncate mb-0.5 font-light">
            {fabric.name}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--dheerah-crimson)] mb-1">
            {getDisplayCategory(fabric, 'customer')}
          </p>
          {fabric.category === 'Laces' && fabric.unitType && (
            <p className="text-[11px] font-semibold text-[color:var(--dheerah-crimson-dark)] mb-1">
              {fabric.unitType === 'bundle' && fabric.bundleSizeMeters
                ? `${fabric.bundleSizeMeters}m bundle`
                : fabric.unitType === 'per meter'
                ? 'Sold per meter'
                : 'Sold as unit'}
            </p>
          )}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[14px] md:text-[15px] font-bold text-[color:var(--dheerah-charcoal)]">
              {getProductPriceRange(fabric).hasVariablePrice
                ? `From ${formatINR(getProductPriceRange(fabric).minPrice)}`
                : formatINR(fabric.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Add-to-bag button */}
      <motion.button
        type="button"
        whileHover={!soldOut ? { scale: 1.06 } : undefined}
        whileTap={!soldOut ? { scale: 0.92 } : undefined}
        onClick={openModal}
        disabled={soldOut}
        aria-label={soldOut ? `${fabric.name} is sold out` : 'Add to bag'}
        title={soldOut ? 'Sold out' : 'Add to bag'}
        className={`absolute bottom-3 right-2.5 w-8 h-8 md:w-9 md:h-9 rounded-sm flex items-center justify-center shadow-xs no-tap-highlight transition-colors cursor-pointer ${
          soldOut
            ? 'bg-[color:var(--dheerah-cream)] text-[color:var(--dheerah-charcoal-muted)] border border-[color:var(--dheerah-beige-soft)] cursor-not-allowed'
            : justAdded
            ? 'bg-[color:var(--dheerah-crimson)] text-white border border-[color:var(--dheerah-crimson)]'
            : 'bg-[color:var(--dheerah-charcoal)] hover:bg-[color:var(--dheerah-crimson)] text-white border border-transparent'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {justAdded && !soldOut ? (
            <motion.span
              key="check"
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span
              key="bag"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Wishlist toggle */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.82 }}
        onClick={() => toggle(fabric.id)}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-2 right-2 w-8 h-8 rounded-sm bg-white/95 border border-[color:var(--dheerah-beige-soft)] hover:border-[color:var(--dheerah-gold)] flex items-center justify-center no-tap-highlight transition-colors shadow-2xs cursor-pointer"
      >
        <motion.div
          animate={wished ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors duration-300 ${
              wished ? 'fill-[color:var(--dheerah-crimson)] text-[color:var(--dheerah-crimson)]' : 'text-[color:var(--dheerah-charcoal)]'
            }`}
          />
        </motion.div>
      </motion.button>

      <QuickAddModal
        fabric={fabric}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={(quantity, color, size) => handleAdd(quantity, color, size)}
      />
    </div>
  );
};

export default ProductCard;
