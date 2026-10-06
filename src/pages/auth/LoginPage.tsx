import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Lock, Mail, ArrowRight, ShieldCheck, ShieldAlert, User, Shield } from 'lucide-react';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, currentUser, logout, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const fillDemoAccount = (demoEmail: string, demoPass = 'Password123!') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email) {
      setFormError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password || 'Password123!');
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setFormError(res.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  if (currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Signed In</h2>
          <p className="text-xs text-slate-600 mt-2">
            You are logged in as <strong>{currentUser.full_name}</strong> ({currentUser.email}) with the{' '}
            <span className="font-semibold text-indigo-600 capitalize">{currentUser.role}</span> role.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm"
            >
              Continue to Dashboard
            </button>
            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your professional CVs and profile directory
          </p>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {formError}
          </div>
        )}

        {/* Continue with Google */}
        <div>
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={submitting || loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider shrink-0 font-medium">
              or continue with email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Test Logins */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Quick Test Logins
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('danjumahelen06@gmail.com', 'Password123!')}
              className="p-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-left transition-colors cursor-pointer"
              title="Super Admin: danjumahelen06@gmail.com"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700">
                <ShieldAlert className="w-3 h-3 shrink-0" />
                <span>Super Admin</span>
              </div>
              <div className="text-[10px] text-rose-600/80 truncate mt-0.5">Helen D.</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('marcus.sterling@curriculumcraft.io', 'Password123!')}
              className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-left transition-colors cursor-pointer"
              title="Admin: marcus.sterling@curriculumcraft.io"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                <Shield className="w-3 h-3 shrink-0" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-indigo-600/80 truncate mt-0.5">Marcus S.</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('elena.rostova@designpro.dev', 'Password123!')}
              className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors cursor-pointer"
              title="Member: elena.rostova@designpro.dev"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <User className="w-3 h-3 shrink-0" />
                <span>Member</span>
              </div>
              <div className="text-[10px] text-emerald-600/80 truncate mt-0.5">Elena R.</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer"
          >
            Sign up now
          </button>
        </div>
      </div>

      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => navigate('/dashboard')}
        mode="signin"
      />
    </div>
  );
};
