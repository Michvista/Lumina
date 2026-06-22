import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, LogOut, User, Menu, X } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { pathname } = useLocation();
  const { email, login, signup, logout } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/upload', label: 'Decode Report' },
    { to: '/history', label: 'My History' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FAF6F2]/90 backdrop-blur-md border-b border-[#F4DFD7]/60 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-[#5D3754] group shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#5D3754] flex items-center justify-center text-[#FAF6F2] transition-transform duration-300 group-hover:scale-105">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </div>
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight">Lumina</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ to, label }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`font-sans text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'text-[#5D3754] border-b-2 border-[#5D3754] pb-1'
                      : 'text-[#5D3754]/70 hover:text-[#5D3754]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <a href="/#how-it-works" className="font-sans text-sm font-medium tracking-wide text-[#5D3754]/70 hover:text-[#5D3754] transition-colors duration-200">How It Works</a>
            <a href="/#pricing" className="font-sans text-sm font-medium tracking-wide text-[#5D3754]/70 hover:text-[#5D3754] transition-colors duration-200">Pricing</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {email ? (
              <div className="flex items-center gap-3 bg-[#FDFBFA] border border-[#F4DFD7] rounded-full pl-3 pr-1 py-1 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[#5D3754]">
                  <User size={12} className="text-[#8FA998]" />
                  <span className="max-w-[120px] truncate">{email}</span>
                </span>
                <button
                  onClick={logout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                  <LogOut size={11} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="font-sans text-sm font-semibold text-[#5D3754] hover:text-[#5D3754]/80 px-3 py-2 transition-colors"
                  onClick={() => { setAuthMode('login'); setAuthOpen(true); }}
                >
                  Log In
                </button>
                <button
                  className="font-sans text-sm font-semibold bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] px-5 py-2.5 rounded-full shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
                >
                  Sign Up
                </button>
              </div>
            )}
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold border border-[#5D3754] text-[#5D3754] hover:bg-[#5D3754] hover:text-[#FAF6F2] px-5 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
            >
              <Upload size={14} />
              Decode
            </Link>
          </div>

          {/* Mobile: Decode CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/upload"
              className="inline-flex items-center gap-1 font-sans text-xs font-semibold bg-[#5D3754] text-[#FAF6F2] px-4 py-2 rounded-full"
            >
              <Upload size={13} />
              Decode
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F4DFD7] text-[#5D3754] transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#FDFBFA] border-t border-[#F4DFD7]/60 px-4 py-5 space-y-1 animate-fade-in">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`block py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === to
                    ? 'bg-[#5D3754]/10 text-[#5D3754]'
                    : 'text-[#5D3754]/80 hover:bg-[#F4DFD7]/40'
                }`}
              >
                {label}
              </Link>
            ))}
            <a href="/#how-it-works" onClick={() => setMenuOpen(false)} className="block py-3 px-4 rounded-xl text-sm font-semibold text-[#5D3754]/80 hover:bg-[#F4DFD7]/40">
              How It Works
            </a>
            <a href="/#pricing" onClick={() => setMenuOpen(false)} className="block py-3 px-4 rounded-xl text-sm font-semibold text-[#5D3754]/80 hover:bg-[#F4DFD7]/40">
              Pricing
            </a>

            <div className="border-t border-[#F4DFD7]/60 pt-4 mt-4">
              {email ? (
                <div className="space-y-2">
                  <p className="text-xs text-[#5D3754]/60 px-4">Signed in as {email}</p>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left py-3 px-4 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthOpen(true); setMenuOpen(false); }}
                    className="py-3 rounded-xl text-sm font-semibold border border-[#5D3754] text-[#5D3754] text-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthOpen(true); setMenuOpen(false); }}
                    className="py-3 rounded-xl text-sm font-semibold bg-[#5D3754] text-[#FAF6F2] text-center"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        loginFn={login}
        signupFn={signup}
      />
    </>
  );
}
