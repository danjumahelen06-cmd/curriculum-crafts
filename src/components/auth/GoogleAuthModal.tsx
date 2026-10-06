import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, User, X, ArrowRight, Sparkles } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'signin' | 'signup';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'signin',
}) => {
  const { loginWithGoogle, isSupabaseConnected } = useAuth();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (email?: string, name?: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await loginWithGoogle(email, name);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Failed to authenticate with Google.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setError('Please enter your Google account email.');
      return;
    }
    handleSelectAccount(customEmail.trim(), customName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
              </h3>
              <p className="text-[11px] text-slate-500">Choose an account to continue to CurriculumCraft</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Account Selector List */}
          <div className="space-y-2">
            {/* Helen Danjuma (Super Admin) */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSelectAccount('danjumahelen06@gmail.com', 'Helen Danjuma')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  HD
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-rose-900">
                    Helen Danjuma
                  </div>
                  <div className="text-[11px] text-slate-500">danjumahelen06@gmail.com</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <ShieldAlert className="w-3 h-3" />
                Super Admin
              </span>
            </button>

            {/* Demo Member */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSelectAccount('elena.rostova@designpro.dev', 'Elena Rostova')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ER
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900">
                    Elena Rostova
                  </div>
                  <div className="text-[11px] text-slate-500">elena.rostova@designpro.dev</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                <User className="w-3 h-3" />
                Member
              </span>
            </button>
          </div>

          {/* Toggle Custom Account */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              Use another Google account
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Enter your Google Account
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Google Email</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="alex.morgan@gmail.com"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Authenticating...' : 'Sign In as Member'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Live Supabase OAuth Notice */}
          {isSupabaseConnected && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => handleSelectAccount()}
                disabled={submitting}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Launch Live Supabase Google OAuth Redirect
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Protected by CurriculumCraft security policies & Row Level Security
          </p>
        </div>
      </div>
    </div>
  );
};
