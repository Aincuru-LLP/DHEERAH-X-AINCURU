import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Heart,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  RotateCw,
  ShoppingBag,
  Trash2,
  Truck,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrderContext';
import { formatINR } from '../constants';
import FabricImage from '../components/FabricImage';
import OrderStatusTracker from '../components/OrderStatusTracker';
import AddressBookEditor from '../components/AddressBookEditor';
import LoginSecuritySection from '../components/LoginSecuritySection';
import ReturnModal from '../components/ReturnModal';
import OrderChatModal from '../components/OrderChatModal';
import { auth, ordersApi } from '../lib/firebase';
import { returnsApi, chatApi } from '../lib/support';
import type { Order, OrderStatus, ReturnRequest, ReturnStatus } from '../types';

type Tab = 'profile' | 'orders' | 'returns' | 'wishlist' | 'addresses';

interface Props {
  tab?: Tab;
}

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin }
];

const statusPillStyle: Record<OrderStatus, string> = {
  placed: 'bg-[#FAF7F0] text-[#C7042B] border border-[#C7042B]/30',
  processing: 'bg-[#FAF7F0] text-[#CC9E00] border border-[#CC9E00]/40',
  shipped: 'bg-[#1C1A18] text-[#FAF7F0] border border-[#CC9E00]/40',
  delivered: 'bg-[#1C1A18] text-[#FAF7F0] border border-[#CC9E00]/60',
  cancelled: 'bg-[#FAF7F0] text-[#5A554E] border border-[#E8D7BD]',
  refunded: 'bg-[#FAF7F0] text-[#5A554E] border border-[#E8D7BD]'
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const formatShortDate = (d: Date) =>
  d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

const SLOW_CATEGORIES = new Set(['Studios Prêt', 'Sarees']);

// Returns are accepted within this many days of delivery. Enforced server-side
// in firestore.rules (orderIsReturnable); mirrored here to gate the button.
const RETURN_WINDOW_DAYS = 7;

/** Coerce a Firestore Timestamp | ISO string | Date into a Date, or null. */
const toDate = (v: unknown): Date | null => {
  if (!v) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === 'function') return (v as { toDate: () => Date }).toDate();
  if (typeof v === 'string' || typeof v === 'number') { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; }
  if (v instanceof Date) return v;
  return null;
};

/** True while a delivered order is still inside the return window. Requires a
 *  deliveredAt stamp (orders delivered before this was introduced can't be
 *  returned from the UI — matching the rules, which require the timestamp). */
