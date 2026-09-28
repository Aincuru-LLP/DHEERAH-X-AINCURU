import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Fabric } from '../types';
import { formatINR } from '../constants';
import FabricImage from './FabricImage';
import { getEffectiveProductPrice } from '../lib/productPricing';

interface Props {
  fabric: Fabric;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (quantity: number, color?: string, size?: string) => void;
}

const QuickAddModal: React.FC<Props> = ({ fabric, isOpen, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(fabric.colors?.[0]?.name);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const stock = fabric.stock ?? 0;
  const maxQty = Math.max(1, stock);
  const clamp = (q: number) => Math.max(1, Math.min(q, maxQty));
  const effectivePrice = getEffectiveProductPrice(fabric, selectedSize);

  const handleAdd = () => {
    if (fabric.sizes && fabric.sizes.length > 0 && !selectedSize) {
      setSizeError('Please select a size');
      return;
    }
    onAdd(quantity, selectedColor, selectedSize ?? undefined);
    setQuantity(1);
    setSelectedSize(null);
    setSizeError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs px-0 sm:px-4 py-0 sm:py-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white w-full sm:max-w-md sm:rounded-sm rounded-t-sm shadow-2xl overflow-hidden border border-[color:var(--dheerah-beige-soft)]"
            onClick={e => e.stopPropagation()}
          >
        <div className="flex items-center gap-3 p-4 border-b border-[color:var(--dheerah-beige-soft)] bg-[color:var(--dheerah-ivory)]">
          <div className="w-16 h-20 rounded-xs overflow-hidden bg-[color:var(--dheerah-cream)] shrink-0 border border-[color:var(--dheerah-beige-soft)]">
            <FabricImage photo={fabric.photo} fallback={fabric.image} alt={fabric.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[14px] font-bold text-[color:var(--dheerah-charcoal)] uppercase tracking-wider truncate">{fabric.brand}</p>
            <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] truncate font-light">{fabric.name}</p>
            <p className="text-[14px] font-bold text-[color:var(--dheerah-charcoal)] mt-1">{formatINR(effectivePrice)}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-sm hover:bg-[color:var(--dheerah-cream)] transition-colors text-[color:var(--dheerah-charcoal-muted)] hover:text-[color:var(--dheerah-charcoal)] cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {fabric.colors && fabric.colors.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)] mb-3">
                Select Colour
              </p>
              <div className="flex flex-wrap gap-2">
                {fabric.colors.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-sm border transition-all text-[12px] ${
                      selectedColor === c.name
                        ? 'border-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] text-[color:var(--dheerah-crimson-dark)] font-bold shadow-2xs'
                        : 'border-[color:var(--dheerah-beige-soft)] hover:border-[color:var(--dheerah-gold)] text-[color:var(--dheerah-charcoal)]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white outline outline-1 outline-[color:var(--dheerah-beige-soft)]"
                      style={{ background: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {fabric.sizes && fabric.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)]">
                  Select Size
                </p>
                {selectedSize && (
                  <span className="text-[11px] font-bold text-[color:var(--dheerah-crimson)]">
                    : {selectedSize}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {fabric.sizes.map(s => {
                  const isSelected = selectedSize === s.name;
                  const hasCustomPrice = typeof s.price === 'number' && s.price > 0 && s.price !== fabric.price;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setSelectedSize(s.name);
                        setSizeError(null);
                      }}
                      className={`min-w-[44px] h-9 px-2.5 flex flex-col items-center justify-center rounded-sm border transition-all text-[12px] ${
                        isSelected
                          ? 'border-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] text-[color:var(--dheerah-crimson-dark)] font-bold shadow-2xs'
                          : 'border-[color:var(--dheerah-beige-soft)] hover:border-[color:var(--dheerah-gold)] text-[color:var(--dheerah-charcoal)] font-medium bg-white'
                      }`}
                    >
                      <span>{s.name}</span>
                      {hasCustomPrice && (
                        <span className="text-[9px] -mt-0.5 opacity-80 font-normal">
                          {formatINR(s.price!)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="text-[11px] font-semibold text-[#A12626] mt-1.5 animate-shake">
                  {sizeError}
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)] mb-3">
              Quantity
            </p>
            <div className="inline-flex items-center border border-[color:var(--dheerah-beige-soft)] rounded-sm overflow-hidden bg-[color:var(--dheerah-ivory)]">
              <button
                type="button"
                onClick={() => setQuantity(q => clamp(q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-[color:var(--dheerah-charcoal)] disabled:opacity-30 hover:bg-[color:var(--dheerah-cream)] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="min-w-[44px] text-center text-[14px] font-bold text-[color:var(--dheerah-charcoal)]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => clamp(q + 1))}
                disabled={quantity >= maxQty}
                className="w-10 h-10 flex items-center justify-center text-[color:var(--dheerah-charcoal)] disabled:opacity-30 hover:bg-[color:var(--dheerah-cream)] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[color:var(--dheerah-beige-soft)] bg-white">
          <button
            type="button"
            onClick={handleAdd}
            disabled={stock <= 0}
            className="btn-primary w-full inline-flex justify-center items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{stock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
    )}
  </AnimatePresence>
  );
};

export default QuickAddModal;
