import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, User, X, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

interface DiscordAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'signin' | 'signup';
}

export const DiscordAuthModal: React.FC<DiscordAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'signin',
}) => {
  const { loginWithDiscord, isSupabaseConnected } = useAuth();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (email?: string, username?: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await loginWithDiscord(email, username);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Failed to authenticate with Discord.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during Discord authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) {
      setError('Please enter your Discord username.');
      return;
    }
    const emailToUse = customEmail.trim() || `${customUsername.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@discord.com`;
    handleSelectAccount(emailToUse, customUsername.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-[#5865F2]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shadow-xs">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {mode === 'signup' ? 'Sign up with Discord' : 'Sign in with Discord'}
              </h3>
              <p className="text-[11px] text-slate-500">Authorize your Discord identity for CurriculumCraft</p>
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
            {/* Helen Danjuma (Super Admin Discord) */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSelectAccount('danjumahelen06@gmail.com', 'Helen Danjuma')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5865F2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  HD
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-rose-900">
                    Helen Danjuma (Discord Link)
                  </div>
                  <div className="text-[11px] text-slate-500">danjumahelen06@gmail.com</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <ShieldAlert className="w-3 h-3" />
                Super Admin
              </span>
            </button>
          </div>

          {/* Toggle Custom Account */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#5865F2]/40 hover:border-[#5865F2] hover:bg-[#5865F2]/5 text-[#5865F2] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              Sign in with your Discord account name
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Discord Account Details
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Discord Username <span className="text-slate-400 font-normal">(e.g. alex_coder)</span>
                </label>
                <input
                  type="text"
                  required
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="alex_coder"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Discord Email <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Authenticating...' : 'Authorize as Member'}</span>
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

          {/* Live Supabase OAuth Option */}
          {isSupabaseConnected && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => handleSelectAccount()}
                disabled={submitting}
                className="text-[11px] text-[#5865F2] hover:text-[#4752c4] font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Launch Live Supabase Discord OAuth Redirect
              </button>
            </div>
          )}

          {/* Setup note */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-[#5865F2] shrink-0 mt-0.5" />
            <span>
              To enable live Discord OAuth in production, enable the <strong>Discord Provider</strong> in your Supabase Dashboard or consult the Discord setup instructions in Settings.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Discord OAuth scopes: <code className="font-mono text-slate-600">identify</code>, <code className="font-mono text-slate-600">email</code>
          </p>
        </div>
      </div>
    </div>
  );
};
