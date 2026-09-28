import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, RefreshCw, ShieldCheck, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useCatalog } from '../context/CatalogContext';
import { FREE_SHIPPING_THRESHOLD, formatINR } from '../constants';
import { couponsApi } from '../lib/firebase';
import { inStock } from '../lib/availability';
import FabricImage from '../components/FabricImage';
import ProductCard from '../components/ProductCard';
import { getDisplayCategory } from '../config/productCategories';
import { getEffectiveProductPrice } from '../lib/productPricing';
import { getEffectiveProductGallery } from '../lib/productGallery';

const CartPage: React.FC = () => {
  const { items, resolved, resolving, updateQuantity, removeItem, subtotal, shipping, tax, total, unitCount } = useCart();
  const { add: addWish } = useWishlist();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponBusy, setCouponBusy] = useState(false);

  // "You might also like" uses the shared catalogue.
  const { products: catalogProducts } = useCatalog();
  const catalog = catalogProducts.length ? catalogProducts : null;

  // A coupon is validated against the subtotal at apply time and its discount
  // frozen into state. If the shopper then changes quantities, that frozen
  // figure goes stale (wrong total, possibly below the coupon's minimum). Clear
  // it on any basket change so Total, the discount line, and the free-shipping
  // nudge can never contradict each other — and avoid per-keystroke re-validation.
  useEffect(() => {
    if (couponDiscount > 0) {
      setCouponDiscount(0);
      setCouponMsg({ ok: false, text: 'Bag updated — please re-apply your coupon.' });
    }
    // Intentionally keyed only on subtotal; couponDiscount guard prevents the
    // initial-mount run from showing a spurious message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // Items are in the cart but their product details haven't been fetched yet
  if (resolving && items.length > 0 && resolved.length === 0) {
    return (
      <main className="pt-[140px] pb-20 min-h-screen flex items-center justify-center bg-[color:var(--dheerah-ivory)]">
        <div className="w-8 h-8 border-2 border-[color:var(--dheerah-crimson)] border-t-transparent rounded-full animate-spin" aria-label="Loading bag" />
      </main>
    );
  }

  // Items exist but none could be resolved to a product
  if (resolved.length === 0 && items.length > 0 && !resolving) {
    return (
      <main className="pt-[100px] md:pt-[116px] pb-20 min-h-screen bg-[color:var(--dheerah-ivory)]">
        <div className="max-w-md mx-auto bg-white text-center px-6 py-12 border border-[color:var(--dheerah-beige-soft)] rounded-sm shadow-sm">
          <ShoppingBag className="w-12 h-12 mx-auto text-[color:var(--dheerah-gold)] mb-4" />
          <h1 className="font-serif text-2xl font-normal mb-2 text-[color:var(--dheerah-charcoal)]">Some items are no longer available</h1>
          <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] mb-6 font-light">
            The creations in your bag could not be loaded — they may have sold out or moved to the private archive.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => { items.forEach(i => removeItem(i.fabricId, i.color)); }} className="btn-outline">
              Clear bag
            </button>
            <button onClick={() => navigate({ name: 'shop' })} className="btn-primary">Continue Shopping</button>
          </div>
        </div>
      </main>
    );
  }

  if (resolved.length === 0) {
    return (
      <main className="pt-[100px] md:pt-[116px] pb-20 min-h-screen bg-[color:var(--dheerah-ivory)]">
        <div className="max-w-md mx-auto bg-white text-center px-6 py-12 border border-[color:var(--dheerah-beige-soft)] rounded-sm shadow-sm">
          <ShoppingBag className="w-12 h-12 mx-auto text-[color:var(--dheerah-gold)] mb-4" />
          <h1 className="font-serif text-2xl md:text-3xl font-normal mb-2 text-[color:var(--dheerah-charcoal)]">Your shopping bag is empty</h1>
          <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] mb-6 font-light">
            {user
              ? 'Explore our curated boutique collections to add handcrafted pieces — saved across your devices.'
              : (<>
                  <button onClick={() => navigate({ name: 'login' })} className="text-[color:var(--dheerah-crimson)] font-bold hover:underline">
                    Sign in
                  </button>
                  {' '}to view pieces saved from your previous session, or explore our collection below.
                </>)}
          </p>
          <button onClick={() => navigate({ name: 'shop' })} className="btn-primary">Explore Boutique</button>
        </div>
      </main>
    );
  }

  const totalAfterCoupon = Math.max(0, total - couponDiscount);
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Mirror the checkout Order Summary exactly: show Total MRP and the markdown
  // to the selling price as a "Discount" line, so the two screens tell one
  // consistent pricing story instead of the cart showing only a bare Subtotal.
  const mrpTotal = resolved.reduce((s, { item, fabric }) => s + (fabric.mrp ?? fabric.price) * item.quantity, 0);
  const productDiscount = Math.max(0, mrpTotal - subtotal);

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    try {
      const res = await couponsApi.validate(code, subtotal);
      if (!res.valid) {
        setCouponDiscount(0);
        const text =
          res.reason === 'not_found'    ? 'Coupon code is invalid.'
        : res.reason === 'inactive'     ? 'This coupon is no longer active.'
        : res.reason === 'expired'      ? 'This coupon has expired.'
        : res.reason === 'min_subtotal' ? `Add ${formatINR(res.minSubtotal ?? 0)} more to use this coupon.`
        : 'This coupon cannot be used.';
        setCouponMsg({ ok: false, text });
        return;
      }
      setCouponDiscount(res.discount);
      setCouponMsg({ ok: true, text: `Applied — ${formatINR(res.discount)} off.` });
    } catch (err) {
      setCouponDiscount(0);
      setCouponMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not validate coupon.' });
    } finally {
      setCouponBusy(false);
    }
  };

  // Never cross-sell something we cannot ship — this rail sits directly above
  // the checkout button.
  // `?? []` and not `?? FABRICS`: a cross-sell rail directly above Checkout
  // must never offer a product that does not exist.
  const youMightLike = (catalog ?? [])
    .filter(f => inStock(f) && !resolved.some(r => r.fabric.id === f.id))
    .slice(0, 5);

  return (
    <main className="pt-[100px] md:pt-[116px] pb-14 md:pb-20 bg-[color:var(--dheerah-ivory)] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-10">
        <h1 className="font-serif text-2xl md:text-3xl font-normal mb-2 text-[color:var(--dheerah-charcoal)]">
          My Shopping Bag <span className="font-sans text-[13px] md:text-[14px] font-normal text-[color:var(--dheerah-charcoal-muted)] ml-3 tracking-normal">{unitCount} item{unitCount === 1 ? '' : 's'}</span>
        </h1>

        {user ? (
          <p className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] font-medium mb-4 inline-flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[color:var(--dheerah-gold)]" /> Synced across your atelier devices
          </p>
        ) : (
          <p className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] font-medium mb-4">
            <button
              onClick={() => navigate({ name: 'login' })}
              className="text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)] transition-colors font-bold"
            >
              Sign in to preserve your selection across devices →
            </button>
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 lg:gap-6">
          <div className="space-y-3">
            {/* Offers banner */}
            <div className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-3.5 md:p-4 shadow-2xs">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[color:var(--dheerah-charcoal)] mb-1 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[color:var(--dheerah-gold)]" /> Atelier Privileges
              </p>
              <p className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] font-light">
                Use <span className="font-bold text-[color:var(--dheerah-charcoal)]">BRIDAL10</span> for 10% off wedding couture, or <span className="font-bold text-[color:var(--dheerah-charcoal)]">DHEERAHFIRST</span> for your inaugural order privilege.
              </p>
            </div>

            {/* Items */}
            <AnimatePresence initial={false}>
              {resolved.map(({ item, fabric }) => {
                const unitPrice = getEffectiveProductPrice(fabric, item.size);
                const linePrice = item.quantity * unitPrice;
                const stock = fabric.stock ?? 999;
                const cap = Math.max(1, Math.min(stock, 10));
                const options = Array.from(new Set([...Array.from({ length: cap }, (_, i) => i + 1), item.quantity]))
                  .filter(o => o >= 1 && o <= stock)
                  .sort((a, b) => a - b);
                const displayPhoto = getEffectiveProductGallery(fabric, item.color)[0]?.photo || fabric.photo;

                return (
                  <motion.div
                    key={`${fabric.id}-${item.color ?? ''}-${item.size ?? ''}`}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-3.5 md:p-4 flex gap-3 md:gap-4 shadow-2xs"
                  >
                    <button
                      onClick={() => navigate({ name: 'product', id: fabric.id })}
                      className="w-24 h-32 md:w-28 md:h-36 shrink-0 bg-[color:var(--dheerah-cream)] rounded-xs border border-[color:var(--dheerah-beige-soft)] overflow-hidden"
                    >
                      <FabricImage photo={displayPhoto} fallback={fabric.image} alt={fabric.name} className="w-full h-full object-cover" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => navigate({ name: 'product', id: fabric.id })} className="block text-left">
                        <p className="font-bold text-[13px] md:text-[14px] uppercase tracking-wider text-[color:var(--dheerah-charcoal)] truncate">{fabric.brand}</p>
                        <p className="text-[13px] text-[color:var(--dheerah-charcoal-muted)] truncate font-light">{fabric.name}</p>
                      </button>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-[color:var(--dheerah-ivory)] border border-[color:var(--dheerah-beige-soft)] text-[color:var(--dheerah-crimson)]">
                          {getDisplayCategory(fabric, 'customer')}
                        </span>
                        <span className="text-[11px] text-[color:var(--dheerah-crimson)] font-bold uppercase tracking-wider">
                          · Dheerah Designer Boutique
                        </span>
                      </div>

                      <div className="flex gap-2.5 mt-2.5 items-center flex-wrap text-[12px]">
                        <div className="relative">
                          <select
                            value={item.quantity}
                            onChange={e => updateQuantity(fabric.id, item.color, Number(e.target.value), item.size)}
                            className="appearance-none border border-[color:var(--dheerah-beige-soft)] rounded-sm px-2.5 py-1.5 pr-7 text-[12px] font-bold text-[color:var(--dheerah-charcoal)] bg-white cursor-pointer"
                          >
                            {options.map(o => <option key={o} value={o}>Qty: {o}</option>)}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--dheerah-charcoal-muted)]" />
                        </div>
                        {item.size && (
                          <span className="border border-[color:var(--dheerah-crimson)] rounded-sm px-2 py-1 font-bold text-[color:var(--dheerah-crimson-dark)] bg-[color:var(--dheerah-cream)] shadow-2xs">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="border border-[color:var(--dheerah-beige-soft)] rounded-sm px-2 py-1 font-semibold text-[color:var(--dheerah-charcoal)] bg-[color:var(--dheerah-ivory)]">Shade: {item.color}</span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap mt-2.5">
                        <span className="font-sans text-[16px] md:text-[17px] font-bold text-[color:var(--dheerah-charcoal)]">{formatINR(linePrice)}</span>
                        {item.quantity > 1 && (
                          <span className="text-[11px] text-[color:var(--dheerah-charcoal-muted)] font-light">
                            ({formatINR(unitPrice)} each)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[color:var(--dheerah-charcoal-muted)] font-light mt-1">
                        Complimentary luxury packaging · Pan-India Insured Dispatch
                      </p>

                      <div className="border-t border-[color:var(--dheerah-beige-soft)] mt-3 pt-2.5 flex gap-5">
                        <button
                          onClick={() => { addWish(fabric.id); removeItem(fabric.id, item.color, item.size); }}
                          className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--dheerah-charcoal)] hover:text-[color:var(--dheerah-crimson)] transition-colors cursor-pointer"
                        >
                          Move to Wishlist
                        </button>
                        <button
                          onClick={() => removeItem(fabric.id, item.color, item.size)}
                          className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--dheerah-charcoal-muted)] hover:text-[color:var(--dheerah-crimson)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* You might also like */}
            {youMightLike.length > 0 && (
              <section className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-4 mt-4 shadow-2xs">
                <span className="section-eyebrow">Recommendations</span>
                <h3 className="font-serif text-lg font-normal text-[color:var(--dheerah-charcoal)] mb-3">You might also adore</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {youMightLike.map(f => <ProductCard key={f.id} fabric={f} />)}
                </div>
              </section>
            )}
          </div>

          {/* Summary */}
          <aside>
            <div className="lg:sticky lg:top-[110px] space-y-3">
              {/* Coupon */}
              <div className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-4 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal)] mb-3">Atelier Coupons</p>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="input-box flex-1 text-[13px] uppercase"
                  />
                  <button onClick={applyCoupon} disabled={couponBusy} className="text-[12px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)] px-2.5 disabled:opacity-60">{couponBusy ? '...' : 'APPLY'}</button>
                </div>
                {couponMsg && (
                  <p className={`text-[12px] mt-2 font-semibold ${couponMsg.ok ? 'text-emerald-700' : 'text-[color:var(--dheerah-crimson)]'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Price details */}
              <div className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-4 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)] mb-4">Price Summary ({unitCount} item{unitCount === 1 ? '' : 's'})</p>

                {/* Luxury Free Shipping Progress Indicator */}
                <div className="bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-beige-soft)] p-3 mb-4 rounded-xs">
                  <div className="flex justify-between items-center text-[12px] font-medium text-[color:var(--dheerah-charcoal)] mb-1.5">
                    <span>
                      {remainingForFreeShip > 0 ? (
                        <>Add <span className="font-bold text-[color:var(--dheerah-crimson)]">{formatINR(remainingForFreeShip)}</span> more for Free Delivery</>
                      ) : (
                        <span className="font-bold text-emerald-800">✨ Complimentary Insured Delivery Unlocked</span>
                      )}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--dheerah-gold-dark)]">
                      {Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[color:var(--dheerah-beige-soft)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[color:var(--dheerah-gold)] to-[color:var(--dheerah-crimson)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(5, (subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                <dl className="space-y-2.5 text-[13px] md:text-[14px]">
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Total MRP</dt>
                    <dd className="font-medium text-[color:var(--dheerah-charcoal)]">{formatINR(mrpTotal)}</dd>
                  </div>
                  {productDiscount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Atelier Discount</dt>
                      <dd className="text-[color:var(--dheerah-crimson)] font-semibold">- {formatINR(productDiscount)}</dd>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Privilege Coupon</dt>
                      <dd className="text-[color:var(--dheerah-crimson)] font-semibold">- {formatINR(couponDiscount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Delivery</dt>
                    <dd className={shipping === 0 ? 'text-[color:var(--dheerah-crimson)] font-bold' : 'text-[color:var(--dheerah-charcoal)]'}>
                      {shipping === 0 ? 'COMPLIMENTARY' : formatINR(shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">GST (incl.)</dt>
                    <dd className="text-[color:var(--dheerah-charcoal)] font-medium">{formatINR(tax)}</dd>
                  </div>
                </dl>

                <hr className="my-4 border-dashed border-[color:var(--dheerah-beige-soft)]" />

                <div className="flex justify-between items-baseline mb-4">
                  <span className="font-sans font-semibold text-[16px] text-[color:var(--dheerah-charcoal)]">Total Amount</span>
                  <span className="font-sans font-bold text-[20px] text-[color:var(--dheerah-charcoal)]">{formatINR(totalAfterCoupon)}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate({ name: 'checkout' })}
                  className="btn-primary w-full py-3.5"
                >
                  Proceed to Checkout
                </motion.button>
              </div>

              <div className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-3.5 flex items-center gap-3 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-[color:var(--dheerah-gold)] shrink-0" />
                <p className="text-[11px] text-[color:var(--dheerah-charcoal-muted)] leading-snug font-light">
                  Direct artisan-to-patron authenticity guarantee. Secure encrypted checkout. Complimentary insured transit across India.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
