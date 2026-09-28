import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronUp, Download, Heart, Minus, Plus, Ruler, ShieldCheck, ShoppingBag, Star, Truck, X, Zap } from 'lucide-react';
import { formatINR } from '../constants';
import { useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import FabricImage from '../components/FabricImage';
import ProductCard from '../components/ProductCard';
import ReviewsSection from '../components/ReviewsSection';
import StickyAddToCart from '../components/StickyAddToCart';
import { productsApi } from '../lib/firebase';
import { getEffectiveProductGallery } from '../lib/productGallery';
import { getEffectiveProductPrice, getEffectiveProductMrp, getEffectiveProductDiscount } from '../lib/productPricing';
import { useCatalog } from '../context/CatalogContext';
import { useProductMeta } from '../lib/seoMeta';
import { analytics } from '../lib/analytics';
import { getBusinessCategory, getDisplayCategory } from '../config/productCategories';
import { FEATURES } from '../config/features';
import type { Fabric } from '../types';

interface Props {
  productId: string;
}

const ProductPage: React.FC<Props> = ({ productId }) => {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const { has: hasWish, toggle: toggleWish } = useWishlist();

  const { products: catalogProducts, loading: catalogLoading, byId } = useCatalog();

  const [fabric, setFabric] = useState<Fabric | null | undefined>(undefined);
  // Per-product title, description, canonical and Product JSON-LD — with real
  // URLs each product page is its own indexable document.
  useProductMeta(fabric ?? undefined);
  const [similar, setSimilar] = useState<Fabric[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setFabric(undefined);
    setFetchError(null);
    (async () => {
      try {
        const f = (await productsApi.get(productId).catch(() => null)) as unknown as Fabric | null;
        if (cancelled) return;
        const resolved = f ?? byId(productId) ?? null;
        setFabric(resolved);
        if (!resolved) {
          setFetchError('Could not load this product.');
        }
      } catch (err) {
        if (!cancelled) {
          const fallback = byId(productId);
          if (fallback) {
            setFabric(fallback);
          } else {
            setFabric(null);
            setFetchError(err instanceof Error ? err.message : 'Could not load this product.');
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [productId, reloadKey, byId]);

  // Similar products come from the shared catalogue so the rail is instant.
  useEffect(() => {
    if (!fabric || catalogLoading) return;
    setSimilar(
      catalogProducts
        .filter(p => p.id !== fabric.id && p.category === fabric.category)
        .slice(0, 5)
    );
  }, [fabric, catalogProducts, catalogLoading]);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(fabric?.colors?.[0]?.name);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [isDownloadingChart, setIsDownloadingChart] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [openSection, setOpenSection] = useState<'specs' | 'care' | 'delivery' | null>('specs');

  // Re-sync defaults when the fabric finishes loading or changes. Resetting
  // activeImage here is essential — without it, navigating from a 5-photo
  // PDP to a 1-photo PDP would leave activeImage at 4 and crash on
  // gallery[activeImage].photo below.
  useEffect(() => {
    if (fabric) {
      setSelectedColor(fabric.colors?.[0]?.name);
      setSelectedSize(null);
      setSizeError(null);
      setSizeChartOpen(false);
      setIsDownloadingChart(false);
      setQuantity(1);
      setActiveImage(0);
    }
  }, [fabric]);

  // When selected color changes, reset active image to 0
  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

  // Brief visual confirmation before bouncing to /cart — gives the user a
  // beat to register that the action took effect (and softens slow networks).
  // These hooks MUST live above the conditional early returns below, otherwise
  // the loading→loaded transition changes the hook count and React throws
  // "Rendered more hooks than during the previous render" — which is exactly
  // what was crashing the PDP into the ErrorBoundary fallback.
  const [justAdded, setJustAdded] = useState(false);
  const addTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (addTimerRef.current) clearTimeout(addTimerRef.current);
  }, []);

  // Close size chart modal on Escape key & lock background body scrolling
  useEffect(() => {
    if (!sizeChartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSizeChartOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sizeChartOpen]);

  // Built in src/lib/productGallery.ts: falls back to base images if customization
  // is disabled or if shade has no custom images.
  const gallery = useMemo(
    () => (fabric ? getEffectiveProductGallery(fabric, selectedColor) : []),
    [fabric, selectedColor]
  );

  const effectivePrice = useMemo(
    () => getEffectiveProductPrice(fabric, selectedSize),
    [fabric, selectedSize]
  );
  const effectiveMrp = useMemo(
    () => getEffectiveProductMrp(fabric, selectedSize),
    [fabric, selectedSize]
  );
  const effectiveDiscount = useMemo(
    () => getEffectiveProductDiscount(fabric, selectedSize),
    [fabric, selectedSize]
  );

  if (fabric === undefined) {
    return (
      <main className="pt-[100px] md:pt-[116px] pb-20 min-h-screen bg-[color:var(--dheerah-ivory)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="h-3 w-64 bg-[color:var(--dheerah-cream)] rounded-xs animate-pulse mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 lg:gap-12">
            {/* Gallery skeleton */}
            <div className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr] gap-3">
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-[color:var(--dheerah-cream)] rounded-sm border border-[color:var(--dheerah-beige-soft)] animate-pulse" />
                ))}
              </div>
              <div className="aspect-[3/4] bg-[color:var(--dheerah-cream)] rounded-sm border border-[color:var(--dheerah-beige-soft)] animate-pulse" />
            </div>
            {/* Info skeleton */}
            <div className="space-y-3">
              <div className="h-5 w-1/3 bg-[color:var(--dheerah-cream)] rounded-xs animate-pulse" />
              <div className="h-4 w-2/3 bg-[color:var(--dheerah-cream)] rounded-xs animate-pulse" />
              <div className="h-8 w-32 bg-[color:var(--dheerah-cream)] rounded-xs animate-pulse mt-6" />
              <div className="h-3 w-48 bg-[color:var(--dheerah-cream)] rounded-xs animate-pulse" />
              <div className="flex gap-2 mt-6">
                <div className="h-12 flex-1 bg-[color:var(--dheerah-cream)] rounded-sm animate-pulse" />
                <div className="h-12 flex-1 bg-[color:var(--dheerah-cream)] rounded-sm animate-pulse" />
              </div>
              <div className="h-24 w-full bg-[color:var(--dheerah-cream)] rounded-sm animate-pulse mt-4" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!fabric) {
    return (
      <main className="pt-[160px] pb-20 min-h-screen text-center px-5 bg-[color:var(--dheerah-ivory)]">
        <h1 className="font-serif text-3xl md:text-4xl mb-3 text-[color:var(--dheerah-charcoal)] font-bold">
          This creation is not on the loom right now
        </h1>
        <p className="text-[14px] text-[color:var(--dheerah-charcoal-muted)] mb-6 max-w-md mx-auto font-light">
          {fetchError
            ? `We hit a snag fetching this piece. ${fetchError}`
            : "It may have moved to the private archive — our atelier rotates creations regularly."}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {fetchError && (
            <button onClick={() => setReloadKey(k => k + 1)} className="btn-outline">
              Try again
            </button>
          )}
          <button onClick={() => navigate({ name: 'shop' })} className="btn-primary">Back to Boutique</button>
        </div>
      </main>
    );
  }

  const stock = fabric.stock ?? 0;
  const soldOut = stock <= 0;
  const wished = hasWish(fabric.id);
  const clampQty = (q: number) => Math.max(1, Math.min(q, Math.max(1, stock)));

  const handleAdd = () => {
    if (!fabric) return;
    if (justAdded) return;
    if (fabric.sizes && fabric.sizes.length > 0 && !selectedSize) {
      setSizeError('Please select a size before adding to bag');
      const el = document.getElementById('pdp-size-picker');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    addItem({
      fabricId: fabric.id,
      quantity,
      color: selectedColor,
      size: selectedSize ?? undefined
    });
    analytics.addToCart(fabric.id, fabric.name, effectivePrice, quantity);
    setJustAdded(true);
    if (addTimerRef.current) clearTimeout(addTimerRef.current);
    addTimerRef.current = setTimeout(() => {
      navigate({ name: 'cart' });
    }, 650);
  };

  const handleWish = () => {
    if (!fabric) return;
    toggleWish(fabric.id);
  };

  const sizeChartUrl = fabric?.sizeChartImage || fabric?.sizeChartUrl;

  const handleDownloadSizeChart = async () => {
    if (!sizeChartUrl || !fabric) return;
    setIsDownloadingChart(true);

    const isStandard = sizeChartUrl.includes('dheerah-size-chart');
    const safeName = (fabric.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let ext = 'png';
    if (sizeChartUrl.includes('.jpg') || sizeChartUrl.includes('.jpeg')) ext = 'jpg';
    else if (sizeChartUrl.includes('.webp')) ext = 'webp';

    const filename = isStandard
      ? `dheerah-size-chart.${ext}`
      : `dheerah-${safeName || 'product'}-size-chart.${ext}`;

    try {
      if (sizeChartUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = sizeChartUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Fetch loaded asset as blob for reliable cross-browser download trigger
      const response = await fetch(sizeChartUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback for CORS-restricted URLs
      const link = document.createElement('a');
      link.href = sizeChartUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloadingChart(false);
    }
  };

  return (
    <main className="pt-[100px] md:pt-[116px] pb-14 md:pb-20 bg-[color:var(--dheerah-ivory)] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10">
        {/* Breadcrumb */}
        {(() => {
          const bizCat = getBusinessCategory(fabric);
          const catLabel = bizCat ? bizCat.label : getDisplayCategory(fabric, 'customer');
          const catRoute = bizCat ? bizCat.key : fabric.masterCategory ?? 'Fabrics';
          return (
            <nav className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] mb-4 font-light">
              <button onClick={() => navigate({ name: 'home' })} className="hover:text-[color:var(--dheerah-crimson)] transition-colors">Home</button>
              <span className="mx-2 text-[color:var(--dheerah-beige-soft)]">/</span>
              <button onClick={() => navigate({ name: 'shop', category: catRoute })} className="hover:text-[color:var(--dheerah-crimson)] transition-colors">{catLabel}</button>
              {fabric.subCategory && fabric.subCategory !== catLabel && (
                <>
                  <span className="mx-2 text-[color:var(--dheerah-beige-soft)]">/</span>
                  <button
                    onClick={() => navigate({ name: 'shop', category: catRoute, subCategory: fabric.subCategory })}
                    className="hover:text-[color:var(--dheerah-crimson)] transition-colors"
                  >
                    {fabric.subCategory}
                  </button>
                </>
              )}
              <span className="mx-2 text-[color:var(--dheerah-beige-soft)]">/</span>
              <span className="text-[color:var(--dheerah-charcoal)] font-bold truncate inline-block max-w-[200px] align-bottom">{fabric.name}</span>
            </nav>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr] gap-3">
            <div className="flex flex-col gap-2 max-h-[640px] overflow-y-auto scrollbar-none">
              {gallery.map((g, idx) => (
                <button
                  key={g.photo}
                  onClick={() => setActiveImage(idx)}
                  onMouseEnter={() => setActiveImage(idx)}
                  className={`aspect-[3/4] rounded-sm overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[color:var(--dheerah-gold)] shadow-xs' : 'border-[color:var(--dheerah-beige-soft)] hover:border-[color:var(--dheerah-gold)]/60'}`}
                >
                  <FabricImage photo={g.photo} fallback={g.fallback} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.2, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] bg-[color:var(--dheerah-cream)] rounded-sm border border-[color:var(--dheerah-beige-soft)] overflow-hidden shadow-sm"
            >
              <FabricImage
                photo={gallery[activeImage].photo}
                fallback={gallery[activeImage].fallback}
                alt={fabric.name}
                className="w-full h-full object-cover"
              />
              {fabric.sticker && <span className="badge-trending">{fabric.sticker}</span>}
            </motion.div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-2">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-ivory)] border border-[color:var(--dheerah-beige-soft)] px-2.5 py-0.5 rounded-xs">
                {getDisplayCategory(fabric, 'customer')}
              </span>
            </div>
            <h1 className="font-sans text-[22px] md:text-[28px] font-semibold text-[color:var(--dheerah-charcoal)] mb-1">{fabric.brand}</h1>
            <p className="text-[15px] md:text-[17px] text-[color:var(--dheerah-charcoal-muted)] font-light mb-3">{fabric.name}</p>

            {FEATURES.reviewsAndFeedback && fabric.rating !== undefined && (
              <div className="inline-flex items-center gap-2 border border-[color:var(--dheerah-beige-soft)] rounded-sm bg-white px-2.5 py-1 mb-5 shadow-2xs">
                <span className="text-[13px] font-bold text-[color:var(--dheerah-charcoal)]">{fabric.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-[color:var(--dheerah-gold)] text-[color:var(--dheerah-gold)]" />
                {fabric.reviewCount != null && fabric.reviewCount > 0 && (
                  <>
                    <span className="w-px h-3.5 bg-[color:var(--dheerah-beige-soft)]" />
                    <span className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] font-medium">{fabric.reviewCount.toLocaleString('en-IN')} Reviews</span>
                  </>
                )}
              </div>
            )}

            <hr className="border-[color:var(--dheerah-beige-soft)] mb-4" />

            <div className="flex items-baseline gap-3 flex-wrap mb-1.5">
              <span className="font-sans text-[26px] md:text-[32px] font-bold text-[color:var(--dheerah-charcoal)]">{formatINR(effectivePrice)}</span>
              {effectiveMrp > effectivePrice && (
                <>
                  <span className="text-[16px] text-[color:var(--dheerah-charcoal-muted)] line-through font-light">{formatINR(effectiveMrp)}</span>
                  {effectiveDiscount > 0 && (
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)]">{effectiveDiscount}% OFF</span>
                  )}
                </>
              )}
            </div>
            <p className="text-[12px] uppercase tracking-wider font-semibold text-[color:var(--dheerah-charcoal-muted)] mb-4">inclusive of all taxes</p>

            {fabric.category === 'Laces' && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#F1ECF7] text-[#5C3A8E] border border-[#D6C9E9] text-[11px] font-bold uppercase tracking-wide">
                  {fabric.unitType === 'bundle' && fabric.bundleSizeMeters
                    ? `${fabric.bundleSizeMeters}m bundle`
                    : fabric.unitType === 'per meter'
                      ? 'Per meter'
                      : 'Lace'}
                </span>
                {fabric.productCode && (
                  <span className="text-[12px] text-[color:var(--color-myntra-ink-mute)]">Code: {fabric.productCode}</span>
                )}
              </div>
            )}

            {/* Colour */}
            {fabric.colors && fabric.colors.length > 0 && (
              <div className="mt-5 mb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)] mb-3">
                  Available Shades
                </p>
                <div className="flex gap-2 flex-wrap">
                  {fabric.colors.map(c => (
                    <motion.button
                      key={c.name}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-sm border transition-colors text-[12px] cursor-pointer ${selectedColor === c.name ? 'border-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] text-[color:var(--dheerah-crimson-dark)] font-bold shadow-2xs' : 'border-[color:var(--dheerah-beige-soft)] hover:border-[color:var(--dheerah-gold)] text-[color:var(--dheerah-charcoal)]'}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-white outline outline-1 outline-[color:var(--dheerah-beige-soft)]" style={{ background: c.hex }} />
                      <span>{c.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {fabric.sizes && fabric.sizes.length > 0 && (
              <div id="pdp-size-picker" className="mt-5 mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)]">
                    Select Size
                  </p>
                  {selectedSize && (
                    <span className="text-[11px] font-bold text-[color:var(--dheerah-crimson)]">
                      : {selectedSize}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {fabric.sizes.map(s => {
                    const isSelected = selectedSize === s.name;
                    const hasCustomPrice = typeof s.price === 'number' && s.price > 0 && s.price !== fabric.price;
                    return (
                      <motion.button
                        key={s.name}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedSize(s.name);
                          setSizeError(null);
                        }}
                        className={`min-w-[48px] h-10 px-3 flex flex-col items-center justify-center rounded-sm border transition-colors text-[13px] cursor-pointer ${
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
                      </motion.button>
                    );
                  })}
                </div>

                {sizeChartUrl && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setSizeChartOpen(true)}
                      aria-label="View size chart"
                      className="inline-flex items-center gap-1.5 font-sans text-[13.5px] font-medium text-[color:var(--dheerah-charcoal-muted)] hover:text-[color:var(--dheerah-charcoal)] transition-colors cursor-pointer group"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[color:var(--dheerah-charcoal-muted)] group-hover:text-[color:var(--dheerah-charcoal)] transition-colors" />
                      <span className="underline underline-offset-4 decoration-[color:var(--dheerah-beige-soft)] group-hover:decoration-[color:var(--dheerah-charcoal)]">
                        Size Chart
                      </span>
                    </button>
                  </div>
                )}

                {sizeError && (
                  <p className="text-[12px] font-semibold text-[#A12626] mt-2 animate-shake">
                    {sizeError}
                  </p>
                )}
              </div>
            )}

            {/* Quantity stepper */}
            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)]">Quantity</p>
              </div>
              {soldOut ? (
                <p className="text-[13px] font-semibold text-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-beige-soft)] rounded-sm px-3.5 py-2.5">
                  Currently archived — out of stock.
                </p>
              ) : (
                <>
                  <div className="inline-flex items-center border border-[color:var(--dheerah-beige-soft)] rounded-sm overflow-hidden bg-[color:var(--dheerah-ivory)] shadow-2xs">
                    <button
                      onClick={() => setQuantity(q => clampQty(q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-10 h-10 flex items-center justify-center text-[color:var(--dheerah-charcoal)] disabled:opacity-30 hover:bg-[color:var(--dheerah-cream)] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="min-w-[44px] text-center text-[14px] font-bold text-[color:var(--dheerah-charcoal)]" aria-live="polite">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => clampQty(q + 1))}
                      disabled={quantity >= stock}
                      aria-label="Increase quantity"
                      className="w-10 h-10 flex items-center justify-center text-[color:var(--dheerah-charcoal)] disabled:opacity-30 hover:bg-[color:var(--dheerah-cream)] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {stock < 10 && (
                    <p className="text-[12px] text-[color:var(--dheerah-crimson)] font-semibold mt-2">
                      Only {stock} {fabric.category === 'Laces' ? 'meters' : 'creations'} remaining in the studio
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-[14px] text-[color:var(--dheerah-charcoal)] leading-relaxed font-light">{fabric.description}</p>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-7">
              <button
                id="pdp-add-to-bag"
                onClick={handleAdd}
                disabled={soldOut || quantity < 1 || quantity > stock || justAdded}
                className="btn-primary flex-1 inline-flex justify-center items-center gap-2 py-3.5"
              >
                {soldOut ? (
                  'Out of Stock'
                ) : justAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Bag
                  </>
                )}
              </button>
              <button
                onClick={handleWish}
                className="btn-outline inline-flex items-center gap-2 flex-1 justify-center py-3.5"
              >
                <Heart className={`w-5 h-5 transition-colors ${wished ? 'fill-[color:var(--dheerah-crimson)] text-[color:var(--dheerah-crimson)]' : 'text-[color:var(--dheerah-charcoal)]'}`} />
                <span>{wished ? 'In Wishlist' : 'Wishlist'}</span>
              </button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm shadow-2xs">
              {[
                { Icon: Zap, label: 'Pan-India Express' },
                { Icon: Truck, label: 'Free over ₹1,999' },
                { Icon: ShieldCheck, label: '100% Authentic' }
              ].map(({ Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-[color:var(--dheerah-gold)]" />
                  <p className="text-[11px] font-bold text-[color:var(--dheerah-charcoal)] leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            {(['specs', 'care', 'delivery'] as const).map(key => {
              const labels = {
                specs: 'Product Details',
                care: 'Material & Care',
                delivery: 'Shipping & Delivery'
              };
              const open = openSection === key;
              return (
                <div key={key} className="border-t border-[color:var(--dheerah-beige-soft)]">
                  <button
                    onClick={() => setOpenSection(open ? null : key)}
                    className="w-full flex justify-between items-center py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-charcoal)] hover:text-[color:var(--dheerah-crimson)] transition-colors"
                  >
                    <span>{labels[key]}</span>
                    {open ? <ChevronUp className="w-4 h-4 text-[color:var(--dheerah-charcoal-muted)]" /> : <ChevronDown className="w-4 h-4 text-[color:var(--dheerah-charcoal-muted)]" />}
                  </button>
                  {open && (
                    <div className="pb-4 text-[13px] text-[color:var(--dheerah-charcoal-muted)] leading-relaxed font-light">
                      {key === 'specs' && (
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                          <dt className="text-[color:var(--dheerah-charcoal-muted)]">Fabric Weave</dt><dd className="font-semibold text-[color:var(--dheerah-charcoal)]">{fabric.weaveType ?? getDisplayCategory(fabric, 'customer')}</dd>
                          <dt className="text-[color:var(--dheerah-charcoal-muted)]">Category</dt><dd className="font-semibold text-[color:var(--dheerah-charcoal)]">{getDisplayCategory(fabric, 'customer')}</dd>
                          <dt className="text-[color:var(--dheerah-charcoal-muted)]">In Stock</dt><dd className="font-semibold text-[color:var(--dheerah-charcoal)]">{stock} {fabric.category === 'Laces' ? (fabric.unitType === 'bundle' ? `meters (${fabric.bundleSizeMeters ? Math.floor(stock / fabric.bundleSizeMeters) : stock} bundle${Math.floor(stock / (fabric.bundleSizeMeters ?? 1)) === 1 ? '' : 's'})` : 'meters') : (stock === 1 ? 'piece' : 'pieces')}</dd>
                          <dt className="text-[color:var(--dheerah-charcoal-muted)]">Attributes</dt><dd className="font-semibold text-[color:var(--dheerah-charcoal)]">{fabric.tags.join(', ')}</dd>
                        </dl>
                      )}
                      {key === 'care' && (
                        <p>Dry-clean only by a specialist familiar with hand-woven bridal and couture textiles. Store rolled in soft muslin away from direct sunlight. Every piece ships with an atelier care seal.</p>
                      )}
                      {key === 'delivery' && (
                        <div className="space-y-2">
                          <p className="flex items-start gap-2"><Truck className="w-4 h-4 mt-0.5 text-[color:var(--dheerah-gold)] shrink-0" /> <span><b className="text-[color:var(--dheerah-charcoal)] font-bold">Pan-India Express Delivery.</b> Courier dispatch across all states and union territories.</span></p>
                          <p className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-[color:var(--dheerah-gold)] shrink-0" /> <span>Free white-glove insured shipping pan-India on orders over ₹1,999. Dispatched within 24–48 hours.</span></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* More from this weave */}
        {similar.length > 0 && (
          <section className="mt-14 md:mt-20">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="section-eyebrow">{getDisplayCategory(fabric, 'customer')} curation</span>
                <h2 className="font-serif text-2xl md:text-3xl font-normal text-[color:var(--dheerah-charcoal)] mt-1">More from this collection</h2>
              </div>
              <button
                onClick={() => navigate({ name: 'shop' })}
                className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)] transition-colors inline-flex items-center gap-1 group"
              >
                <span>See All</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {similar.map(s => <ProductCard key={s.id} fabric={s} />)}
            </div>
          </section>
        )}

        {/* Reviews */}
        {FEATURES.reviewsAndFeedback && <ReviewsSection fabricId={fabric.id} />}
      </div>

      {/* Mobile-only sticky add-to-bag — appears once the in-card CTA scrolls out of view. */}
      <StickyAddToCart
        product={fabric}
        effectivePrice={effectivePrice}
        selectedSize={selectedSize}
        onAdd={handleAdd}
        onWishlist={handleWish}
        wished={wished}
        disabled={soldOut || quantity < 1 || quantity > stock || justAdded}
        triggerId="pdp-add-to-bag"
      />

      {/* Size Chart Modal */}
      <AnimatePresence>
        {sizeChartOpen && sizeChartUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 cursor-pointer"
            onClick={() => setSizeChartOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-[color:var(--dheerah-beige-soft)] overflow-hidden cursor-default"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white border-b border-[color:var(--dheerah-beige-soft)] px-5 py-3.5 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[color:var(--dheerah-gold)]" />
                  <h3 id="size-chart-title" className="font-serif text-lg font-bold text-[color:var(--dheerah-charcoal)]">
                    Size Chart &amp; Fit Guide
                  </h3>
                </div>
                <button
                  onClick={() => setSizeChartOpen(false)}
                  className="p-1.5 rounded text-[color:var(--dheerah-charcoal-muted)] hover:text-[color:var(--dheerah-charcoal)] hover:bg-[color:var(--dheerah-cream)] transition-colors cursor-pointer"
                  aria-label="Close size chart modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 flex flex-col items-center bg-[color:var(--dheerah-ivory)] overflow-y-auto">
                <img
                  src={sizeChartUrl}
                  alt={`${fabric.name} Size Chart`}
                  className="max-w-full max-h-[58vh] h-auto object-contain rounded border border-[color:var(--dheerah-beige-soft)] bg-white shadow-xs"
                />
                <p className="text-[11.5px] text-[color:var(--dheerah-charcoal-muted)] text-center mt-3.5 max-w-md font-light">
                  Measurements are in inches unless otherwise specified. For custom sizing or bespoke tailoring queries, reach our atelier concierge.
                </p>

                {/* Actions: Download Button & Close */}
                <div className="mt-5 flex flex-col items-center gap-2 w-full max-w-xs">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadSizeChart}
                    disabled={isDownloadingChart}
                    aria-label="Download size chart"
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[color:var(--dheerah-charcoal)] hover:bg-[color:var(--dheerah-charcoal)]/90 text-white font-sans text-[14px] font-medium transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[color:var(--dheerah-gold)]" />
                    <span>{isDownloadingChart ? 'Downloading...' : 'Download Size Chart'}</span>
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setSizeChartOpen(false)}
                    className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] hover:text-[color:var(--dheerah-charcoal)] underline underline-offset-4 decoration-transparent hover:decoration-[color:var(--dheerah-charcoal-muted)] transition-colors py-1 cursor-pointer"
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ProductPage;
