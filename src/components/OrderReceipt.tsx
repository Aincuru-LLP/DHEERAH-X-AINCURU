import React from 'react';
import { Printer } from 'lucide-react';
import { formatINR } from '../constants';
import FabricImage from './FabricImage';
import type { Order } from '../types';

interface Props {
  order: Order;
}

const paymentLabel = (m: Order['paymentMethod']): string => {
  switch (m) {
    case 'cod': return 'Cash on Delivery';
    case 'cash': return 'Cash';
    case 'upi': return 'UPI';
    case 'card': return 'Card';
    // A receipt must never render "undefined" where the payment method goes,
    // whatever an older or newer order happens to carry.
    default: return String(m ?? '—');
  }
};

const OrderReceipt: React.FC<Props> = ({ order }) => {
  const placedISO = new Date(order.placedAt).toISOString();
  const placedHuman = new Date(order.placedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const shortHash = `DH-${order.id.slice(-8).toUpperCase()}`;

  const safeTax =
    typeof order.tax === 'number' && !isNaN(order.tax)
      ? order.tax
      : Math.round((Math.max(0, (order.subtotal ?? 0) - (order.couponDiscount ?? 0)) * 0.05) / 1.05);

  return (
    <section className="receipt bg-white border border-[#EAE6DF] shadow-[0_4px_28px_rgba(0,0,0,0.03)] rounded-2xl print:border-0 print:shadow-none">
      {/* Print stylesheet: hide chrome (nav, footer, modals, page hero & buttons),
          force white background, target A4 paper. */}
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          .receipt, .receipt * { visibility: visible !important; }
          .receipt {
            position: absolute !important;
            inset: 0 !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            font-size: 12px;
            background: #fff !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="px-6 py-6 sm:px-8 sm:py-8 max-w-[800px] mx-auto">
        {/* Print toolbar — hidden when printing */}
        <div className="no-print flex justify-end mb-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-outline inline-flex items-center gap-2 text-[12px] py-1.5 px-4 rounded-lg"
          >
            <Printer className="w-4 h-4 text-[#A6823B]" /> Print Receipt
          </button>
        </div>

        {/* Brand mark */}
        <header className="flex items-start justify-between border-b border-[#EAE6DF] pb-5 mb-5">
          <div className="flex items-center gap-3">
            <img src="/branding/dheerah-logo.png" alt="Dheerah Designer Boutique" className="h-10 w-auto object-contain" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--dheerah-crimson)]">Atelier Receipt</p>
            <p className="font-mono text-[14px] font-bold text-[#1C1A18] mt-0.5">{shortHash}</p>
            <p className="text-[10px] text-[#78716A] font-mono break-all mt-0.5">{order.id}</p>
          </div>
        </header>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-[12px] bg-[#FAF9F6] p-4 sm:p-5 border border-[#EAE6DF] rounded-xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716A] mb-1">Placed</p>
            <p className="font-medium text-[#1C1A18]">{placedHuman}</p>
            <p className="text-[10px] text-[#78716A] mt-0.5">{placedISO}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716A] mb-1">Payment Method</p>
            <p className="font-medium text-[#1C1A18]">{paymentLabel(order.paymentMethod)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716A] mb-1">Status</p>
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white text-[#C7042B] border border-[#C7042B]/30 shadow-xs">
              {order.status ?? 'placed'}
            </span>
          </div>
        </div>

        {/* Items table */}
        <div className="border border-[#EAE6DF] mb-6 overflow-x-auto rounded-xl">
          <table className="w-full text-[12px]">
            <thead className="bg-[#FAF9F6] text-left uppercase tracking-wider text-[10px] text-[#554E44] border-b border-[#EAE6DF]">
              <tr>
                <th className="px-3.5 py-2.5 font-bold">Couture Piece</th>
                <th className="px-3.5 py-2.5 font-bold">Colour</th>
                <th className="px-3.5 py-2.5 font-bold text-right">Qty</th>
                <th className="px-3.5 py-2.5 font-bold text-right">Rate</th>
                <th className="px-3.5 py-2.5 font-bold text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => {
                const fs = it.fabricSnapshot ?? ({} as Partial<typeof it.fabricSnapshot>);
                const rate = fs.price ?? 0;
                const qty = it.quantity ?? 0;
                return (
                  <tr key={`${it.fabricId}-${idx}`} className="border-t border-[#EAE6DF] align-top hover:bg-[#FAF9F6]/60 transition-colors">
                    <td className="px-3.5 py-3">
                      <div className="flex gap-3 items-start">
                        <FabricImage
                          photo={fs.photo ?? ''}
                          fallback={fs.image ?? ''}
                          alt={fs.name ?? 'Item'}
                          className="w-11 h-14 object-cover bg-[#FAF9F6] border border-[#EAE6DF] rounded-md flex-shrink-0 print:hidden"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#1C1A18]">{fs.brand ?? 'DHEERAH'}</p>
                          <p className="text-[#5A554E] text-[11px] leading-tight mt-0.5">{fs.name ?? 'Item'}{it.size ? ` · Size: ${it.size}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-[#5A554E]">{it.color ? it.color : '—'}{it.size ? ` (${it.size})` : ''}</td>
                    <td className="px-3.5 py-3 text-right text-[#1C1A18] font-medium">{qty}</td>
                    <td className="px-3.5 py-3 text-right text-[#5A554E]">{formatINR(rate)}</td>
                    <td className="px-3.5 py-3 text-right font-bold text-[#1C1A18]">{formatINR(rate * qty)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="bg-[#FAF9F6] p-5 border border-[#EAE6DF] rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716A] mb-1.5">Destination Patron</p>
            <address className="not-italic text-[12px] leading-relaxed text-[#1C1A18]">
              <span className="font-bold text-[13px]">{order.shippingAddress.fullName}</span><br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}<br />
              <span className="text-[#5A554E]">{order.shippingAddress.phone}</span><br />
              <span className="text-[#5A554E]">{order.shippingAddress.email}</span>
            </address>
          </div>

          <dl className="text-[12px] space-y-2.5 sm:justify-self-end sm:min-w-[280px] bg-[#FAF9F6] p-5 border border-[#EAE6DF] rounded-xl">
            <div className="flex justify-between gap-6 text-[#5A554E]"><dt>Subtotal (incl. GST)</dt><dd className="text-[#1C1A18] font-medium">{formatINR(order.subtotal)}</dd></div>
            {order.couponCode && (
              <div className="flex justify-between gap-6">
                <dt className="text-[#C7042B]">Privilege · {order.couponCode}</dt>
                <dd className="text-[#C7042B] font-semibold">- {formatINR(order.couponDiscount ?? 0)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-6 text-[#5A554E]">
              <dt>Atelier Shipping</dt>
              <dd className="text-[#1C1A18] font-medium">{order.shipping === 0 ? 'COMPLIMENTARY' : formatINR(order.shipping)}</dd>
            </div>
            <div className="flex justify-between gap-6 text-[#78716A] text-[11px]"><dt>GST (incl.)</dt><dd>{formatINR(safeTax)}</dd></div>
            <div className="flex justify-between gap-6 pt-2.5 mt-2 border-t border-[#EAE6DF] font-bold text-[15px] text-[#1C1A18]">
              <dt>Total Amount</dt><dd className="text-[#C7042B]">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        <footer className="mt-8 pt-5 border-t border-[#EAE6DF] text-center text-[11px] text-[#78716A]">
          <p className="font-bold text-[#1C1A18] mb-1">Sold by Dheerah Designer Boutique, Jubilee Hills, Hyderabad</p>
          <p className="max-w-md mx-auto leading-relaxed">Thank you for choosing Dheerah. For bespoke alteration assistance or concierge inquiries, quote receipt <span className="font-mono font-bold text-[#1C1A18]">{shortHash}</span>.</p>
        </footer>
      </div>
    </section>
  );
};

export default OrderReceipt;
