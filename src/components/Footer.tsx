import React from 'react';
import { Mail, Phone, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { BUSINESS, gstinConfigured } from '../lib/business';
import type { Route } from '../types';

const POLICY_ROUTES: Record<string, Route> = {
  'About Dheerah': { name: 'policy', policy: 'about' },
  'Shipping Policy': { name: 'policy', policy: 'shipping' },
  'Returns & Exchanges': { name: 'policy', policy: 'refund' },
  'Terms of Service': { name: 'policy', policy: 'terms' },
  'Privacy Policy': { name: 'policy', policy: 'privacy' },
  'Grievance Redressal': { name: 'policy', policy: 'contact' },
  'Contact Us': { name: 'account', tab: 'profile' },
  'Track Order': { name: 'account', tab: 'orders' },
  'My Account': { name: 'account' },
};

const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const cols = [
    {
      title: 'Shop',
      links: [
        { label: 'Sarees', to: () => navigate({ name: 'shop', category: 'Sarees' }) },
        { label: 'Lehenga Cholis', to: () => navigate({ name: 'shop', category: 'Lehenga Cholis' }) },
        { label: 'One Minute Saree', to: () => navigate({ name: 'shop', category: 'One Minute Saree' }) },
        { label: 'Dyeable Fabrics', to: () => navigate({ name: 'shop', category: 'Dyeable Fabrics' }) },
        { label: 'Laces & Trims', to: () => navigate({ name: 'shop', category: 'Laces' }) },
      ]
    },
    {
      title: 'Customer Care',
      links: [
        { label: 'Track Order', to: () => navigate(POLICY_ROUTES['Track Order']) },
        { label: 'Shipping Policy', to: () => navigate(POLICY_ROUTES['Shipping Policy']) },
        { label: 'Returns & Exchanges', to: () => navigate(POLICY_ROUTES['Returns & Exchanges']) },
        { label: 'Grievance Redressal', to: () => navigate(POLICY_ROUTES['Grievance Redressal']) },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Dheerah', to: () => navigate(POLICY_ROUTES['About Dheerah']) },
        { label: 'Terms of Service', to: () => navigate(POLICY_ROUTES['Terms of Service']) },
        { label: 'Privacy Policy', to: () => navigate(POLICY_ROUTES['Privacy Policy']) },
      ]
    }
  ];

  return (
    <footer className="bg-[#050505] text-[#FAF7F0] mt-12 md:mt-20 border-t border-[#CC9E00]/30">
      {/* Brand anchor header */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 pt-12 md:pt-16 pb-8 flex flex-col items-center text-center">
        <div className="inline-block bg-[#FAF7F0] px-8 py-3.5 rounded border border-[#CC9E00]/50 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <img
            src="/branding/dheerah-logo.png"
            alt="Dheerah Designer Boutique"
            className="h-10 md:h-12 w-auto object-contain select-none"
            draggable={false}
            loading="lazy"
          />
        </div>
        <p className="text-[13px] md:text-[14px] text-[#E8D7BD] max-w-lg font-light tracking-wide mt-2">
          Heritage Indian Designer Wear · Hand-woven Craftsmanship & Bespoke Couture
        </p>
      </div>

      {/* Decorative hairline */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-[#CC9E00]/40 to-transparent" />
      </div>

      {/* Main navigation columns */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {cols.map(col => (
          <div key={col.title}>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CC9E00] mb-4 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#C7042B]" />
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map(l => (
                <li key={l.label}>
                  <button
                    onClick={l.to}
                    className="text-[13px] text-[#E8D7BD]/80 hover:text-[#C7042B] transition-colors text-left"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Concierge column */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CC9E00] mb-4 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#C7042B]" />
            Atelier Concierge
          </h4>
          <div className="flex flex-col gap-2.5 text-[13px] text-[#E8D7BD]/80">
            <a href="tel:+916304211922" className="flex items-center gap-2 hover:text-[#C7042B] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#CC9E00]" /> +91 63042 11922
            </a>
            <a href="mailto:hello@dheerah.com" className="flex items-center gap-2 hover:text-[#C7042B] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#CC9E00]" /> hello@dheerah.com
            </a>
          </div>
        </div>
      </div>

      {/* Guest Invitation Bar */}
      {!user && (
        <div className="border-t border-white/10 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 py-3.5 flex flex-wrap items-center justify-center gap-2 text-center">
            <span className="text-[12px] text-[#E8D7BD]/80">Seeking personalized bridal styling?</span>
            <button
              onClick={() => navigate({ name: 'register' })}
              className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#C7042B] hover:text-[#E3AF00] transition-colors"
            >
              Join Dheerah Atelier →
            </button>
          </div>
        </div>
      )}

      {/* Bottom Legal & Value Strip */}
      <div className="border-t border-white/10 py-6 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col md:flex-row gap-4 items-center justify-between text-[11px] text-[#98917F]">
          <div className="flex flex-wrap gap-5 md:gap-8 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#CC9E00]" /> Pan-India Insured Shipping</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#CC9E00]" /> 100% Authentic Handlooms</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#CC9E00]" /> Bespoke Heritage Couture</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
            <span>
              © {new Date().getFullYear()} Dheerah Designer Boutique · All rights reserved.
              {gstinConfigured() && <> · GSTIN {BUSINESS.gstin}</>}
            </span>
            <button
              onClick={() => navigate({ name: 'admin' })}
              className="tracking-[0.16em] uppercase hover:text-[#C7042B] transition-colors font-semibold"
            >
              Atelier Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
