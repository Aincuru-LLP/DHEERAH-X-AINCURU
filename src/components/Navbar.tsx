import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PackageOpen,
  Search,
  ShoppingBag,
  User,
  UserCircle,
  UserPlus,
  X,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useCatalog } from '../context/CatalogContext';
import { OFFER_TICKER } from '../constants';
import { masterCategoriesFor, subcategoriesFor } from '../lib/subcategories';
import { sellableFirst } from '../lib/availability';
import type { MasterCategory } from '../types';

import { VISIBLE_PRODUCT_CATEGORIES, BusinessCategoryConfig, matchesBusinessCategory } from '../config/productCategories';

type NavEntry = {
  kind: 'business';
  key: string;
  label: string;
  config: BusinessCategoryConfig;
  tone?: 'default' | 'premium';
};

const navFor = (): NavEntry[] => {
  return VISIBLE_PRODUCT_CATEGORIES.map(c => ({
    kind: 'business',
    key: c.key,
    label: c.label,
    config: c,
    tone: c.key === 'raw-silk' ? 'premium' : 'default',
  }));
};

const Navbar: React.FC = () => {
  const { navigate, route } = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { ids: wishIds } = useWishlist();

  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    if (!mobileOpen) setMobileExpanded(null);
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [accountOpen]);

  const { products: catalogProducts } = useCatalog();
  const searchPool = catalogProducts;
  const NAV = useMemo(() => navFor(), []);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const hits = searchPool.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.masterCategory.toLowerCase().includes(q) ||
      (f.tags ?? []).some(t => t.toLowerCase().includes(q))
    );
    return sellableFirst(hits).slice(0, 6);
  }, [search, searchPool]);

  const activeCat = route.name === 'shop' ? route.category : undefined;

  const goShop = (category?: string, subCategory?: string) => {
    setMobileOpen(false);
    setMobileExpanded(null);
    setSearch('');
    setSearchFocus(false);
    setHoverCat(null);
    navigate({ name: 'shop', category, subCategory });
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (suggestions[0]) {
      navigate({ name: 'product', id: suggestions[0].id });
    } else if (q) {
      navigate({ name: 'search', q });
    }
    setSearch('');
    setSearchFocus(false);
    setSearchOpen(false);
  };

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [searchOpen]);

  const megaPanel = (entry: NavEntry) => {
    const items = searchPool.filter(f => matchesBusinessCategory(f, entry.key)).slice(0, 4);
    return (
      <div
        className="fixed top-[64px] md:top-[76px] left-1/2 -translate-x-1/2 w-[840px] max-w-[calc(100vw-32px)] bg-white border-t-2 border-[#C7042B] border-x border-b border-[#E8D7BD] shadow-2xl pt-6 pb-7 px-8 grid grid-cols-[240px_1fr] gap-8 z-[60] rounded-b-md"
        onMouseEnter={() => setHoverCat(entry.key)}
        onMouseLeave={() => setHoverCat(null)}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#C7042B] mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CC9E00]" />
            {entry.label}
          </p>
          <p className="text-[12px] text-[#6B6358] mb-4 font-light leading-relaxed">
            {entry.config.tagline}
          </p>
          <button
            onClick={() => goShop(entry.key)}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#C7042B] hover:text-[#8F0320] transition-colors"
          >
            Shop All {entry.label} →
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3.5">
          {items.length > 0 ? (
            items.map(f => (
              <button
                key={f.id}
                onClick={() => { navigate({ name: 'product', id: f.id }); setHoverCat(null); }}
                className="text-left group"
              >
                <div className="aspect-[3/4] bg-[#F1E6D2] overflow-hidden mb-2 rounded-sm border border-[#E8D7BD]/60 group-hover:border-[#CC9E00] transition-colors">
                  <img
                    src={f.photo}
                    alt={f.name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = f.image; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#050505] truncate">{f.brand}</p>
                <p className="text-[12px] text-[#6B6358] truncate">{f.name.split(' ').slice(0, 3).join(' ')}</p>
              </button>
            ))
          ) : (
            <button
              onClick={() => goShop(entry.key)}
              className="col-span-4 aspect-[16/6] bg-[#F1E6D2]/60 border border-dashed border-[#CC9E00] rounded-sm flex flex-col items-center justify-center gap-1.5 text-center px-4 group hover:bg-white transition-colors"
            >
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#C7042B]">Curated edit</span>
              <span className="text-[13px] font-semibold text-[#050505] group-hover:text-[#C7042B]">Explore the {entry.label} collection →</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const searchOverlay = (
    <AnimatePresence>
      {searchOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="lg:hidden fixed inset-0 z-[210] bg-white flex flex-col">
          <form onSubmit={onSearchSubmit} className="flex items-center gap-2 px-3 py-3 border-b border-[#E8D7BD] bg-white">
            <button type="button" onClick={() => { setSearchOpen(false); setSearch(''); }} aria-label="Close search" className="p-2 -ml-1 text-[#050505]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98917F] pointer-events-none" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sarees, lehengas, fabrics…"
                className="input-search"
                aria-label="Search catalogue"
                enterKeyHint="search"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#98917F]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {suggestions.length > 0 ? (
              <ul className="divide-y divide-[#E8D7BD]/60">
                {suggestions.map(f => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => { navigate({ name: 'product', id: f.id }); setSearch(''); setSearchOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-[#F1E6D2] rounded"
                    >
                      <img
                        src={f.photo}
                        alt=""
                        onError={e => { (e.currentTarget as HTMLImageElement).src = f.image; }}
                        className="w-12 h-14 object-cover bg-[#F1E6D2] rounded-sm"
                      />
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold uppercase tracking-wider text-[#050505] truncate">{f.brand}</p>
                        <p className="text-[13px] text-[#6B6358] truncate">{f.name}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : search.trim() ? (
              <button
                type="button"
                onClick={() => { navigate({ name: 'search', q: search.trim() }); setSearch(''); setSearchOpen(false); }}
                className="w-full text-left px-4 py-3 text-[13px] font-bold text-[#C7042B]"
              >
                Search for "{search.trim()}" →
              </button>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const mobileDrawer = (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-white flex flex-col max-w-[360px] w-full border-r border-[#E8D7BD] shadow-2xl"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8D7BD] bg-white">
            <button onClick={() => { setMobileOpen(false); navigate({ name: 'home' }); }} className="flex items-center" aria-label="Dheerah Designer Boutique — Home">
              <img src="/branding/dheerah-logo.png" alt="Dheerah Designer Boutique" className="h-8 w-auto object-contain" draggable={false} />
            </button>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1.5 text-[#050505] hover:text-[#C7042B]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {user ? (
            <div className="px-5 py-3.5 border-b border-[#E8D7BD] flex items-center justify-between gap-3 bg-[#F1E6D2]">
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-[#050505] truncate">Hello, {user.fullName.split(' ')[0]}</p>
                <p className="text-[11px] text-[#6B6358] truncate">{user.email}</p>
              </div>
              <button
                onClick={() => { setMobileOpen(false); logout(); navigate({ name: 'home' }); }}
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#C7042B] flex items-center gap-1 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <div className="px-5 py-3.5 border-b border-[#E8D7BD] grid grid-cols-2 gap-2.5 bg-white">
              <button
                onClick={() => { setMobileOpen(false); navigate({ name: 'login' }); }}
                className="flex items-center justify-center gap-1.5 bg-[#C7042B] text-white text-[12px] font-bold uppercase tracking-[0.08em] py-2.5 rounded hover:bg-[#8F0320]"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in
              </button>
              <button
                onClick={() => { setMobileOpen(false); navigate({ name: 'register' }); }}
                className="flex items-center justify-center gap-1.5 bg-white border border-[#E8D7BD] text-[#050505] text-[12px] font-bold uppercase tracking-[0.08em] py-2.5 rounded hover:border-[#C7042B]"
              >
                <UserPlus className="w-3.5 h-3.5" /> Sign up
              </button>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1" aria-label="Mobile primary navigation">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#CC9E00] px-3 py-1">Collections</p>
            {NAV.map(n => (
              <div key={n.key} className="border-b border-[#E8D7BD]/40 last:border-b-0">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goShop(n.key)}
                    className="text-[13px] font-bold tracking-wide uppercase py-3 px-3 text-[#050505] hover:text-[#C7042B] transition-colors w-full text-left"
                  >
                    {n.label}
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-[#E8D7BD]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#CC9E00] px-3 py-1">Client Services</p>
              <button onClick={() => { setMobileOpen(false); navigate({ name: 'account', tab: 'orders' }); }} className="w-full text-left text-[13px] font-semibold py-2.5 px-3 text-[#1C1A18] hover:text-[#C7042B] flex items-center gap-2">
                <PackageOpen className="w-4 h-4 text-[#6B6358]" /> Track Orders
              </button>
              <button onClick={() => { setMobileOpen(false); navigate({ name: 'account', tab: 'wishlist' }); }} className="w-full text-left text-[13px] font-semibold py-2.5 px-3 text-[#1C1A18] hover:text-[#C7042B] flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#6B6358]" /> My Wishlist
              </button>
              {isAdmin && (
                <button onClick={() => { setMobileOpen(false); navigate({ name: 'admin' }); }} className="w-full text-left text-[13px] font-bold py-2.5 px-3 text-[#C7042B] flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Admin Console
                </button>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white box-border overflow-x-hidden">


        {/* Main navigation tier */}
        <div
          className={`w-full transition-all duration-300 ${scrolled
              ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(5,5,5,0.06)] border-b border-[#E8D7BD]'
              : 'bg-white border-b border-[#E8D7BD]/70'
            }`}
        >
          <div
            className={`max-w-[1440px] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 flex items-center justify-between md:justify-start gap-1 xs:gap-1.5 sm:gap-3 md:gap-4 transition-all duration-300 w-full min-w-0 box-border ${
              scrolled ? 'h-14 sm:h-15 md:h-18' : 'h-16 sm:h-18 md:h-22'
            }`}
          >
            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden p-1.5 xs:p-2 -ml-0.5 sm:-ml-1 text-[#050505] hover:text-[#C7042B] shrink-0 flex items-center justify-center rounded-sm touch-manipulation focus:outline-hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            </button>

            {/* Brand Logo */}
            <button
              onClick={() => navigate({ name: 'home' })}
              className="flex items-center min-w-0 shrink md:shrink-0 no-tap-highlight hover:opacity-90 transition-opacity justify-start overflow-hidden py-1"
              aria-label="Dheerah Designer Boutique — Home"
            >
              <img
                src="/branding/dheerah-logo.png"
                alt="Dheerah Designer Boutique"
                className={`w-auto select-none object-contain transition-all duration-300 max-h-full max-w-[114px] min-[360px]:max-w-[128px] min-[390px]:max-w-[150px] sm:max-w-[180px] md:max-w-none ${
                  scrolled
                    ? 'h-6 min-[360px]:h-6.5 min-[390px]:h-7.5 sm:h-9 md:h-10'
                    : 'h-6.5 min-[360px]:h-7.5 min-[390px]:h-8.5 sm:h-10 md:h-12'
                }`}
                loading="eager"
                draggable={false}
              />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-stretch gap-1 xl:gap-2 h-full min-w-0 flex-shrink ml-4" aria-label="Primary">
              {NAV.map(n => {
                const isActive = activeCat === n.key || activeCat === n.label;
                const onClick = () => goShop(n.key);
                const isPremium = n.tone === 'premium';
                return (
                  <div
                    key={n.key}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setHoverCat(n.key)}
                    onMouseLeave={() => setHoverCat(null)}
                  >
                    <button
                      onClick={onClick}
                      aria-haspopup="true"
                      aria-expanded={hoverCat === n.key}
                      className={`h-full px-2.5 xl:px-3 flex items-center gap-1.5 whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.08em] transition-colors no-tap-highlight border-b-2 ${isActive
                          ? 'border-[#C7042B] text-[#C7042B]'
                          : 'border-transparent text-[#1C1A18] hover:text-[#C7042B]'
                        }`}
                    >
                      {isPremium && <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-[#CC9E00]" />}
                      {n.label}
                    </button>
                    {hoverCat === n.key && megaPanel(n)}
                  </div>
                );
              })}
            </nav>

            {/* Desktop Center/Right Search Bar */}
            <form onSubmit={onSearchSubmit} className="hidden md:flex flex-1 justify-center max-w-md mx-auto relative">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98917F] pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 160)}
                  placeholder="Search sarees, lehengas, fabrics…"
                  className="input-search w-full"
                  aria-label="Search catalogue"
                />
                <AnimatePresence>
                  {searchFocus && suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8D7BD] shadow-2xl rounded-md z-30 max-h-[340px] overflow-y-auto"
                    >
                      {suggestions.map(f => (
                        <li key={f.id}>
                          <button
                            type="button"
                            onMouseDown={() => { navigate({ name: 'product', id: f.id }); setSearch(''); }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F1E6D2]/60 text-left transition-colors"
                          >
                            <img src={f.photo} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).src = f.image; }} className="w-10 h-11 object-cover rounded-sm" />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#050505] truncate">{f.brand}</p>
                              <p className="text-[12px] text-[#6B6358] truncate">{f.name}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Right Action Icons */}
            <div className="flex items-center shrink-0 ml-auto gap-0.5 xs:gap-1 sm:gap-2">
              <button
                className="md:hidden p-1.5 xs:p-2 sm:p-2.5 text-[#050505] hover:text-[#C7042B] shrink-0 flex items-center justify-center rounded-sm touch-manipulation min-w-[34px] min-h-[34px] xs:min-w-[36px] xs:min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-5 h-5 shrink-0" />
              </button>

              <div className="flex items-center gap-0.5 xs:gap-1">
                {/* Wishlist */}
                <button
                  onClick={() => navigate({ name: 'account', tab: 'wishlist' })}
                  className="relative p-1.5 xs:p-2 sm:p-2.5 text-[#1C1A18] hover:text-[#C7042B] transition-colors shrink-0 flex items-center justify-center rounded-sm touch-manipulation min-w-[34px] min-h-[34px] xs:min-w-[36px] xs:min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {wishIds.length > 0 && (
                      <motion.span
                        key={wishIds.length}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[#C7042B] text-white text-[8px] sm:text-[9px] font-bold rounded-full min-w-[15px] h-[15px] sm:min-w-[16px] sm:h-[16px] flex items-center justify-center px-0.5 sm:px-1 shadow-xs"
                      >
                        {wishIds.length > 9 ? '9+' : wishIds.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* Bag */}
                <button
                  onClick={() => navigate({ name: 'cart' })}
                  className="relative p-1.5 xs:p-2 sm:p-2.5 text-[#1C1A18] hover:text-[#C7042B] transition-colors shrink-0 flex items-center justify-center rounded-sm touch-manipulation min-w-[34px] min-h-[34px] xs:min-w-[36px] xs:min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
                  aria-label={`Shopping bag with ${cartCount} item${cartCount > 1 ? 's' : ''}`}
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[#C7042B] text-white text-[8px] sm:text-[9px] font-bold rounded-full min-w-[15px] h-[15px] sm:min-w-[16px] sm:h-[16px] flex items-center justify-center px-0.5 sm:px-1 shadow-xs"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* Account Menu / Profile */}
                <div ref={accountRef} className="relative shrink-0">
                  <button
                    onClick={() => setAccountOpen(v => !v)}
                    aria-haspopup="true"
                    aria-expanded={accountOpen}
                    className="p-1.5 xs:p-2 sm:p-2.5 text-[#1C1A18] hover:text-[#C7042B] transition-colors shrink-0 flex items-center justify-center rounded-sm touch-manipulation min-w-[34px] min-h-[34px] xs:min-w-[36px] xs:min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
                    aria-label={user ? 'Account menu' : 'Sign in'}
                  >
                    <User className={`w-5 h-5 shrink-0 ${accountOpen ? 'text-[#C7042B]' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-16px)] bg-white border border-[#E8D7BD] shadow-2xl rounded-md py-2 z-[60]"
                      >
                        {user ? (
                          <>
                            <div className="px-4 py-3 border-b border-[#E8D7BD] mb-1 bg-white">
                              <p className="text-[13px] font-extrabold text-[#050505] truncate">Hello, {user.fullName.split(' ')[0]}</p>
                              <p className="text-[11px] text-[#6B6358] truncate">{user.email}</p>
                            </div>
                            <button onClick={() => { setAccountOpen(false); navigate({ name: 'account', tab: 'profile' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#1C1A18] hover:bg-[#F1E6D2] text-left transition-colors">
                              <UserCircle className="w-4 h-4 text-[#6B6358]" /> My Profile
                            </button>
                            <button onClick={() => { setAccountOpen(false); navigate({ name: 'account', tab: 'orders' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#1C1A18] hover:bg-[#F1E6D2] text-left transition-colors">
                              <PackageOpen className="w-4 h-4 text-[#6B6358]" /> My Orders
                            </button>
                            <button onClick={() => { setAccountOpen(false); navigate({ name: 'account', tab: 'wishlist' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#1C1A18] hover:bg-[#F1E6D2] text-left transition-colors">
                              <Heart className="w-4 h-4 text-[#6B6358]" /> Wishlist
                            </button>
                            {isAdmin && (
                              <button onClick={() => { setAccountOpen(false); navigate({ name: 'admin' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-[#C7042B] hover:bg-[#F1E6D2] text-left transition-colors">
                                <LayoutDashboard className="w-4 h-4" /> Admin Console
                              </button>
                            )}
                            <div className="border-t border-[#E8D7BD] mt-1 pt-1">
                              <button onClick={() => { setAccountOpen(false); logout(); navigate({ name: 'home' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-[#8F0320] hover:bg-[#FBE6E6] text-left transition-colors">
                                <LogOut className="w-4 h-4" /> Sign out
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="px-4 py-3 border-b border-[#E8D7BD] mb-1 bg-white">
                              <p className="text-[13px] font-extrabold text-[#050505]">Dheerah Atelier</p>
                              <p className="text-[11px] text-[#6B6358]">Sign in to access your bag & orders</p>
                            </div>
                            <button onClick={() => { setAccountOpen(false); navigate({ name: 'login' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#1C1A18] hover:bg-[#F1E6D2] text-left transition-colors">
                              <LogIn className="w-4 h-4 text-[#6B6358]" /> Sign In
                            </button>
                            <button onClick={() => { setAccountOpen(false); navigate({ name: 'register' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#1C1A18] hover:bg-[#F1E6D2] text-left transition-colors">
                              <UserPlus className="w-4 h-4 text-[#6B6358]" /> Create Account
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {typeof document !== 'undefined' && createPortal(mobileDrawer, document.body)}
      {typeof document !== 'undefined' && createPortal(searchOverlay, document.body)}
    </>
  );
};

export default Navbar;