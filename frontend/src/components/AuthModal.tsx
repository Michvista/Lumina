import { useState } from 'react';
import { X, Mail, Lock, Loader2, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
  loginFn: (email: string, pass: string) => Promise<void>;
  signupFn: (email: string, pass: string) => Promise<void>;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  loginFn,
  signupFn,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await loginFn(email, password);
      } else {
        await signupFn(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(42, 26, 36, 0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-[#FDFBFA] border border-[#F4DFD7] rounded-3xl p-8 shadow-2xl animate-scale-up space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-[#5D3754]/60 hover:bg-[#F4DFD7] hover:text-[#5D3754] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#5D3754] flex items-center justify-center text-[#FAF6F2] mx-auto shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-[#5D3754]/80 max-w-xs mx-auto leading-relaxed">
            {mode === 'login'
              ? 'Log in to access your full lab decoder history across all your devices.'
              : 'Save your report history and health trends securely in the cloud.'}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-[#FAF6F2] border border-[#F4DFD7] rounded-full p-1 gap-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 text-xs font-semibold py-2 rounded-full transition-all duration-200 ${
              mode === 'login'
                ? 'bg-[#5D3754] text-[#FAF6F2] shadow-sm'
                : 'text-[#5D3754]/70 hover:text-[#5D3754]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 text-xs font-semibold py-2 rounded-full transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-[#5D3754] text-[#FAF6F2] shadow-sm'
                : 'text-[#5D3754]/70 hover:text-[#5D3754]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-[#5D3754]/85" htmlFor="auth-email">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5D3754]/50 pointer-events-none" />
              <input
                id="auth-email"
                type="email"
                className="w-full bg-[#FAF6F2] border border-[#F4DFD7] rounded-xl pl-10 pr-4 py-3 text-sm text-[#5D3754] placeholder:text-[#5D3754]/40 focus:outline-none focus:ring-1 focus:ring-[#5D3754] transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-[#5D3754]/85" htmlFor="auth-password">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5D3754]/50 pointer-events-none" />
              <input
                id="auth-password"
                type="password"
                className="w-full bg-[#FAF6F2] border border-[#F4DFD7] rounded-xl pl-10 pr-4 py-3 text-sm text-[#5D3754] placeholder:text-[#5D3754]/40 focus:outline-none focus:ring-1 focus:ring-[#5D3754] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#5D3754] hover:bg-[#4C2C44] disabled:opacity-50 text-[#FAF6F2] font-semibold text-sm py-3.5 rounded-full shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} />
                Log In
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
