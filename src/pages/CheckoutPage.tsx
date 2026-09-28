import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, CreditCard, Lock, MapPin, Pencil, Smartphone, Tag, Truck, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { formatINR } from '../constants';
import { WebPaymentMethod, ShippingAddress } from '../types';
import { couponsApi } from '../lib/firebase';
import { analytics } from '../lib/analytics';
import { sendOrderEmail, sendOrderWhatsApp } from '../lib/notify';
import { paymentsConfigured, runRazorpayPayment, PaymentsNotConfiguredError } from '../lib/payments';
import FabricImage from '../components/FabricImage';
import { getDisplayCategory } from '../config/productCategories';
import { getEffectiveProductPrice, getEffectiveProductMrp } from '../lib/productPricing';

type Step = 'login' | 'address' | 'payment';

const initialAddress: ShippingAddress = {
  fullName: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India'
};

// Indian phone: optional +91 / 0 prefix, then a 10-digit number starting 6-9.
const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;
const PIN_RE = /^[1-9]\d{5}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const FIELD_ORDER: (keyof ShippingAddress)[] = [
  'fullName', 'email', 'phone', 'line1', 'city', 'state', 'postalCode', 'country'
];

// IMPORTANT: keep StepBlock and Field at module scope, not inside
// CheckoutPage. When defined inside the parent, each render creates a
// fresh function identity, React treats them as a new component type and
// unmounts/remounts the whole subtree on every keystroke. That destroys
// the underlying <input>, drops focus, and orphans the mobile cursor
// handle below the row — visible as the blue droplet drifting out of the
// input on every backspace.

const StepBlock: React.FC<{
  id: Step;
  index: number;
  title: string;
  doneTitle?: string;
  currentStep: Step;
  setStep: (s: Step) => void;
  children: React.ReactNode;
}> = ({ id, index, title, doneTitle, currentStep, setStep, children }) => {
  const active = currentStep === id;
  const done =
    (id === 'login' && (currentStep === 'address' || currentStep === 'payment')) ||
    (id === 'address' && currentStep === 'payment');

  return (
    <div className={`bg-white border ${active ? 'border-[color:var(--dheerah-crimson)]' : 'border-[color:var(--dheerah-beige-soft)]'} rounded-sm mb-3.5 shadow-2xs transition-colors`}>
      <div className="px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={done ? { scale: [0.85, 1.2, 1] } : active ? { scale: [0.95, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-bold ${done ? 'bg-[color:var(--dheerah-charcoal)] text-[color:var(--dheerah-gold)]' : active ? 'bg-[color:var(--dheerah-crimson)] text-white' : 'bg-[color:var(--dheerah-cream)] text-[color:var(--dheerah-charcoal-muted)]'}`}
          >
            {done ? <CheckCircle2 className="w-4 h-4" /> : index}
          </motion.span>
          <span className="font-sans text-[15px] font-semibold text-[color:var(--dheerah-charcoal)]">
            {done && doneTitle ? doneTitle : title}
          </span>
        </div>
        {done && (
          <button onClick={() => setStep(id)} className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)] transition-colors">CHANGE</button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-2 border-t border-[color:var(--dheerah-beige-soft)]/60">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  field: keyof ShippingAddress;
  errors: Record<string, string>;
  fieldRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  children: (ref: (el: HTMLInputElement | null) => void) => React.ReactNode;
  cols?: number;
}> = ({ label, field, errors, fieldRefs, children, cols = 1 }) => (
  <div className={cols === 2 ? 'sm:col-span-2' : ''}>
    <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-charcoal-muted)] mb-1.5">{label}</label>
    {children(el => { fieldRefs.current[field] = el; })}
    {errors[field] && <p className="text-[12px] text-[color:var(--dheerah-crimson)] mt-1 font-semibold">{errors[field]}</p>}
  </div>
);

