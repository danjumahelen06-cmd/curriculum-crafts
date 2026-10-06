import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCV } from '../context/CVContext';
import {
  FileText,
  PlusCircle,
  Users,
  User,
  Settings,
  Sparkles,
  Clock,
  CheckCircle2,
  Edit,
  ArrowRight,
  Shield,
  ShieldAlert,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { currentUser, role, isAdmin, isSuperAdmin } = useAuth();
  const { cvs, createCV } = useCV();

  const totalCVs = cvs.length;
  const draftCVs = cvs.filter((c) => c.status === 'draft').length;
  const completedCVs = cvs.filter((c) => c.status === 'completed').length;
  const recentCVs = [...cvs].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3);

  const handleCreateFastCV = () => {
    const newCv = createCV('New Professional Resume', 'modern');
    navigate(`/cv/${newCv.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Curriculum Craft Workspace
            </span>
            <span className="text-slate-300">·</span>
            <span
              className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                role === 'super_admin'
                  ? 'bg-rose-100 text-rose-800'
                  : role === 'admin'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {role?.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {currentUser?.full_name || 'Member'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
            Create, format, and organize ATS-ready CVs. Profiles and images are secured via Supabase Row Level Security.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCreateFastCV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            Create New CV
          </button>
          <button
            onClick={() => navigate('/profiles')}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all"
          >
            <Users className="w-4 h-4 text-slate-500" />
            Profile Directory
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total CVs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-3">{totalCVs}</div>
          <div className="text-[11px] text-slate-500 mt-1">Curated ATS documents</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Draft CVs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-3">{draftCVs}</div>
          <div className="text-[11px] text-slate-500 mt-1">In progress editing</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed CVs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-3">{completedCVs}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for PDF / Print export</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Account Role</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-3 capitalize">{role?.replace('_', ' ')}</div>
          <div className="text-[11px] text-slate-500 mt-1">PostgreSQL RLS verified</div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-slate-500">
          Quick Launch Pad
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => handleCreateFastCV()}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
          >
            <PlusCircle className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Create New CV</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Start fresh resume</div>
          </button>

          <button
            onClick={() => navigate('/my-cvs')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
          >
            <FileText className="w-5 h-5 text-slate-700 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">My CVs</div>
            <div className="text-[11px] text-slate-500 mt-0.5">View all versions ({totalCVs})</div>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
          >
            <User className="w-5 h-5 text-slate-700 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">My Profile</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Manage details & photo</div>
          </button>

          <button
            onClick={() => navigate('/profiles')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
          >
            <Users className="w-5 h-5 text-slate-700 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Profile Directory</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Explore colleagues</div>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
          >
            <Settings className="w-5 h-5 text-slate-700 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Settings & Tests</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Database & 10 tests</div>
          </button>
        </div>
      </div>

      {/* Recent CVs List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent CV Documents</h2>
            <p className="text-xs text-slate-500">Pick up where you left off</p>
          </div>
          {cvs.length > 0 && (
            <button
              onClick={() => navigate('/my-cvs')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentCVs.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No CVs created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first professional CV with our live split-screen editor and ATS-friendly templates.
            </p>
            <button
              onClick={handleCreateFastCV}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Create My First CV
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentCVs.map((cv) => (
              <div
                key={cv.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{cv.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="capitalize font-medium text-slate-700">{cv.template} template</span>
                      <span>·</span>
                      <span
                        className={`capitalize font-medium ${
                          cv.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {cv.status}
                      </span>
                      <span>·</span>
                      <span>Updated {new Date(cv.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => navigate(`/cv/${cv.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Open in Editor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
