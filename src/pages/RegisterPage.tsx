import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, Phone, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import PhoneOtpForm from '../components/PhoneOtpForm';

type Mode = 'email' | 'phone';

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,}$/;

const RegisterPage: React.FC = () => {
  const { register, user, loading } = useAuth();
  const { navigate, hrefFor } = useRouter();

  const [mode, setMode] = useState<Mode>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  // Loader instead of flashing the form while auth resolves / sign-up is in flight.
  const authInFlight = loading || !!user || submitting || googleBusy;

  useEffect(() => {
    if (!loading && user) navigate({ name: 'home' });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!submitError) return;
    const id = window.setTimeout(() => setSubmitError(null), 5000);
    return () => window.clearTimeout(id);
  }, [submitError]);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name (min 2 characters).';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.';
    if (phone.trim() && !PHONE_RE.test(phone.trim())) next.phone = 'Enter a valid phone number.';
    if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    else if (!/[A-Za-z]/.test(password) || (!/\d/.test(password) && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))) {
      next.password = 'Password must include a letter and a number or symbol.';
    }
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blocked) return;
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    setBlocked(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password
      });
      navigate({ name: 'home' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create your account.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
      window.setTimeout(() => setBlocked(false), 1500);
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
            {user ? 'Setting up your patron account…' : 'One moment…'}
          </p>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[500px] mx-auto px-4 md:px-0"
      >
        <div className="text-center mb-6">
          <img src="/branding/dheerah-logo.png" alt="Dheerah Designer Boutique" className="h-11 w-auto object-contain mx-auto mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#CC9E00]">Join The Dheerah Circle</p>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#1C1A18] mt-1">
            Create Your Patron Account
          </h1>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E8D7BD] p-6 md:p-8 rounded shadow-sm">
          <div className="flex items-start gap-3 mb-5 p-3.5 bg-[#FAF7F0] border border-[#E8D7BD] rounded">
            <Sparkles className="w-5 h-5 text-[#CC9E00] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[#5A554E] leading-relaxed">
              Curate couture pieces to your private wishlist, track bespoke commissions, and enjoy exclusive privileges reserved for our patrons.
            </p>
          </div>

          <div role="tablist" aria-label="Sign-up method" className="inline-flex p-1 bg-[#F1E6D2] border border-[#E8D7BD] rounded mb-5 w-full">
            {(['email', 'phone'] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => { setMode(m); setSubmitError(null); }}
                className={
                  'flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded transition-all ' +
                  (mode === m
                    ? 'bg-[#C7042B] text-white shadow-sm'
                    : 'text-[#5A554E] hover:text-[#1C1A18]')
                }
              >
                {m === 'email' ? 'Email Registration' : 'Phone OTP'}
              </button>
            ))}
          </div>

          {mode === 'phone' ? (
            <div className="space-y-4">
              <p className="text-[12px] text-[#5A554E] leading-relaxed">
                Verify your mobile number to register instantly — no password required.
              </p>
              <PhoneOtpForm onDone={() => navigate({ name: 'home' })} verifyLabel="Verify & Create Patron Account" />

              <div className="flex items-center gap-3 my-2">
                <span className="flex-1 h-px bg-[#E8D7BD]" />
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#78716A]">or</span>
                <span className="flex-1 h-px bg-[#E8D7BD]" />
              </div>

              <GoogleSignInButton onDone={() => navigate({ name: 'home' })} label="Sign up with Google" onBusyChange={setGoogleBusy} />
            </div>
          ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                <input
                  id="register-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Aanya Sharma"
                  className="input-box pl-9 bg-white"
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-[#C7042B] mt-1 font-medium">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="patron@dheerah.com"
                  className="input-box pl-9 bg-white"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-[#C7042B] mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-phone"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
              >
                Phone Number <span className="text-[#78716A] font-normal normal-case">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-box pl-9 bg-white"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-[#C7042B] mt-1 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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
              {errors.password && (
                <p className="text-[11px] text-[#C7042B] mt-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-confirm"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716A] pointer-events-none" />
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="input-box pl-9 pr-10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#78716A] hover:text-[#C7042B]"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-[#C7042B] mt-1 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {submitError && (
              <p
                role="alert"
                className="text-[13px] font-medium text-[#C7042B] bg-[#FAF7F0] border border-[#C7042B]/30 px-3.5 py-2 rounded"
              >
                {submitError}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating account…' : 'Create Patron Account'}
            </button>

            <div className="flex items-center gap-3 my-2">
              <span className="flex-1 h-px bg-[#E8D7BD]" />
              <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#78716A]">or</span>
              <span className="flex-1 h-px bg-[#E8D7BD]" />
            </div>

            <GoogleSignInButton onDone={() => navigate({ name: 'home' })} label="Sign up with Google" onBusyChange={setGoogleBusy} />

            <p className="text-[11px] text-[#78716A] leading-relaxed text-center">
              By creating an account, you agree to Dheerah Designer Boutique&apos;s{' '}
              <span className="font-semibold text-[#1C1A18]">Terms of Service</span> and{' '}
              <span className="font-semibold text-[#1C1A18]">Privacy Policy</span>.
            </p>
          </form>
          )}

          <hr className="my-5 border-[#E8D7BD]" />

          <p className="text-[13px] text-center text-[#5A554E]">
            Already have a patron account?{' '}
            <a
              href={hrefFor({ name: 'login' })}
              onClick={e => {
                e.preventDefault();
                navigate({ name: 'login' });
              }}
              className="font-bold text-[#C7042B] hover:underline"
            >
              Sign In
            </a>
          </p>
        </div>
      </motion.div>
    </main>
  );
};

export default RegisterPage;