const returnWindowOpen = (order: Order): boolean => {
  const d = toDate(order.deliveredAt);
  if (!d) return false;
  return Date.now() - d.getTime() <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

// Same-week SLA for in-stock pieces, multi-week SLA for stitched
// pieces (Studios Prêt) and made-to-order sarees.
const ETA_FAST_DAYS = 5;
const ETA_SLOW_DAYS = 14;

const computeEta = (order: Order): Date | null => {
  if (!order.placedAt) return null;
  const placed = new Date(order.placedAt);
  if (Number.isNaN(placed.getTime())) return null;
  const slow = order.items.some(it => SLOW_CATEGORIES.has(it.fabricSnapshot?.masterCategory));
  const days = slow ? ETA_SLOW_DAYS : ETA_FAST_DAYS;
  return new Date(placed.getTime() + days * 24 * 60 * 60 * 1000);
};

const shortOrderId = (id: string) => `DH-${id.slice(-8).toUpperCase()}`;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

const paymentLabel = (m: Order['paymentMethod']) => {
  switch (m) {
    case 'card': return 'Card';
    case 'upi': return 'UPI';
    case 'cod': return 'Cash on Delivery';
    default: return m;
  }
};

const AccountPage: React.FC<Props> = ({ tab = 'profile' }) => {
  const { user, loading, logout } = useAuth();
  const { navigate } = useRouter();

  // Only bounce to login once Firebase has finished rehydrating the session.
  // During the initial ~500ms auth resolution `user` is null even for a
  // signed-in returning visitor; redirecting then causes a loop with
  // LoginPage's reciprocal redirect.
  useEffect(() => {
    if (!loading && !user) navigate({ name: 'login' });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <main className="pt-[140px] pb-20 min-h-screen flex items-center justify-center bg-[#FAF7F0]">
        <div
          className="w-8 h-8 border-2 border-[#C7042B] border-t-transparent rounded-full animate-spin"
          aria-label="Loading account"
        />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pt-[140px] pb-20 min-h-screen text-center px-5 bg-[#FAF7F0]">
        <p className="text-[14px] text-[#5A554E]">Redirecting to patron sign in…</p>
      </main>
    );
  }

  const handleSignOut = () => {
    void logout();
    navigate({ name: 'home' });
  };

  return (
    <main className="pt-[100px] md:pt-[116px] pb-16 bg-[#FAF7F0] min-h-[60vh]">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 lg:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#CC9E00] mb-1">The Dheerah Circle</p>
        <h1 className="font-serif text-2xl md:text-3xl font-normal mb-4 text-[#1C1A18]">
          Welcome, {user.fullName.split(' ')[0] || 'Patron'}
        </h1>

        {/* Mobile tab bar */}
        <div className="md:hidden mb-5">
          <nav className="grid grid-cols-5 border border-[#E8D7BD] rounded overflow-hidden divide-x divide-[#E8D7BD] bg-white">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate({ name: 'account', tab: t.id })}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                    active
                      ? 'text-[#C7042B] bg-[#FAF7F0]'
                      : 'text-[#5A554E] bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
          <div className="text-right mt-2">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#5A554E] hover:text-[#C7042B]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <div className="md:sticky md:top-[110px]">
              <div className="bg-[#FDFBF7] border border-[#E8D7BD] mb-3 rounded overflow-hidden shadow-sm">
                <div className="px-4 py-4 border-b border-[#E8D7BD] bg-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC9E00] mb-1">
                    Patron Account
                  </p>
                  <p className="text-[14px] font-bold text-[#1C1A18] truncate">{user.fullName}</p>
                  <p className="text-[12px] text-[#78716A] truncate">{user.email}</p>
                </div>
                <ul className="divide-y divide-[#E8D7BD]/60">
                  {TABS.map(t => {
                    const Icon = t.icon;
                    const active = t.id === tab;
                    return (
                      <li key={t.id}>
                        <button
                          onClick={() => navigate({ name: 'account', tab: t.id })}
                          className={`w-full flex items-center justify-between px-4 py-3 text-[13px] font-semibold border-l-2 transition-colors ${
                            active
                              ? 'border-[#C7042B] text-[#C7042B] bg-[#FAF7F0]'
                              : 'border-transparent text-[#1C1A18] hover:bg-[#FAF7F0]'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${active ? 'text-[#C7042B]' : 'text-[#78716A]'}`} />
                            {t.label}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${active ? 'text-[#C7042B]' : 'opacity-40'}`} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full bg-white border border-[#E8D7BD] px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#1C1A18] inline-flex items-center justify-center gap-2 hover:border-[#C7042B] hover:text-[#C7042B] transition-colors rounded shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </aside>

          {/* Content */}
          <section>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {tab === 'profile' && <ProfileTab />}
                {tab === 'orders' && <OrdersTab />}
                {tab === 'returns' && <ReturnsTab />}
                {tab === 'wishlist' && <WishlistTab />}
                {tab === 'addresses' && <AddressBookEditor />}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
};

/* ─────────── Profile tab ─────────── */

// Maps a user-id derived hash to a palette slot — same id always gets the
// same colour so the avatar feels stable across renders.
const AVATAR_PALETTE = [
  'bg-[color:var(--color-myntra-pink)]',
  'bg-[color:var(--color-myntra-green)]',
  'bg-[color:var(--color-myntra-navy)]'
];

const ProfileTab: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Firebase Auth currentUser carries the Google photo + display info that we
  // don't persist on the user doc. Reading it directly keeps the User type
  // unchanged while still surfacing the avatar.
  const photoURL = auth.currentUser?.photoURL ?? null;

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setPhone(user?.phone ?? '');
  }, [user?.fullName, user?.phone]);

  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(id);
  }, [success]);

  useEffect(() => {
    if (!error) return;
    const id = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(id);
  }, [error]);

  if (!user) return null;

  const dirty = fullName.trim() !== user.fullName || (phone.trim() || undefined) !== user.phone;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (fullName.trim().length < 2) {
      setError('Please enter your full name (min 2 characters).');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined });
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  const paletteIdx =
    Math.abs(user.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_PALETTE.length;

  return (
    <div className="bg-[#FDFBF7] border border-[#E8D7BD] p-5 md:p-7 rounded shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-[#E8D7BD]">
        {photoURL ? (
          <img
            src={photoURL}
            alt={user.fullName}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border border-[#E8D7BD] shrink-0"
          />
        ) : (
          <div
            aria-hidden
            className="w-16 h-16 rounded-full text-white font-extrabold text-[20px] inline-flex items-center justify-center shrink-0 bg-[#1C1A18] border border-[#CC9E00]"
          >
            {initialsOf(user.fullName || user.email)}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-serif text-[18px] font-normal text-[#1C1A18] truncate">
            {user.fullName || 'Dheerah Patron'}
          </h2>
          <p className="text-[13px] text-[#5A554E] truncate">{user.email}</p>
          <p className="text-[11px] text-[#78716A] mt-0.5">
            Circle Patron since {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#CC9E00] mb-4">
        Patron Credentials
      </h3>

      <form onSubmit={handleSave} noValidate className="space-y-4 max-w-md">
        <div>
          <label
            htmlFor="profile-name"
            className="block text-[12px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
          >
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="input-box bg-white"
            autoComplete="name"
          />
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="block text-[12px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
            <input
              id="profile-email"
              type="email"
              value={user.email}
              readOnly
              className="input-box pl-9 bg-[#FAF7F0] text-[#78716A] cursor-not-allowed border-[#E8D7BD]"
            />
          </div>
          <p className="text-[11px] text-[#78716A] mt-1">
            Email cannot be changed. Reach out to concierge@dheerah.com if you require updates.
          </p>
        </div>

        <div>
          <label
            htmlFor="profile-phone"
            className="block text-[12px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
          >
            Phone Number <span className="text-[#78716A] font-normal normal-case">(optional)</span>
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="input-box bg-white"
            autoComplete="tel"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-[13px] font-medium text-[#C7042B] bg-[#FAF7F0] border border-[#C7042B]/30 px-3.5 py-2 rounded"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="text-[13px] font-medium text-[#1C1A18] bg-[#FAF7F0] border border-[#CC9E00]/40 px-3.5 py-2 rounded"
          >
            {success}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving || !dirty} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
      <LoginSecuritySection />
    </div>
  );
};

/* ─────────── Orders tab ─────────── */

const OrderSkeleton: React.FC = () => (
  <div className="bg-white border border-[color:var(--color-myntra-border-soft)] p-4 flex gap-4 animate-pulse">
    <div className="w-16 h-20 md:w-20 md:h-24 shrink-0 bg-[color:var(--color-myntra-bg-soft)]" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-24 bg-[color:var(--color-myntra-bg-soft)]" />
      <div className="h-4 w-40 bg-[color:var(--color-myntra-bg-soft)]" />
      <div className="h-3 w-56 bg-[color:var(--color-myntra-bg-soft)]" />
      <div className="h-4 w-20 bg-[color:var(--color-myntra-bg-soft)] mt-3" />
    </div>
  </div>
);

const OrdersTab: React.FC = () => {
  const { user } = useAuth();
  const { orders, loading, error, refresh } = useOrders();
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reordered, setReordered] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [returnFor, setReturnFor] = useState<Order | null>(null);
  const [returnExisting, setReturnExisting] = useState<ReturnRequest[]>([]);
  const [returnDone, setReturnDone] = useState<string | null>(null);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);

  // Unread atelier replies per order, so a customer who closed the chat still
  // sees that support answered. One listener for all of my conversations.
  const [chatUnread, setChatUnread] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!user) { setChatUnread({}); return; }
    const unsub = chatApi.subscribeMine(convs => {
      const map: Record<string, number> = {};
      for (const c of convs) if ((c.unreadForCustomer ?? 0) > 0) map[c.orderId] = c.unreadForCustomer!;
      setChatUnread(map);
    });
    return unsub;
  }, [user]);

  const openReturn = async (order: Order) => {
    let existing: ReturnRequest[] = [];
    try { existing = await returnsApi.forOrder(order.id); } catch { /* best-effort */ }
    setReturnExisting(existing);
    setReturnFor(order);
  };

  // ordersApi.mine() already filters/sorts server-side, so the rows arrive
  // ready to render — no client-side userId filter needed.
  const myOrders = useMemo<Order[]>(() => (user ? orders : []), [orders, user]);

  useEffect(() => {
    if (!reordered) return;
    const id = window.setTimeout(() => setReordered(null), 3000);
    return () => window.clearTimeout(id);
  }, [reordered]);

  if (loading && myOrders.length === 0) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <OrderSkeleton />
        <OrderSkeleton />
        <OrderSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FDFBF7] border border-[#E8D7BD] px-6 py-12 text-center rounded">
        <p className="text-[13px] font-medium text-[#C7042B] mb-4">{error}</p>
        <button onClick={() => void refresh()} className="btn-outline">
          Try Again
        </button>
      </div>
    );
  }

  if (myOrders.length === 0) {
    return (
      <div className="bg-[#FDFBF7] border border-[#E8D7BD] px-6 py-14 text-center rounded shadow-sm">
        <Package className="w-12 h-12 mx-auto text-[#CC9E00]/60 mb-4" />
        <h2 className="font-serif text-[20px] font-normal mb-1 text-[#1C1A18]">
          No Boutique Orders Yet
        </h2>
        <p className="text-[13px] text-[#5A554E] max-w-sm mx-auto mb-6 leading-relaxed">
          Commission your first couture piece and your orders will appear here.
        </p>
        <button onClick={() => navigate({ name: 'shop' })} className="btn-primary">
          Explore Boutique
        </button>
      </div>
    );
  }

  const reorder = (order: Order) => {
    order.items.forEach(it => addItem({ fabricId: it.fabricId, quantity: it.quantity, color: it.color }));
    setReordered(order.id);
    window.setTimeout(() => navigate({ name: 'cart' }), 350);
  };

  const cancelOrder = async (order: Order) => {
    const ok = window.confirm(`Cancel order ${shortOrderId(order.id)}? This cannot be undone.`);
    if (!ok) return;
    setCancelError(null);
    setCancelling(order.id);
    try {
      await ordersApi.setStatus(order.id, 'cancelled');
      await refresh();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Unable to cancel this order.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#CC9E00]">
          My Boutique Orders
        </h2>
        <span className="text-[12px] font-medium text-[#78716A]">
          {myOrders.length} {myOrders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {myOrders.map(order => {
        const status: OrderStatus = order.status ?? 'placed';
        const isCancelled = status === 'cancelled' || status === 'refunded';
        const isDelivered = status === 'delivered';
        const unitCount = order.items.reduce((s, it) => s + it.quantity, 0);
        const firstItem = order.items[0]?.fabricSnapshot;
        const isOpen = expanded === order.id;
        const eta = !isCancelled && !isDelivered ? computeEta(order) : null;
        const canCancel = status === 'placed' || status === 'processing';

        return (
          <article
            key={order.id}
            data-testid="order-row"
            className="bg-[#FDFBF7] border border-[#E8D7BD] rounded overflow-hidden shadow-sm transition-shadow hover:shadow"
          >
            <div className="p-4 sm:p-5 flex gap-4">
              {firstItem && (
                <button
                  onClick={() => navigate({ name: 'product', id: firstItem.id })}
                  className="w-16 h-20 md:w-20 md:h-24 shrink-0 bg-[#FAF7F0] border border-[#E8D7BD] rounded overflow-hidden"
                  aria-label={`View ${firstItem.name}`}
                >
                  <FabricImage
                    photo={firstItem.photo}
                    fallback={firstItem.image}
                    alt={firstItem.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716A]">
                      Receipt Ref
                    </p>
                    <p className="font-mono text-[13px] font-bold text-[#1C1A18] truncate">
                      {shortOrderId(order.id)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${statusPillStyle[status]}`}
                  >
                    {isCancelled ? 'Cancelled' : status}
                  </span>
                </div>

                <p className="text-[12px] text-[#5A554E] mt-1">
                  Placed {formatDate(order.placedAt)} · {order.items.length} item
                  {order.items.length === 1 ? '' : 's'} · {unitCount} piece{unitCount === 1 ? '' : 's'}
                </p>

                {eta && (
                  <p className="text-[12px] mt-1.5 inline-flex items-center gap-1 font-medium text-[#1C1A18]">
                    <Truck className="w-3.5 h-3.5 text-[#C7042B]" />
                    Estimated Delivery: <span className="font-bold text-[#C7042B]">{formatShortDate(eta)}</span>
                  </p>
                )}
                {isDelivered && (
                  <p className="text-[12px] mt-1.5 inline-flex items-center gap-1 font-semibold text-[#1C1A18]">
                    <Check className="w-3.5 h-3.5 text-[#CC9E00]" strokeWidth={3} />
                    Delivered
                  </p>
                )}

                <div className="flex items-center justify-between mt-3.5 gap-2 flex-wrap pt-2 border-t border-[#E8D7BD]/60">
                  <p className="text-[14px] font-bold text-[#1C1A18]">{formatINR(order.total)}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => reorder(order)}
                      className="text-[11px] font-bold uppercase tracking-wider text-[#5A554E] inline-flex items-center gap-1 hover:text-[#C7042B] transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      Reorder
                    </button>
                    {(() => {
                      const unread = chatUnread[order.id] ?? 0;
                      return (
                        <button
                          onClick={() => setChatOrder(order)}
                          aria-label={unread > 0 ? `Chat — ${unread} new repl${unread === 1 ? 'y' : 'ies'}` : 'Chat about this order'}
                          className={`text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:text-[#C7042B] transition-colors ${
                            unread > 0 ? 'text-[#C7042B]' : 'text-[#5A554E]'
                          }`}
                        >
                          <MessageCircle className="w-3 h-3" />
                          Concierge Chat
                          {unread > 0 && (
                            <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[#C7042B] text-white text-[9px] font-bold inline-flex items-center justify-center">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </button>
                      );
                    })()}
                    {isDelivered && returnWindowOpen(order) && (
                      <button
                        onClick={() => void openReturn(order)}
                        className="text-[11px] font-bold uppercase tracking-wider text-[#5A554E] inline-flex items-center gap-1 hover:text-[#C7042B] transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Return
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => void cancelOrder(order)}
                        disabled={cancelling === order.id}
                        className="text-[11px] font-bold uppercase tracking-wider text-[#C7042B] inline-flex items-center gap-1 hover:underline disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        {cancelling === order.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                    {!isCancelled && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="text-[11px] font-bold uppercase tracking-wider text-[#1C1A18] inline-flex items-center gap-1 hover:text-[#C7042B] transition-colors"
                        aria-expanded={isOpen}
                      >
                        Track
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => navigate({ name: 'confirmation', orderId: order.id })}
                      className="text-[11px] font-bold uppercase tracking-wider text-[#C7042B] inline-flex items-center gap-0.5 hover:underline"
                    >
                      Receipt
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {reordered === order.id && (
                  <p
                    role="status"
                    className="text-[12px] font-medium text-[#1C1A18] mt-2"
                  >
                    Items added to your bag — taking you there…
                  </p>
                )}
                {cancelError && cancelling === order.id && (
                  <p
                    role="alert"
                    className="text-[12px] font-medium text-[#C7042B] mt-2"
                  >
                    {cancelError}
                  </p>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-[#E8D7BD] px-4 py-5 bg-[#FAF7F0]">
                <OrderStatusTracker currentStatus={status} placedAt={order.placedAt} />

                {eta && (
                  <p className="mt-3.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1C1A18]">
                    <CalendarDays className="w-3.5 h-3.5 text-[#CC9E00]" />
                    Estimated Delivery: <span className="font-bold">{formatShortDate(eta)}</span>
                  </p>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#E8D7BD]/60">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716A] mb-2">
                      Commissioned Pieces
                    </p>
                    <ul className="space-y-2">
                      {order.items.map((it, idx) => {
                        const fs = it.fabricSnapshot ?? ({} as Partial<typeof it.fabricSnapshot>);
                        const qty = it.quantity ?? 0;
                        return (
                        <li key={`${it.fabricId}-${idx}`} className="flex items-center gap-3">
                          <div className="w-10 h-12 shrink-0 bg-white border border-[#E8D7BD] rounded overflow-hidden">
                            <FabricImage
                              photo={fs.photo ?? ''}
                              fallback={fs.image ?? ''}
                              alt={fs.name ?? 'Item'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-bold uppercase text-[#1C1A18] truncate">
                              {fs.brand ?? 'DHEERAH'}
                            </p>
                            <p className="text-[11px] text-[#5A554E] truncate">
                              {fs.name ?? 'Item'} · Qty {qty}
                              {it.color ? ` · ${it.color}` : ''}
                            </p>
                          </div>
                          <p className="text-[12px] font-bold text-[#1C1A18] shrink-0">
                            {formatINR(qty * (fs.price ?? 0))}
                          </p>
                        </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716A] mb-1 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#CC9E00]" />
                        Shipping Destination
                      </p>
                      <p className="text-[12px] text-[#1C1A18] whitespace-pre-line leading-relaxed">
                        {order.shippingAddress.fullName}
                        {`\n${order.shippingAddress.line1}`}
                        {order.shippingAddress.line2 ? `\n${order.shippingAddress.line2}` : ''}
                        {`\n${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`}
                        {`\n${order.shippingAddress.country}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716A] mb-1 inline-flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-[#CC9E00]" />
                        Payment
                      </p>
                      <p className="text-[12px] text-[#1C1A18]">
                        {paymentLabel(order.paymentMethod)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {returnDone && (
        <p role="status" className="text-[12px] font-medium text-[#1C1A18] bg-[#FAF7F0] border border-[#CC9E00]/40 px-3.5 py-2.5 rounded">
          Return request submitted. Track it under the Returns tab — confirmation emailed.
        </p>
      )}

      {returnFor && (
        <ReturnModal
          order={returnFor}
          existingReturns={returnExisting}
          onClose={() => setReturnFor(null)}
          onSubmitted={() => {
            setReturnFor(null);
            setReturnDone('done');
            navigate({ name: 'account', tab: 'returns' });
            window.setTimeout(() => setReturnDone(null), 6000);
          }}
        />
      )}

      {chatOrder && (
        <OrderChatModal
          orderId={chatOrder.id}
          orderLabel={shortOrderId(chatOrder.id)}
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
};

/* ─────────── Returns tab ─────────── */

const RETURN_PILL: Record<ReturnStatus, string> = {
  requested: 'bg-[#FAF7F0] text-[#CC9E00] border border-[#CC9E00]/40',
  approved: 'bg-[#FAF7F0] text-[#CC9E00] border border-[#CC9E00]/40',
  pickup_scheduled: 'bg-[#FAF7F0] text-[#CC9E00] border border-[#CC9E00]/40',
  in_transit: 'bg-[#FAF7F0] text-[#CC9E00] border border-[#CC9E00]/40',
  received: 'bg-[#1C1A18] text-[#FAF7F0] border border-[#CC9E00]/60',
  refunded: 'bg-[#1C1A18] text-[#FAF7F0] border border-[#CC9E00]/60',
  replaced: 'bg-[#1C1A18] text-[#FAF7F0] border border-[#CC9E00]/60',
  rejected: 'bg-[#FAF7F0] text-[#C7042B] border border-[#C7042B]/30',
  cancelled: 'bg-[#FAF7F0] text-[#5A554E] border border-[#E8D7BD]',
  closed: 'bg-[#FAF7F0] text-[#5A554E] border border-[#E8D7BD]',
};

const RETURN_LABEL: Record<ReturnStatus, string> = {
  requested: 'Requested',
  approved: 'Approved',
  pickup_scheduled: 'Pickup scheduled',
  in_transit: 'In transit',
  received: 'Received',
  refunded: 'Refunded',
  replaced: 'Replaced',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

const ReturnsTab: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setReturns(await returnsApi.mine());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your returns.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const cancel = async (r: ReturnRequest) => {
    if (!window.confirm('Withdraw this return request?')) return;
    setBusy(r.id);
    try {
      await returnsApi.cancel(r.id);
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <OrderSkeleton />
        <OrderSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FDFBF7] border border-[#E8D7BD] px-6 py-12 text-center rounded">
        <p className="text-[13px] font-medium text-[#C7042B] mb-4">{error}</p>
        <button onClick={() => void load()} className="btn-outline">Try again</button>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="bg-[#FDFBF7] border border-[#E8D7BD] px-6 py-14 text-center rounded shadow-sm">
        <RotateCcw className="w-12 h-12 mx-auto text-[#CC9E00]/60 mb-4" />
        <h2 className="font-serif text-[20px] font-normal mb-1 text-[#1C1A18]">No Returns Recorded</h2>
        <p className="text-[13px] text-[#5A554E] max-w-sm mx-auto mb-6 leading-relaxed">
          You can request alterations or returns on any delivered order under the Orders tab.
        </p>
        <button onClick={() => navigate({ name: 'account', tab: 'orders' })} className="btn-primary">View Orders</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#CC9E00]">
          My Atelier Returns
        </h2>
        <span className="text-[12px] font-medium text-[#78716A]">
          {returns.length}
        </span>
      </div>

      {returns.map(r => {
        const latest = r.history?.[r.history.length - 1];
        const canWithdraw = r.status === 'requested';
        return (
          <article key={r.id} className="bg-[#FDFBF7] border border-[#E8D7BD] p-5 rounded shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716A]">Return Case</p>
                <p className="font-mono text-[13px] font-bold text-[#1C1A18]">RET-{r.id.slice(-8).toUpperCase()}</p>
                <p className="text-[11px] text-[#5A554E] mt-0.5">
                  Order {shortOrderId(r.orderId)} · {r.resolution === 'refund' ? 'Refund' : 'Replacement'} · {formatDate(r.createdAt)}
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shrink-0 ${RETURN_PILL[r.status]}`}>
                {RETURN_LABEL[r.status]}
              </span>
            </div>

            <ul className="mt-3.5 space-y-1 bg-[#FAF7F0] p-3 border border-[#E8D7BD] rounded">
              {r.items.map((it, i) => (
                <li key={`${it.fabricId}-${i}`} className="text-[12px] text-[#1C1A18] font-medium">
                  {it.name} · Qty {it.quantity}
                </li>
              ))}
            </ul>

            <p className="text-[12px] text-[#5A554E] mt-3">
              <span className="font-semibold text-[#1C1A18]">Reason:</span> {r.reason}
            </p>

            {r.status === 'refunded' && r.refundAmount ? (
              <p className="text-[12px] font-semibold text-[#1C1A18] mt-1.5">
                Refunded <span className="text-[#C7042B]">{formatINR(r.refundAmount)}</span>{r.refundMethod ? ` · ${r.refundMethod}` : ''}
              </p>
            ) : null}

            {latest && (
              <p className="text-[11px] text-[#78716A] mt-2 inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#CC9E00]" /> Last update {formatDate(latest.at)}{latest.note ? ` · ${latest.note}` : ''}
              </p>
            )}

            {canWithdraw && (
              <div className="mt-3.5 pt-2 border-t border-[#E8D7BD]/60">
                <button
                  onClick={() => void cancel(r)}
                  disabled={busy === r.id}
                  className="text-[11px] font-bold uppercase tracking-wider text-[#C7042B] inline-flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {busy === r.id ? 'Withdrawing…' : 'Withdraw Request'}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

/* ─────────── Wishlist tab ─────────── */

const WishlistTab: React.FC = () => {
  const wishlist = useWishlist();
  const { addItem } = useCart();
  const { navigate } = useRouter();

  const items = wishlist.resolved;

  if (items.length === 0 && wishlist.resolving) {
    return (
      <div className="bg-[#FDFBF7] border border-[#E8D7BD] px-6 py-12 text-center rounded">
        <span
          className="inline-block w-6 h-6 border-2 border-[#E8D7BD] border-t-[#C7042B] rounded-full animate-spin"
          aria-label="Loading wishlist"
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#FDFBF7] border border-[#E8D7BD] px-6 py-14 text-center rounded shadow-sm">
        <Heart className="w-12 h-12 mx-auto text-[#CC9E00]/60 mb-4" />
        <h2 className="font-serif text-[20px] font-normal mb-1 text-[#1C1A18]">
          Curate Pieces You Adore
        </h2>
        <p className="text-[13px] text-[#5A554E] max-w-sm mx-auto mb-6 leading-relaxed">
          Tap the heart on any couture piece to save it to your personal boutique wishlist.
        </p>
        <button onClick={() => navigate({ name: 'shop' })} className="btn-primary">
          Explore Boutique
        </button>
      </div>
    );
  }

  const moveToBag = (fabricId: string) => {
    addItem({ fabricId, quantity: 1 });
    wishlist.remove(fabricId);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#CC9E00]">
          My Boutique Wishlist
        </h2>
        <span className="text-[12px] font-medium text-[#78716A]">
          {items.length} {items.length === 1 ? 'Piece' : 'Pieces'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map(fabric => (
          <div
            key={fabric.id}
            className="bg-[#FDFBF7] border border-[#E8D7BD] overflow-hidden flex flex-col rounded shadow-sm hover:shadow transition-shadow"
          >
            <button
              onClick={() => navigate({ name: 'product', id: fabric.id })}
              className="block w-full aspect-[3/4] bg-[#FAF7F0] overflow-hidden"
              aria-label={`View ${fabric.name}`}
            >
              <FabricImage
                photo={fabric.photo}
                fallback={fabric.image}
                alt={fabric.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </button>
            <div className="p-3.5 flex flex-col gap-1 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#1C1A18] truncate">{fabric.brand || 'DHEERAH'}</p>
              <p className="text-[12px] text-[#5A554E] truncate font-sans">{fabric.name}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-[14px] font-bold text-[#1C1A18]">{formatINR(fabric.price)}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-[#E8D7BD]/60">
                <button
                  onClick={() => moveToBag(fabric.id)}
                  className="text-[10px] font-bold uppercase tracking-wider bg-[#C7042B] text-white py-2 px-1 hover:bg-[#8F0320] transition-colors rounded inline-flex items-center justify-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Bag
                </button>
                <button
                  onClick={() => wishlist.remove(fabric.id)}
                  className="text-[10px] font-bold uppercase tracking-wider border border-[#E8D7BD] text-[#5A554E] py-2 px-1 hover:border-[#C7042B] hover:text-[#C7042B] transition-colors rounded inline-flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;
