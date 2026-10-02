import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { ordersApi } from '../lib/firebase';
import { useRouter } from '../context/RouterContext';
import OrderReceipt from '../components/OrderReceipt';
import TaxInvoice from '../components/TaxInvoice';
import type { Order } from '../types';

interface Props {
  orderId: string;
}

/**
 * Returns a Date that is `businessDays` weekdays after `from`.
 * Weekends (Sat/Sun) are skipped — used for couture lead-time estimates.
 */
const addBusinessDays = (from: Date, businessDays: number): Date => {
  const d = new Date(from.getTime());
  let added = 0;
  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d;
};

const computeEta = (order: Order): Date => {
  const placed = new Date(order.placedAt);
  // Studio Prêt and Sarees ship as stocked couture pieces with longer cuts.
  const longLead = order.items.some(it => {
    const mc = it.fabricSnapshot.masterCategory;
    return mc === 'Studios Prêt' || mc === 'Sarees';
  });
  return addBusinessDays(placed, longLead ? 14 : 5);
};

const ConfirmationPage: React.FC<Props> = ({ orderId }) => {
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docView, setDocView] = useState<'receipt' | 'invoice'>('receipt');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    ordersApi
      .get(orderId)
      .then(res => {
        if (cancelled) return;
        setOrder((res as Order | null) ?? null);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load this order.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="pt-[140px] pb-20 min-h-screen text-center px-5 bg-white">
        <div className="inline-flex flex-col items-center gap-3 text-[#5A554E]">
          <span className="inline-block w-8 h-8 border-2 border-[#E8D7BD] border-t-[#C7042B] rounded-full animate-spin" aria-hidden />
          <p className="text-[14px] font-medium tracking-wide">Confirming your boutique order…</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="pt-[140px] pb-20 min-h-screen text-center px-5 bg-white">
        <div className="max-w-md mx-auto bg-white border border-[#EAE6DF] p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <h1 className="font-serif text-3xl font-normal mb-2 text-[#1C1A18]">
            Order Not Found
          </h1>
          <p className="text-[14px] text-[#6B6359] mb-6 leading-relaxed">
            {error
              ? error
              : 'The order may have been placed under a different account, or the link may have expired.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate({ name: 'account', tab: 'orders' })} className="btn-primary">
              View My Orders
            </button>
            <button onClick={() => navigate({ name: 'shop' })} className="btn-outline">
              Return to Boutique
            </button>
          </div>
        </div>
      </main>
    );
  }

  const eta = computeEta(order);
  const etaLabel = eta.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const shortHash = `DH-${order.id.slice(-8).toUpperCase()}`;

  return (
    <main className="pt-[110px] md:pt-[128px] pb-20 bg-white min-h-screen text-[#1C1A18]">
      <div className="max-w-[880px] mx-auto px-4 md:px-8">
        {/* Luxury Hero Card */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="no-print bg-white border border-[#EAE6DF] rounded-2xl shadow-[0_4px_28px_rgba(0,0,0,0.04)] p-8 md:p-12 text-center mb-8 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 opacity-[0.03] pointer-events-none" aria-hidden>
            <Sparkles className="w-64 h-64 text-[#C5A262]" />
          </div>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 280, damping: 20 }}
            className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FDFBF7] border border-[#E8DFC8] mb-5 shadow-sm"
          >
            <span className="absolute inset-0 rounded-full bg-[#C7042B]/5 animate-ping pointer-events-none" aria-hidden />
            <CheckCircle2 className="w-10 h-10 text-[#C7042B] relative" />
          </motion.div>

          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#A6823B] mb-2">
            Order Confirmed · Atelier Order
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight mb-3 text-[#1C1A18]">
            Your bespoke pieces are being prepared.
          </h1>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F5F0] border border-[#EAE6DF] text-[12px] text-[#5A554E] mb-3">
            <span className="text-[#78716A]">Receipt Reference:</span>
            <span data-testid="order-id" className="font-mono font-bold text-[#1C1A18] tracking-wider">{shortHash}</span>
          </div>

          <p className="text-[14px] text-[#6B6359] max-w-lg mx-auto leading-relaxed mb-6">
            Thank you{order.shippingAddress.fullName ? `, ${order.shippingAddress.fullName.split(' ')[0]}` : ''}. An official confirmation with tracking details has been sent to{' '}
            <span className="text-[#1C1A18] font-semibold">{order.shippingAddress.email}</span>.
          </p>

          <div className="inline-flex items-center gap-2.5 bg-[#FAF9F6] border border-[#EAE6DF] px-5 py-2.5 rounded-full shadow-xs mb-8">
            <Truck className="w-4 h-4 text-[#C7042B]" aria-hidden />
            <span className="text-[12px] font-medium text-[#5A554E]">
              Estimated delivery · <span className="text-[#1C1A18] font-bold">{etaLabel}</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center no-print">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate({ name: 'account', tab: 'orders' })}
              className="btn-primary inline-flex items-center justify-center gap-2 text-[13px] px-6 py-3 rounded-lg shadow-sm"
            >
              <Truck className="w-4 h-4" /> Track Order
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate({ name: 'shop' })}
              className="btn-outline inline-flex items-center justify-center gap-2 text-[13px] px-6 py-3 rounded-lg"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </motion.button>
          </div>
        </motion.section>

        {/* Receipt / GST tax invoice toggle */}
        <div className="no-print flex justify-center mb-6">
          <div className="inline-flex items-center gap-1 bg-[#F5F3ED] border border-[#EAE6DF] p-1 rounded-full shadow-xs">
            <button
              onClick={() => setDocView('receipt')}
              className={`px-6 py-2 text-[12px] font-semibold tracking-wider uppercase transition-all rounded-full ${
                docView === 'receipt'
                  ? 'bg-white text-[#1C1A18] shadow-sm'
                  : 'text-[#6B6359] hover:text-[#1C1A18]'
              }`}
            >
              Atelier Receipt
            </button>
            <button
              onClick={() => setDocView('invoice')}
              className={`px-6 py-2 text-[12px] font-semibold tracking-wider uppercase transition-all rounded-full ${
                docView === 'invoice'
                  ? 'bg-white text-[#1C1A18] shadow-sm'
                  : 'text-[#6B6359] hover:text-[#1C1A18]'
              }`}
            >
              Tax Invoice (GST)
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={docView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {docView === 'receipt' ? <OrderReceipt order={order} /> : <TaxInvoice order={order} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
};

export default ConfirmationPage;
