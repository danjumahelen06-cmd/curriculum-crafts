import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Printer,
  Download,
  Database,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthModal } from '../components/auth/GoogleAuthModal';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-6">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Role-Based Governance · Supabase RLS & Private Storage</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
          Format Professional CVs with <span className="text-indigo-600">Enterprise Security</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Design ATS-optimized resumes with 5 executive templates, split-screen live preview, and role-enforced profile directory powered by Supabase PostgreSQL Row Level Security.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {currentUser ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-md shadow-slate-950/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              Go to Workspace Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2.5 cursor-pointer"
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
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (currentUser) {
                navigate('/cv/new');
              } else {
                navigate('/signup');
              }
            }}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Try Split-Screen Editor
          </button>
        </div>
      </section>

      {/* Security Matrix Feature Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Backend-Enforced Role Security Matrix
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Security is enforced strictly on the Supabase backend with PostgreSQL Row Level Security and Storage policies—never relying solely on frontend checks.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Current User Role</th>
                  <th className="py-3 px-4">Member Profile Image</th>
                  <th className="py-3 px-4">Admin Profile Image</th>
                  <th className="py-3 px-4">Super Admin Profile Image</th>
                  <th className="py-3 px-4">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-emerald-700">Member</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">✅ Visible</td>
                  <td className="py-3 px-4 text-rose-600 font-medium flex items-center gap-1.5 pt-4">
                    <EyeOff className="w-3.5 h-3.5" /> Blocked
                  </td>
                  <td className="py-3 px-4 text-rose-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5" /> Blocked
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">Read-only</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-indigo-700">Admin</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">✅ Visible</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">✅ Visible</td>
                  <td className="py-3 px-4 text-rose-600 font-medium flex items-center gap-1.5 pt-4">
                    <EyeOff className="w-3.5 h-3.5" /> Blocked
                  </td>
                  <td className="py-3 px-4 text-slate-500">View permitted</td>
                </tr>
                <tr className="hover:bg-slate-50/50 bg-rose-50/20">
                  <td className="py-3 px-4 font-semibold text-rose-700">Super Admin</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">✅ Visible</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">✅ Visible</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">✅ Visible</td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold">Full Authority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Job Seekers & Organizations
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every feature required to format, preview, and govern ATS-compatible curricula vitae.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">5 Distinct ATS Templates</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Choose from Modern, Professional, Minimal, Executive, and Creative layouts calibrated for recruiter scanners and human eyes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Split-Screen Live Editor</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Edit experience, education, skills, projects, and certifications on the left, with immediate real-time rendering on the right.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant PDF & Print Export</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Print or export to PDF directly with pixel-perfect typography, crisp vector text, and zero UI clutter.
            </p>
          </div>
        </div>
      </section>

      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => navigate('/dashboard')}
        mode="signin"
      />
    </div>
  );
};