const CheckoutPage: React.FC = () => {
  const { resolved, subtotal, shipping, tax, total, clearCart } = useCart();
  const { navigate } = useRouter();
  const { user, updateProfile } = useAuth();
  const { placeOrder } = useOrders();

  const [step, setStep] = useState<Step>(user ? 'address' : 'login');
  const [phone, setPhone] = useState(user?.phone ?? '');

  // Whether the saved address banner is currently active. When true, the
  // form is presented as a single read-only line + "Use a different address".
  const [useSavedAddress, setUseSavedAddress] = useState<boolean>(!!user?.defaultAddress);
  const [address, setAddress] = useState<ShippingAddress>(
    user?.defaultAddress
      ?? { ...initialAddress, fullName: user?.fullName ?? '', email: user?.email ?? '', phone: user?.phone ?? '' }
  );
  // Save the (possibly edited) address back to the user profile after order
  // success. Default ON for signed-in users without a saved address.
  const [saveAddress, setSaveAddress] = useState<boolean>(!!user && !user?.defaultAddress);

  // Cash on Delivery is the only live method until the Cashfree gateway lands.
  const [payment, setPayment] = useState<WebPaymentMethod>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // Refs for "focus first invalid field" on validation failure.
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Hydrate the form whenever the user (or their saved address) changes —
  // covers the case where auth resolves after the page mounts.
  useEffect(() => {
    if (user?.defaultAddress) {
      setAddress(user.defaultAddress);
      setUseSavedAddress(true);
      setSaveAddress(false);
    } else if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName,
        email: prev.email || user.email,
        phone: prev.phone || (user.phone ?? '')
      }));
      setSaveAddress(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.defaultAddress]);

  // Fire begin_checkout once on mount (GA4 funnel).
  useEffect(() => {
    if (resolved.length > 0) analytics.beginCheckout(total, resolved.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mrpTotal = useMemo(
    () => resolved.reduce((s, { item, fabric }) => s + getEffectiveProductMrp(fabric, item.size) * item.quantity, 0),
    [resolved]
  );

  if (resolved.length === 0) {
    return (
      <main className="pt-[140px] pb-20 min-h-screen text-center px-5 bg-white">
        <h1 className="text-3xl font-extrabold mb-4">Your bag is empty</h1>
        <button onClick={() => navigate({ name: 'shop' })} className="btn-primary">Continue Shopping</button>
      </main>
    );
  }

  const productDiscount = mrpTotal - subtotal;
  const payable = Math.max(0, total - couponDiscount);

  const validateAddress = (): boolean => {
    const e: Record<string, string> = {};
    if (!address.fullName.trim()) e.fullName = 'Required';
    if (!EMAIL_RE.test(address.email)) e.email = 'Enter a valid email';
    if (!PHONE_RE.test(address.phone.trim())) e.phone = 'Enter a 10-digit Indian mobile';
    if (!address.line1.trim()) e.line1 = 'Required';
    if (!address.city.trim()) e.city = 'Required';
    if (!address.state.trim()) e.state = 'Required';
    if (!PIN_RE.test(address.postalCode.trim())) e.postalCode = 'Enter a 6-digit PIN';
    if (!address.country.trim()) e.country = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const firstBad = FIELD_ORDER.find(f => e[f]);
      if (firstBad) fieldRefs.current[firstBad]?.focus();
      return false;
    }
    return true;
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    setCouponMsg(null);
    try {
      const res = await couponsApi.validate(code, subtotal);
      if (!res.valid) {
        setCouponCode(null);
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
      setCouponCode(code);
      setCouponDiscount(res.discount);
      setCouponMsg({ ok: true, text: `Applied — ${formatINR(res.discount)} off.` });
    } catch (err) {
      setCouponMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not validate coupon.' });
    } finally {
      setCouponBusy(false);
    }
  };

  const clearCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
    setCouponMsg(null);
    setCouponInput('');
  };

  const handleUseDifferentAddress = () => {
    setUseSavedAddress(false);
    // Pre-fill with the user's name/email/phone but blank out the postal bits
    // so the user can clearly type a new destination.
    setAddress({
      ...initialAddress,
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? ''
    });
    setSaveAddress(true);
    // Focus the first real input on next tick.
    setTimeout(() => fieldRefs.current.fullName?.focus(), 0);
  };

  // Online gateway (Cashfree) is not wired yet, so checkout completes via Cash
  // on Delivery: the order is recorded server-side with paymentStatus 'pending'
  // and settled on delivery. No fake "payment successful" theatre.
  const finishOrder = (orderId: string, placedAddress: ShippingAddress) => {
    // Fire-and-forget save of the shipping address as the new default.
    if (saveAddress && user) {
      void updateProfile({ defaultAddress: placedAddress }).catch(err => {
        console.warn('[checkout] could not save default address', err);
      });
    }
    analytics.purchase(orderId, payable);
    // Cart MUST be emptied before navigation so the user can't re-place by
    // hitting back.
    clearCart();
    navigate({ name: 'confirmation', orderId });
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      setStep('address');
      return;
    }
    if (!user) {
      setPlaceError('Please sign in to place your order.');
      navigate({ name: 'login' });
      return;
    }
    setPlaceError(null);
    setPlacing(true);
    try {
      analytics.addPaymentInfo(payable, payment);
      const items = resolved.map(({ item }) => ({
        fabricId: item.fabricId,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }));

      if (payment !== 'cod') {
        // Online payment. The server creates the Razorpay order (recomputing the
        // amount), the gateway collects, and /api/payments/verify checks the
        // signature and amount before it writes the order — so the order only
        // exists once payment actually succeeded.
        const { orderId } = await runRazorpayPayment({
          items,
          couponCode: couponCode ?? undefined,
          paymentMethod: payment,
          shippingAddress: address as unknown as Record<string, unknown>,
          userId: user.id,
          prefill: { name: address.fullName, email: address.email, contact: address.phone },
        });
        finishOrder(orderId, address);
        return;
      }

      const placed = await placeOrder({
        items,
        shippingAddress: address,
        paymentMethod: 'cod',
        couponCode: couponCode ?? undefined,
      });
      void sendOrderEmail(placed); // Brevo confirmation — fire-and-forget
      void sendOrderWhatsApp(placed, address.fullName); // store alert (dormant until WA env set)
      finishOrder(placed.id, address);
    } catch (err) {
      setPlacing(false);
      const raw = err instanceof Error ? err.message : 'Could not place your order. Please try again.';
      const friendly =
        err instanceof PaymentsNotConfiguredError
          ? 'Online payment is not available right now. Please choose Cash on Delivery, or try again shortly.'
          : raw === 'payment_cancelled'
          ? 'Payment was cancelled — your card has not been charged and no order was placed.'
          : raw === 'signature_mismatch' || raw === 'amount_mismatch'
          ? 'We could not verify that payment. If money has left your account it will be reversed automatically; please contact us before retrying.'
          : raw === 'orders_not_configured'
          ? 'Checkout is not fully configured yet. Please try again in a moment or contact us for help.'
          : raw.startsWith('insufficient_stock:')
          ? 'One or more items in your bag just went out of stock. Please review your cart and try again.'
          : raw;
      setPlaceError(friendly);
    }
  };

  return (
    <main className="pt-[100px] md:pt-[116px] pb-14 md:pb-20 bg-[color:var(--dheerah-ivory)] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-10">
        <h1 className="font-serif text-2xl md:text-3xl font-normal mb-5 text-[color:var(--dheerah-charcoal)]">Atelier Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 lg:gap-6">
          <div>
            <StepBlock id="login" index={1} title="Patron Identification" doneTitle={user ? `Patron: ${user.fullName}` : `Identification: ${phone || 'Guest checkout'}`} currentStep={step} setStep={setStep}>
              <div className="flex items-center gap-3 mb-3 text-[color:var(--dheerah-charcoal-muted)]">
                <User className="w-4 h-4 text-[color:var(--dheerah-gold)]" />
                <p className="text-[13px] font-light">
                  {user
                    ? 'You are signed in to your atelier account. Proceed to delivery destination.'
                    : 'Sign in to link this order to your circle profile, or continue as guest.'}
                </p>
              </div>
              {user ? (
                <button onClick={() => setStep('address')} className="btn-primary">Continue</button>
              ) : (
                <div className="flex flex-wrap gap-2 max-w-md">
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 Mobile number" className="input-box flex-1 min-w-[180px]" />
                  <button onClick={() => navigate({ name: 'login' })} className="btn-outline">Sign In</button>
                  <button onClick={() => setStep('address')} className="btn-primary">Continue</button>
                </div>
              )}
            </StepBlock>

            <StepBlock
              id="address"
              index={2}
              title="Delivery Address"
              doneTitle={address.fullName ? `Delivery to: ${address.fullName}, ${address.city}` : 'Delivery Address'}
              currentStep={step}
              setStep={setStep}
            >
              {/* Saved-address banner */}
              {useSavedAddress && user?.defaultAddress && (
                <div className="mb-4 border border-[color:var(--dheerah-beige-soft)] bg-[color:var(--dheerah-cream)] px-4 py-3 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-[color:var(--dheerah-gold)]" aria-hidden />
                    <div>
                      <p className="text-[13px] font-bold text-[color:var(--dheerah-charcoal)]">
                        Delivering to saved address — {user.defaultAddress.city}, {user.defaultAddress.state}
                      </p>
                      <p className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] mt-0.5 leading-relaxed font-light">
                        {user.defaultAddress.fullName} · {user.defaultAddress.line1}
                        {user.defaultAddress.line2 ? `, ${user.defaultAddress.line2}` : ''} · {user.defaultAddress.postalCode}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseDifferentAddress}
                    className="self-start sm:self-center inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)] whitespace-nowrap transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Use a different address
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4 text-[color:var(--dheerah-charcoal-muted)]">
                <MapPin className="w-4 h-4 text-[color:var(--dheerah-gold)]" />
                <p className="text-[13px] font-light">Where would you like your handcrafted creations delivered?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" field="fullName" cols={2} errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="fullName" className="input-box" value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))} />}
                </Field>
                <Field label="Email Address" field="email" errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="email" className="input-box" type="email" value={address.email} onChange={e => setAddress(a => ({ ...a, email: e.target.value }))} />}
                </Field>
                <Field label="Mobile Number" field="phone" errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="phone" className="input-box" type="tel" inputMode="tel" placeholder="10-digit mobile" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} />}
                </Field>
                <Field label="Address Line 1" field="line1" cols={2} errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="line1" className="input-box" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} />}
                </Field>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--dheerah-charcoal-muted)] mb-1.5">Address Line 2 (optional)</label>
                  <input name="line2" className="input-box" value={address.line2 ?? ''} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))} />
                </div>
                <Field label="City" field="city" errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="city" className="input-box" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} />}
                </Field>
                <Field label="State" field="state" errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="state" className="input-box" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} />}
                </Field>
                <Field label="PIN Code" field="postalCode" errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="postalCode" className="input-box" inputMode="numeric" maxLength={6} placeholder="6-digit PIN" value={address.postalCode} onChange={e => setAddress(a => ({ ...a, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} />}
                </Field>
                <Field label="Country" field="country" errors={errors} fieldRefs={fieldRefs}>
                  {ref => <input ref={ref} name="country" className="input-box" value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))} />}
                </Field>
              </div>

              {user && (
                <label className="mt-4 inline-flex items-start gap-2 text-[13px] text-[color:var(--dheerah-charcoal-muted)] cursor-pointer select-none font-light">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={e => setSaveAddress(e.target.checked)}
                    className="mt-0.5 accent-[color:var(--dheerah-crimson)] rounded-xs"
                  />
                  <span>
                    Save this address to my profile for faster checkout next time.
                  </span>
                </label>
              )}

              <button
                onClick={() => { if (validateAddress()) setStep('payment'); }}
                className="btn-primary mt-5"
              >
                Save & Continue
              </button>
            </StepBlock>

            <StepBlock id="payment" index={3} title="Payment Method" currentStep={step} setStep={setStep}>
              <div className="flex items-center gap-3 mb-4 text-[color:var(--dheerah-charcoal-muted)]">
                <Lock className="w-4 h-4 text-[color:var(--dheerah-gold)]" />
                <p className="text-[13px] font-light">
                  {paymentsConfigured
                    ? 'Pay securely by UPI or card, or choose cash on delivery.'
                    : 'Online gateway is configuring. Pay securely on delivery.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {([
                  { id: 'cod',  label: 'Cash on Delivery', sub: 'Pay upon delivery', icon: Truck, enabled: true },
                  { id: 'upi',  label: 'UPI',  sub: paymentsConfigured ? 'GPay, PhonePe, Paytm' : 'Online Gateway', icon: Smartphone, enabled: paymentsConfigured },
                  { id: 'card', label: 'Card', sub: paymentsConfigured ? 'Credit or debit'      : 'Online Gateway', icon: CreditCard, enabled: paymentsConfigured },
                ] as const).map(opt => {
                  const Icon = opt.icon;
                  const active = payment === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      disabled={!opt.enabled}
                      onClick={() => opt.enabled && setPayment(opt.id)}
                      whileHover={opt.enabled ? { scale: 1.02 } : undefined}
                      whileTap={opt.enabled ? { scale: 0.98 } : undefined}
                      className={`text-left border rounded-sm p-3.5 transition-all ${
                        !opt.enabled
                          ? 'border-[color:var(--dheerah-beige-soft)] opacity-50 cursor-not-allowed bg-white'
                          : active
                            ? 'border-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] shadow-2xs'
                            : 'border-[color:var(--dheerah-beige-soft)] bg-white hover:border-[color:var(--dheerah-gold)]'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-2 text-[color:var(--dheerah-charcoal)]" />
                      <p className="text-[13px] font-bold text-[color:var(--dheerah-charcoal)]">{opt.label}</p>
                      <p className="text-[11px] text-[color:var(--dheerah-charcoal-muted)] font-light mt-0.5">{opt.sub}</p>
                    </motion.button>
                  );
                })}
              </div>

              <p className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] font-light">
                {payment === 'cod'
                  ? 'Pay in cash or UPI when our courier partner arrives. Available across India for orders up to ₹50,000.'
                  : 'You will be redirected to our encrypted payment gateway to complete your transaction securely.'}
              </p>

              {placeError && (
                <p role="alert" className="mt-4 text-[13px] font-semibold text-[color:var(--dheerah-crimson)] bg-[color:var(--dheerah-cream)] border border-[color:var(--dheerah-beige-soft)] px-3.5 py-2.5 rounded-sm">
                  {placeError}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-primary mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8"
              >
                {placing ? 'Placing order…' : `Place Order · ${formatINR(payable)}`}
              </motion.button>
            </StepBlock>
          </div>

          {/* Summary */}
          <aside>
            <div className="lg:sticky lg:top-[110px] space-y-3">
              {/* Coupon */}
              <div className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-4 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal)] mb-3 inline-flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[color:var(--dheerah-gold)]" /> Apply Privilege Coupon
                </p>
                {couponCode ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-[color:var(--dheerah-crimson)]">
                      {couponCode} · −{formatINR(couponDiscount)}
                    </span>
                    <button onClick={clearCoupon} className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)]">REMOVE</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      placeholder="Enter code"
                      className="input-box flex-1 text-[13px] uppercase"
                    />
                    <button onClick={applyCoupon} disabled={couponBusy} className="text-[12px] font-bold uppercase tracking-wider text-[color:var(--dheerah-crimson)] hover:text-[color:var(--dheerah-crimson-dark)] px-2.5 disabled:opacity-60">
                      {couponBusy ? '...' : 'APPLY'}
                    </button>
                  </div>
                )}
                {couponMsg && (
                  <p className={`text-[12px] mt-2 font-semibold ${couponMsg.ok ? 'text-emerald-700' : 'text-[color:var(--dheerah-crimson)]'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              <div className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-4 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--dheerah-charcoal-muted)] mb-4">Order Summary ({resolved.length})</p>
                <ul className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {resolved.map(({ item, fabric }) => {
                    const unitPrice = getEffectiveProductPrice(fabric, item.size);
                    return (
                      <li key={`${fabric.id}-${item.color ?? ''}-${item.size ?? ''}`} className="flex gap-3 pb-3 border-b border-[color:var(--dheerah-beige-soft)] last:border-b-0 last:pb-0">
                        <FabricImage photo={fabric.photo} fallback={fabric.image} alt={fabric.name} className="w-12 h-16 object-cover bg-[color:var(--dheerah-cream)] rounded-xs border border-[color:var(--dheerah-beige-soft)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[color:var(--dheerah-charcoal)] truncate uppercase tracking-wider">{fabric.brand}</p>
                          <p className="text-[12px] text-[color:var(--dheerah-charcoal-muted)] truncate font-light">{fabric.name}</p>
                          <p className="text-[10px] text-[color:var(--dheerah-crimson)] font-bold uppercase tracking-wider">{getDisplayCategory(fabric, 'customer')}</p>
                          <p className="text-[11px] text-[color:var(--dheerah-charcoal-muted)]">
                            Qty {item.quantity}{item.color ? ` · ${item.color}` : ''}{item.size ? ` · Size: ${item.size}` : ''}
                          </p>
                        </div>
                        <p className="text-[13px] font-bold text-[color:var(--dheerah-charcoal)] whitespace-nowrap">{formatINR(item.quantity * unitPrice)}</p>
                      </li>
                    );
                  })}
                </ul>

                <hr className="my-4 border-dashed border-[color:var(--dheerah-beige-soft)]" />

                <dl className="space-y-2 text-[13px] md:text-[14px]">
                  <div className="flex justify-between"><dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Total MRP</dt><dd className="font-medium text-[color:var(--dheerah-charcoal)]">{formatINR(mrpTotal)}</dd></div>
                  {productDiscount > 0 && (
                    <div className="flex justify-between"><dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Atelier Discount</dt><dd className="text-[color:var(--dheerah-crimson)] font-semibold">- {formatINR(productDiscount)}</dd></div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between"><dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Privilege Coupon</dt><dd className="text-[color:var(--dheerah-crimson)] font-semibold">- {formatINR(couponDiscount)}</dd></div>
                  )}
                  <div className="flex justify-between"><dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">Delivery</dt><dd className={shipping === 0 ? 'text-[color:var(--dheerah-crimson)] font-bold' : 'text-[color:var(--dheerah-charcoal)]'}>{shipping === 0 ? 'COMPLIMENTARY' : formatINR(shipping)}</dd></div>
                  <div className="flex justify-between"><dt className="text-[color:var(--dheerah-charcoal-muted)] font-light">GST (incl.)</dt><dd className="font-medium text-[color:var(--dheerah-charcoal)]">{formatINR(tax)}</dd></div>
                </dl>

                <div className="flex justify-between items-baseline mt-4 pt-3 border-t border-[color:var(--dheerah-beige-soft)]">
                  <span className="font-sans font-semibold text-[16px] text-[color:var(--dheerah-charcoal)]">Total Payable</span>
                  <span className="font-sans font-bold text-[20px] text-[color:var(--dheerah-charcoal)]">{formatINR(payable)}</span>
                </div>
              </div>

              <div className="bg-white border border-[color:var(--dheerah-beige-soft)] rounded-sm p-3.5 flex items-center gap-3 shadow-2xs">
                <Lock className="w-5 h-5 text-[color:var(--dheerah-gold)] shrink-0" />
                <p className="text-[11px] text-[color:var(--dheerah-charcoal-muted)] font-light leading-snug">
                  Encrypted 256-bit payment transit. Direct atelier fulfillment.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
