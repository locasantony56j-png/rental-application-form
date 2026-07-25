import React, { useState } from 'react';
import { Mail, Lock, Loader2, X, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: { id: string; username: string; role: string; name: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to authenticate');
      }

      const data = await res.json();
      setSuccess(true);
      
      // Delay success action slightly for smooth transition
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
        onClose();
        setSuccess(false);
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030905]/80 backdrop-blur-md transition-all duration-300" id="login-modal-overlay">
      <div 
        className="relative bg-[#FCFAF7] max-w-md w-full rounded-[32px] border border-emerald-950/10 shadow-[0_20px_50px_rgba(6,17,10,0.15)] p-8 sm:p-10 text-left overflow-hidden transition-all duration-300"
        id="login-modal-container"
      >
        {/* Top Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-slate-100/50"
          id="btn-close-login"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4" id="login-success-state">
            <div className="inline-flex w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-[#1A2E22] tracking-tight">Access Granted</h3>
            <p className="text-sm font-medium text-slate-500">
              {email.trim().toLowerCase() === 'apartment.comofficial@gmail.com' 
                ? 'Loading secure Administrator control panel...'
                : 'Signing in to your rental application account...'}
            </p>
          </div>
        ) : (
          <div className="space-y-6" id="login-form-state">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl items-center justify-center border border-emerald-500/10" id="mail-badge">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-[#1A2E22] tracking-tight" id="login-modal-title">
                Portal Authentication
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed" id="login-modal-subtitle">
                Enter your credentials to access the secure administrative panel.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold flex items-start space-x-2.5 animate-shake" id="login-error">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" id="login-modal-form">
              <div className="space-y-2" id="form-group-email">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest" id="lbl-login-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                    id="input-login-email"
                  />
                </div>
              </div>

              <div className="space-y-2" id="form-group-password">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest" id="lbl-login-password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                    id="input-login-password"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B7E43] hover:bg-[#145E31] disabled:bg-emerald-700/60 text-white font-extrabold text-sm py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-900/10 hover:shadow-xl hover:shadow-emerald-900/20 flex items-center justify-center space-x-2 cursor-pointer"
                id="btn-login-modal-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100" id="login-modal-footer">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Secured by military-grade SSL standards
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
