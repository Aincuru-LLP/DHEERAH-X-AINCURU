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
        { label: 'Our Store', to: () => navigate({ name: 'our-store' }) },
        { label: 'Terms of Service', to: () => navigate(POLICY_ROUTES['Terms of Service']) },
        { label: 'Privacy Policy', to: () => navigate(POLICY_ROUTES['Privacy Policy']) },
      ]
    }
  ];

  return (
    <footer className="relative bg-[#050505] text-[#FAF7F0] border-t border-[#CC9E00]/30 overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(204, 158, 0, 0.07) 0%, transparent 65%), radial-gradient(circle at 85% 100%, rgba(199, 4, 43, 0.05) 0%, transparent 55%)',
        }}
        aria-hidden="true"
      />

      {/* Top delicate gold hairline highlight */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#CC9E00]/50 to-transparent relative z-10" />

      {/* Brand anchor header */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 md:pt-14 pb-8 sm:pb-10 flex flex-col items-center text-center">
        <div className="inline-block bg-[#FAF7F0] px-8 sm:px-10 py-3.5 sm:py-4 rounded-sm border border-[#CC9E00]/40 mb-4 sm:mb-5 shadow-[0_8px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/10 hover:border-[#CC9E00]/70 hover:shadow-[0_12px_36px_rgba(204,158,0,0.18)] transition-all duration-300">
          <img
            src="/branding/dheerah-logo.png"
            alt="Dheerah Designer Boutique"
            className="h-10 sm:h-11 md:h-12 w-auto object-contain select-none"
            draggable={false}
            loading="lazy"
          />
        </div>
        <p className="font-serif italic text-[14px] sm:text-[15px] md:text-[16px] text-[#E8D7BD] max-w-xl font-normal tracking-[0.03em] leading-relaxed">
          Heritage Indian Designer Wear · Hand-woven Craftsmanship & Bespoke Couture
        </p>
      </div>

      {/* Decorative hairline with center diamond ornament */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 my-1">
        <div className="relative flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#CC9E00]/30 to-transparent" />
          <span className="absolute w-2 h-2 rotate-45 border border-[#CC9E00]/60 bg-[#050505]" />
        </div>
      </div>

      {/* Main navigation columns */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
        {cols.map(col => (
          <div key={col.title}>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#CC9E00] mb-5 flex items-center gap-2 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7042B] ring-2 ring-[#CC9E00]/30 shrink-0" />
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map(l => (
                <li key={l.label}>
                  <button
                    onClick={l.to}
                    className="group flex items-center gap-1.5 text-[13px] text-[#E8D7BD]/80 hover:text-[#FAF7F0] transition-all duration-200 text-left font-light tracking-wide focus:outline-hidden"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#C7042B] opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {l.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Concierge column */}
        <div className="col-span-2 sm:col-span-1 md:col-span-1">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#CC9E00] mb-5 flex items-center gap-2 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7042B] ring-2 ring-[#CC9E00]/30 shrink-0" />
            Atelier Concierge
          </h4>
          <div className="bg-white/[0.02] border border-[#CC9E00]/25 rounded-sm p-4 sm:p-5 backdrop-blur-xs hover:border-[#CC9E00]/50 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col sm:flex-col gap-3.5">
            <a
              href="tel:+916304211922"
              className="group flex items-center gap-3 text-[13px] text-[#E8D7BD]/90 hover:text-white transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-[#CC9E00]/10 border border-[#CC9E00]/30 flex items-center justify-center text-[#CC9E00] group-hover:bg-[#C7042B] group-hover:text-white group-hover:border-[#C7042B] transition-colors shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </span>
              <span className="font-light tracking-wide group-hover:translate-x-0.5 transition-transform duration-200">
                +91 63042 11922
              </span>
            </a>
            <a
              href="mailto:hello@dheerah.com"
              className="group flex items-center gap-3 text-[13px] text-[#E8D7BD]/90 hover:text-white transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-[#CC9E00]/10 border border-[#CC9E00]/30 flex items-center justify-center text-[#CC9E00] group-hover:bg-[#C7042B] group-hover:text-white group-hover:border-[#C7042B] transition-colors shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <span className="font-light tracking-wide group-hover:translate-x-0.5 transition-transform duration-200">
                hello@dheerah.com
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Guest Invitation Bar */}
      {!user && (
        <div className="relative z-10 border-y border-[#CC9E00]/20 bg-gradient-to-r from-[#050505] via-[#141210] to-[#050505] py-4">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-center">
            <span className="inline-flex items-center gap-2 text-[13px] text-[#E8D7BD]/90 font-light tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#CC9E00]" />
              Seeking personalized bridal styling?
            </span>
            <button
              onClick={() => navigate({ name: 'register' })}
              className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#C7042B] hover:text-[#E3AF00] transition-colors group inline-flex items-center gap-1 focus:outline-hidden"
            >
              <span>Join Dheerah Atelier</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Legal & Value Strip */}
      <div className="relative z-10 border-t border-white/[0.08] py-6 sm:py-7 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col md:flex-row gap-5 items-center justify-between text-[11px] sm:text-[12px] text-[#98917F]">
          <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 justify-center md:justify-start">
            <span className="inline-flex items-center gap-2 text-[#CBC4BE] font-normal">
              <span className="w-6 h-6 rounded-full bg-[#CC9E00]/10 border border-[#CC9E00]/25 flex items-center justify-center text-[#CC9E00] shrink-0">
                <Truck className="w-3 h-3" />
              </span>
              Pan-India Insured Shipping
            </span>
            <span className="inline-flex items-center gap-2 text-[#CBC4BE] font-normal">
              <span className="w-6 h-6 rounded-full bg-[#CC9E00]/10 border border-[#CC9E00]/25 flex items-center justify-center text-[#CC9E00] shrink-0">
                <ShieldCheck className="w-3 h-3" />
              </span>
              100% Authentic Handlooms
            </span>
            <span className="inline-flex items-center gap-2 text-[#CBC4BE] font-normal">
              <span className="w-6 h-6 rounded-full bg-[#CC9E00]/10 border border-[#CC9E00]/25 flex items-center justify-center text-[#CC9E00] shrink-0">
                <Sparkles className="w-3 h-3" />
              </span>
              Bespoke Heritage Couture
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
            <span className="font-light tracking-wide text-center sm:text-left">
              © {new Date().getFullYear()} Dheerah Designer Boutique · All rights reserved.
              {gstinConfigured() && <> · GSTIN {BUSINESS.gstin}</>}
            </span>
            <button
              onClick={() => navigate({ name: 'admin' })}
              className="tracking-[0.16em] uppercase text-[#98917F] hover:text-[#C7042B] transition-colors font-semibold py-1 px-2.5 rounded-xs border border-white/5 hover:border-[#C7042B]/40 focus:outline-hidden"
            >
              Atelier Admin
            </button>
          </div>
        </div>
      </div>

      {/* Creative Signature Strip — Designed by AINCURU */}
      <div className="border-t border-white/[0.08] bg-[#030303] py-4 md:py-5 px-4 relative overflow-hidden">
        {/* Subtle ambient terracotta glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(224, 92, 43, 0.08) 0%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 relative z-10 text-center sm:text-left">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E05C2B] animate-pulse" />
            <span className="text-[11px] tracking-[0.18em] uppercase text-[#78716A] font-medium">
              Digital Atelier Experience
            </span>
          </div>

          <a
            href="https://aincuru.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 hover:border-[#E05C2B]/60 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_24px_rgba(224,92,43,0.22)] no-tap-highlight"
            title="AINCURU — Context Creates Intelligence"
            aria-label="Designed by AINCURU (opens in a new tab)"
          >
            <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A8A29E] group-hover:text-[#FAF7F0] transition-colors">
              Designed by
            </span>
            <div className="h-4 w-px bg-white/15 group-hover:bg-[#E05C2B]/50 transition-colors" />
            <img
              src="/branding/aincuru-logo-light.png"
              alt="AINCURU"
              className="h-6 sm:h-6.5 md:h-7.5 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <span className="text-[10px] tracking-[0.12em] text-[#CC9E00]/70 group-hover:text-[#E05C2B] font-mono transition-colors">
              ↗
            </span>
          </a>

          <div className="flex items-center gap-2">
            <span className="text-[10.5px] tracking-[0.14em] text-[#78716A] font-light">
              Context Creates Intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
