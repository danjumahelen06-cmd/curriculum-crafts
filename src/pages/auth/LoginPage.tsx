import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Lock, Mail, ArrowRight, ShieldCheck, ShieldAlert, User, Shield } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setSubmitting(true);
    const res = await login(demoEmail, 'Password123!');
    setSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

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
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Account Selector for instant evaluation */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Instant Test Login (All 3 Roles)
          </div>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('danjumahelen06@gmail.com')}
              className="w-full p-2 text-left rounded-xl border border-slate-200 hover:bg-rose-50/40 hover:border-rose-200 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Helen Danjuma</div>
                  <div className="text-[10px] text-slate-500">Super Admin (All permissions)</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                Super Admin
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('marcus.sterling@curriculumcraft.io')}
              className="w-full p-2 text-left rounded-xl border border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Marcus Sterling</div>
                  <div className="text-[10px] text-slate-500">Admin (Sees Member + Admin)</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('elena.rostova@designpro.dev')}
              className="w-full p-2 text-left rounded-xl border border-slate-200 hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Elena Rostova</div>
                  <div className="text-[10px] text-slate-500">Member (Sees Member only)</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Member
              </span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign up now
          </button>
        </div>
      </div>
    </div>
  );
};
