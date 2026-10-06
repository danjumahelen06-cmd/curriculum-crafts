import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  User,
  Settings,
  Shield,
  ShieldAlert,
  Database,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate, isOpen, onClose }) => {
  const { currentUser, role, isAdmin, isSuperAdmin, isSupabaseConnected } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const navItemClass = (path: string) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
      currentPath === path
        ? 'bg-slate-900 text-white font-semibold shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden print:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Main User Navigation */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            <nav className="space-y-1">
              <button onClick={() => handleNav('/dashboard')} className={`w-full ${navItemClass('/dashboard')}`}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button onClick={() => handleNav('/my-cvs')} className={`w-full ${navItemClass('/my-cvs')}`}>
                <FileText className="w-4 h-4 shrink-0" />
                <span>My CVs</span>
              </button>

              <button onClick={() => handleNav('/cv/new')} className={`w-full ${navItemClass('/cv/new')}`}>
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Create New CV</span>
              </button>

              <button onClick={() => handleNav('/profiles')} className={`w-full ${navItemClass('/profiles')}`}>
                <Users className="w-4 h-4 shrink-0" />
                <span>User Profiles Directory</span>
              </button>

              <button onClick={() => handleNav('/profile')} className={`w-full ${navItemClass('/profile')}`}>
                <User className="w-4 h-4 shrink-0" />
                <span>My Profile</span>
              </button>
            </nav>
          </div>

          {/* Elevated Access Navigation (Role-based UI) */}
          {(isAdmin || isSuperAdmin) && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Administration
              </div>
              <nav className="space-y-1">
                {isAdmin && (
                  <button onClick={() => handleNav('/admin')} className={`w-full ${navItemClass('/admin')}`}>
                    <Shield className="w-4 h-4 shrink-0 text-indigo-600" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => handleNav('/super-admin')}
                    className={`w-full ${navItemClass('/super-admin')}`}
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Super Admin Dashboard</span>
                  </button>
                )}
              </nav>
            </div>
          )}

          {/* Configuration & Verification */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Settings & Governance
            </div>
            <nav className="space-y-1">
              <button onClick={() => handleNav('/settings')} className={`w-full ${navItemClass('/settings')}`}>
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings & Security Tests</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Backend Info Card */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                Supabase Engine
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  isSupabaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isSupabaseConnected ? 'Connected' : 'Sandbox RLS'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 leading-tight">
              PostgreSQL RLS & Storage policies active.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
