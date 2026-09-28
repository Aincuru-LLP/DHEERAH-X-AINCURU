import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, LayoutGrid, LayoutDashboard, User, Heart, ShoppingBag, LogOut, MapPin, ChevronUp, X, UserCircle, PackageOpen } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import type { Route } from '../types';

/**
 * Mobile sticky bottom navigation for Dheerah Designer Boutique.
 * Clean, tactile 3-tab layout: Home | Shop | Account
 * Slide-over drawer provides full access to Profile, Orders, Wishlist, Addresses, and Admin.
 */
const BottomNav: React.FC = () => {
  const { route, navigate } = useRouter();
  const { itemCount: cartCount } = useCart();
  const { ids: wishIds } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    if (accountOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [accountOpen]);

  const wishCount = wishIds.length;

  const mainTabs: {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    to: Route;
    active: boolean;
  }[] = [
    { key: 'home', label: 'Home', icon: Home, to: { name: 'home' }, active: route.name === 'home' },
    { key: 'shop', label: 'Shop', icon: LayoutGrid, to: { name: 'shop' }, active: route.name === 'shop' || route.name === 'search' },
  ];

  const isAccountActive = route.name === 'account' || route.name === 'login' || route.name === 'register';

  const closeAccount = () => setAccountOpen(false);

  const go = (to: Route) => {
    setAccountOpen(false);
    navigate(to);
  };

  return (
    <>
      {/* Full-screen Account menu — slides in from right */}
      <AnimatePresence>
        {accountOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[155] bg-black/50 lg:hidden"
              onClick={closeAccount}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 right-0 z-[160] w-full max-w-[340px] bg-[#FAF7F0] border-l border-[#E8D7BD] shadow-2xl flex flex-col lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8D7BD] bg-white">
                {user ? (
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#050505] truncate">Hello, {user.fullName.split(' ')[0]}</p>
                    <p className="text-[11px] text-[#6B6358] truncate">{user.email}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[14px] font-extrabold text-[#050505]">Dheerah Designer Boutique</p>
                    <p className="text-[11px] text-[#6B6358]">Sign in to access your atelier account</p>
                  </div>
                )}
                <button onClick={closeAccount} aria-label="Close" className="p-1.5 -mr-1 text-[#050505] hover:text-[#C7042B]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu items */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                {user ? (
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => go({ name: 'account', tab: 'profile' })}
                        className="w-full flex items-center gap-3.5 px-3 py-3 rounded text-[14px] font-semibold text-[#1C1A18] hover:bg-[#F1E6D2] transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-[#6B6358]" />
                        My Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => go({ name: 'account', tab: 'orders' })}
                        className="w-full flex items-center gap-3.5 px-3 py-3 rounded text-[14px] font-semibold text-[#1C1A18] hover:bg-[#F1E6D2] transition-colors"
                      >
                        <PackageOpen className="w-4 h-4 text-[#6B6358]" />
                        My Orders
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => go({ name: 'account', tab: 'wishlist' })}
                        className="w-full flex items-center gap-3.5 px-3 py-3 rounded text-[14px] font-semibold text-[#1C1A18] hover:bg-[#F1E6D2] transition-colors"
                      >
                        <Heart className="w-4 h-4 text-[#6B6358]" />
                        Wishlist
                        {wishCount > 0 && (
                          <span className="ml-auto text-[11px] bg-[#C7042B] text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 font-bold">
                            {wishCount > 9 ? '9+' : wishCount}
                          </span>
                        )}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => go({ name: 'account', tab: 'addresses' })}
                        className="w-full flex items-center gap-3.5 px-3 py-3 rounded text-[14px] font-semibold text-[#1C1A18] hover:bg-[#F1E6D2] transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#6B6358]" />
                        Addresses
                      </button>
                    </li>

                    {/* Admin Console */}
                    {isAdmin && (
                      <li className="pt-2 border-t border-[#E8D7BD]">
                        <button
                          onClick={() => go({ name: 'admin' })}
                          className="w-full flex items-center gap-3.5 px-3 py-3 rounded text-[14px] font-bold text-[#C7042B] hover:bg-[#F1E6D2] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Console
                        </button>
                      </li>
                    )}

                    <li className="pt-2 border-t border-[#E8D7BD]">
                      <button
                        onClick={() => { closeAccount(); logout(); navigate({ name: 'home' }); }}
                        className="w-full flex items-center gap-3.5 px-3 py-3 rounded text-[14px] font-semibold text-[#8F0320] hover:bg-[#FBE6E6] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => go({ name: 'login' })}
                        className="w-full py-3 bg-[#C7042B] text-white rounded font-bold text-[13px] uppercase tracking-wider hover:bg-[#8F0320] transition-colors"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => go({ name: 'register' })}
                        className="w-full py-3 bg-white border border-[#E8D7BD] text-[#050505] rounded font-bold text-[13px] uppercase tracking-wider hover:border-[#C7042B] transition-colors"
                      >
                        Sign up
                      </button>
                    </div>

                    <ul className="space-y-1 pt-3 border-t border-[#E8D7BD]">
                      <li>
                        <button
                          onClick={() => go({ name: 'shop' })}
                          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded text-[13px] font-semibold text-[#1C1A18] hover:bg-[#F1E6D2]"
                        >
                          <LayoutGrid className="w-4 h-4 text-[#6B6358]" />
                          Explore Catalogue
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => go({ name: 'account', tab: 'wishlist' })}
                          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded text-[13px] font-semibold text-[#1C1A18] hover:bg-[#F1E6D2]"
                        >
                          <Heart className="w-4 h-4 text-[#6B6358]" />
                          Wishlist
                          {wishCount > 0 && (
                            <span className="ml-auto text-[11px] bg-[#C7042B] text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 font-bold">
                              {wishCount > 9 ? '9+' : wishCount}
                            </span>
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main bottom nav — 3 columns: Home | Shop | Account */}
      <nav
        aria-label="Primary"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAF7F0]/95 backdrop-blur-md border-t border-[#E8D7BD] shadow-[0_-2px_12px_rgba(5,5,5,0.06)] pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-3">
          {mainTabs.map(t => {
            const Icon = t.icon;
            return (
              <li key={t.key}>
                <button
                  onClick={() => navigate(t.to)}
                  aria-current={t.active ? 'page' : undefined}
                  className={`relative w-full flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                    t.active ? 'text-[#C7042B]' : 'text-[#6B6358] hover:text-[#1C1A18]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t.label}
                  {t.active && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#CC9E00]" />
                  )}
                </button>
              </li>
            );
          })}

          {/* Account tab */}
          <li>
            <button
              onClick={() => setAccountOpen(v => !v)}
              aria-expanded={accountOpen}
              aria-haspopup="true"
              className={`relative w-full flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                isAccountActive || accountOpen ? 'text-[#C7042B]' : 'text-[#6B6358] hover:text-[#1C1A18]'
              }`}
            >
              <span className="relative">
                <User className="w-5 h-5" />
                {!user && !isAccountActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#C7042B] ring-2 ring-white" />
                )}
              </span>
              <span className="flex items-center gap-0.5">
                {user ? 'Account' : 'Sign in'}
                <ChevronUp className={`w-3 h-3 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Floating Cart FAB */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate({ name: 'cart' })}
          className="lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+76px)] right-4 z-[45] w-12 h-12 bg-[#C7042B] text-white rounded-full shadow-lg shadow-[#C7042B]/35 border border-[#CC9E00]/30 flex items-center justify-center active:scale-95 transition-transform"
          aria-label={`Shopping bag with ${cartCount} item${cartCount > 1 ? 's' : ''}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-[#050505] text-[#FAF7F0] text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-[#CC9E00]/40">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        </button>
      )}
    </>
  );
};

export default BottomNav;