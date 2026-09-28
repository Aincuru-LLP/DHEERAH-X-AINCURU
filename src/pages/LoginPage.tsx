import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import PhoneOtpForm from '../components/PhoneOtpForm';

type Mode = 'email' | 'phone';

const LoginPage: React.FC = () => {
  const { login, requestPasswordReset, user, loading } = useAuth();
  const { navigate, hrefFor } = useRouter();
  const [mode, setMode] = useState<Mode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotBlocked, setForgotBlocked] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  // Google popup + profile-hydrate is in flight (set by GoogleSignInButton).
  const [googleBusy, setGoogleBusy] = useState(false);

  // Show a full-screen loader instead of flashing the login form when: auth
  // state is still resolving on first paint, a sign-in is in flight, or we're
  // already signed in and about to be routed away.
  const authInFlight = loading || !!user || submitting || googleBusy;

  // If the user signs in via Google redirect (mobile), they bounce back to
  // this page already authed — route them to /account so they don't stare
  // at the login form.
  useEffect(() => {
    if (!loading && user) navigate({ name: 'home' });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!error) return;
    const id = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(id);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blocked) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    setBlocked(true);
    try {
      await login(email.trim(), password);
      // Admins are routed by the global AdminGuard based on the `admin` custom
      // claim; the login page must not special-case any email address.
      navigate({ name: 'home' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setError(message);
    } finally {
      setSubmitting(false);
      window.setTimeout(() => setBlocked(false), 1500);
    }
  };

  const openForgot = () => {
    setForgotEmail(email.trim());
    setForgotMsg(null);
    setForgotOpen(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (forgotBlocked) return;
    setForgotMsg(null);
    setForgotBusy(true);
    setForgotBlocked(true);
    try {
      await requestPasswordReset(forgotEmail);
      // Generic copy — never reveals whether the email is registered.
      setForgotMsg(
        `If an account exists for ${forgotEmail.trim()}, a reset link is on its way. Please also check your spam folder.`
      );
    } catch (err) {
      setForgotMsg((err as Error).message ?? 'Could not send reset link. Please try again.');
    } finally {
      setForgotBusy(false);
      window.setTimeout(() => setForgotBlocked(false), 3000);
    }
  };

  return (
    <main className="pt-[100px] md:pt-[116px] pb-16 bg-[#FAF7F0] min-h-screen">
      {authInFlight && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-[#FAF7F0]/95 backdrop-blur-sm"
        >
          <div className="w-9 h-9 border-2 border-[#C7042B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1C1A18]">
            {user ? 'Entering boutique…' : googleBusy || submitting ? 'Verifying patron credentials…' : 'Loading…'}
          </p>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[960px] mx-auto px-4 md:px-8"
      >
        <div className="text-center mb-6">
          <img src="/branding/dheerah-logo.png" alt="Dheerah Designer Boutique" className="h-11 w-auto object-contain mx-auto mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#CC9E00]">The Dheerah Circle</p>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#1C1A18] mt-1">
            Sign In to Your Patron Account
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 bg-[#FDFBF7] border border-[#E8D7BD] rounded shadow-sm overflow-hidden">
          {/* Left: Login form */}
          <section className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#E8D7BD]">
            <h2 className="text-[14px] font-bold uppercase tracking-wider mb-1 text-[#1C1A18]">
              Welcome Back
            </h2>
            <p className="text-[13px] text-[#5A554E] mb-5 leading-relaxed">
              Pick up where you left off — saved commissions, orders, and your curated boutique wishlist.
            </p>

            <div role="tablist" aria-label="Sign-in method" className="inline-flex p-1 bg-[#F1E6D2] border border-[#E8D7BD] rounded mb-5">
              {(['email', 'phone'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => { setMode(m); setError(null); }}
                  className={
                    'px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded transition-all ' +
                    (mode === m
                      ? 'bg-[#C7042B] text-white shadow-sm'
                      : 'text-[#5A554E] hover:text-[#1C1A18]')
                  }
                >
                  {m === 'email' ? 'Email' : 'Phone OTP'}
                </button>
              ))}
            </div>

            {mode === 'phone' ? (
              <div className="space-y-4">
                <PhoneOtpForm onDone={() => navigate({ name: 'home' })} verifyLabel="Verify & Sign In" />

                <div className="flex items-center gap-3 my-1">
                  <span className="flex-1 h-px bg-[#E8D7BD]" />
                  <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#78716A]">or</span>
                  <span className="flex-1 h-px bg-[#E8D7BD]" />
                </div>

                <GoogleSignInButton onDone={() => navigate({ name: 'home' })} onBusyChange={setGoogleBusy} />

                <p className="text-[11px] text-[#78716A] leading-relaxed">
                  By continuing, you agree to Dheerah Designer Boutique&apos;s{' '}
                  <span className="font-semibold text-[#1C1A18]">Terms of Service</span> and{' '}
                  <span className="font-semibold text-[#1C1A18]">Privacy Policy</span>.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="patron@dheerah.com"
                    className="input-box pl-9 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-[11px] font-bold uppercase tracking-wider text-[#5A554E]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={openForgot}
                    className="text-[11px] font-bold uppercase tracking-wider text-[#C7042B] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="input-box pl-9 pr-10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#78716A] hover:text-[#C7042B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-[13px] font-medium text-[#C7042B] bg-[#FAF7F0] border border-[#C7042B]/30 px-3.5 py-2 rounded"
                >
                  {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>

              <div className="flex items-center gap-3 my-2">
                <span className="flex-1 h-px bg-[#E8D7BD]" />
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#78716A]">or</span>
                <span className="flex-1 h-px bg-[#E8D7BD]" />
              </div>

              <GoogleSignInButton onDone={() => navigate({ name: 'home' })} onBusyChange={setGoogleBusy} />

              <p className="text-[11px] text-[#78716A] leading-relaxed">
                By continuing, you agree to Dheerah Designer Boutique&apos;s{' '}
                <span className="font-semibold text-[#1C1A18]">Terms of Service</span> and{' '}
                <span className="font-semibold text-[#1C1A18]">Privacy Policy</span>.
              </p>
            </form>
            )}
          </section>

          {/* Right: New to Dheerah */}
          <aside className="p-6 md:p-8 bg-[#FAF7F0] flex flex-col justify-between">
            <div>
              <Sparkles className="w-6 h-6 text-[#CC9E00] mb-3" />
              <h2 className="font-serif text-[22px] font-normal mb-2 text-[#1C1A18]">
                New to Dheerah?
              </h2>
              <p className="text-[13px] text-[#5A554E] mb-6 leading-relaxed">
                Become a patron of The Dheerah Circle to unlock curated drops, expedited bespoke stitching, complimentary alterations, and private viewings.
              </p>

              <ul className="space-y-3 text-[13px] text-[#1C1A18] mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#CC9E00] font-bold">✦</span>
                  Save handpicked weaves to your private wishlist
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#CC9E00] font-bold">✦</span>
                  Live tracking & direct atelier concierge chat
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#CC9E00] font-bold">✦</span>
                  Pan-India express delivery with live tracking
                </li>
              </ul>
            </div>

            <a
              href={hrefFor({ name: 'register' })}
              onClick={e => {
                e.preventDefault();
                navigate({ name: 'register' });
              }}
              className="btn-outline text-center w-full"
            >
              Create Patron Account
            </a>
          </aside>
        </div>

        <AnimatePresence>
          {forgotOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="forgot-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs"
              onClick={e => { if (e.target === e.currentTarget) setForgotOpen(false); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#FDFBF7] border border-[#E8D7BD] w-full max-w-[440px] p-6 md:p-8 rounded shadow-lg"
              >
                <h3 id="forgot-title" className="font-serif text-[20px] font-normal mb-1 text-[#1C1A18]">
                  Reset Patron Password
                </h3>
                <p className="text-[13px] text-[#5A554E] mb-5 leading-relaxed">
                  Enter your registered patron email. We will send a secure link to reset your credentials.
                </p>

                <form onSubmit={handleForgotSubmit} noValidate className="space-y-3.5">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="patron@dheerah.com"
                      className="input-box pl-9 bg-white"
                    />
                  </div>

                  {forgotMsg && (
                    <p
                      role="status"
                      className="text-[13px] font-medium text-[#1C1A18] bg-[#FAF7F0] border border-[#CC9E00]/40 px-3.5 py-2 rounded"
                    >
                      {forgotMsg}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="btn-outline flex-1"
                    >
                      Close
                    </button>
                    <button type="submit" disabled={forgotBusy} className="btn-primary flex-1">
                      {forgotBusy ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
};

export default LoginPage;
