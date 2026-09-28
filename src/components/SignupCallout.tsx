import React, { useState } from 'react';
import { X, Sparkles, Heart, ShoppingBag, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';

// Dismissal is sessionStorage-scoped (not localStorage) so members who ignore
// the banner today still see it on their next visit — we don't want to lose
// a guest forever from one off-handed close.
const DISMISS_KEY = 'dheerah.signupCallout.dismissed';

const Bullet: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <li className="flex items-start gap-2.5">
    <span
      aria-hidden
      className="mt-0.5 w-7 h-7 rounded-sm bg-white border border-[color:var(--dheerah-beige-soft)] flex items-center justify-center text-[color:var(--dheerah-gold)] shrink-0 shadow-2xs"
    >
      {icon}
    </span>
    <span className="text-[13px] md:text-[14px] text-[color:var(--dheerah-charcoal)] leading-snug">
      {text}
    </span>
  </li>
);

const SignupCallout: React.FC = () => {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  const initiallyDismissed = (() => {
    try {
      return typeof window !== 'undefined' && window.sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  })();

  const [dismissed, setDismissed] = useState(initiallyDismissed);

  // Wait for auth to resolve before showing — otherwise returning members see
  // the "Become a member" callout flash on every reload until auth settles.
  if (loading || user || dismissed) return null;

  const dismiss = () => {
    try { window.sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* private mode */ }
    setDismissed(true);
  };

  return (
    <section
      aria-labelledby="signup-callout-title"
      className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 py-6 md:py-8"
    >
      <div className="relative overflow-hidden rounded-sm border border-[color:var(--dheerah-beige-soft)] bg-gradient-to-br from-[#FAF7F0] via-[#FAF7F0] to-[#F1E6D2] px-5 py-6 md:px-10 md:py-8 shadow-sm">
        <button
          onClick={dismiss}
          aria-label="Dismiss member invitation"
          className="absolute top-3 right-3 w-8 h-8 rounded-sm flex items-center justify-center text-[color:var(--dheerah-charcoal-muted)] hover:text-[color:var(--dheerah-charcoal)] hover:bg-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-10 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--dheerah-gold)] mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> The Dheerah Circle
            </p>
            <h2
              id="signup-callout-title"
              className="font-serif text-[26px] md:text-[34px] leading-tight text-[color:var(--dheerah-charcoal)] mb-3"
            >
              Become a member of Dheerah
            </h2>
            <p className="text-[13px] md:text-[15px] text-[color:var(--dheerah-charcoal-muted)] max-w-md mb-5 font-light leading-relaxed">
              An invitation into bespoke handcrafted bridal previews, private atelier trunk shows, and
              complimentary insured delivery across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate({ name: 'register' })}
                className="btn-primary"
              >
                Create your atelier account
              </button>
              <button
                onClick={() => navigate({ name: 'login' })}
                className="btn-ghost text-left sm:self-center"
              >
                Already a member? Sign in →
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Bullet icon={<Heart className="w-3.5 h-3.5" />} text="Saved wishlist across all your devices" />
            <Bullet icon={<ShoppingBag className="w-3.5 h-3.5" />} text="Expedited checkout with concierge notes" />
            <Bullet icon={<Crown className="w-3.5 h-3.5" />} text="Private designer previews & bridal edits" />
            <Bullet icon={<Sparkles className="w-3.5 h-3.5" />} text="Bespoke member drops & limited releases" />
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SignupCallout;
