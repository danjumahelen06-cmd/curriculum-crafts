import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  FileText,
  User,
  Shield,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Database,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  toggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, toggleSidebar }) => {
  const { currentUser, role, isSuperAdmin, isAdmin, logout, switchTestUser, isSupabaseConnected } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const getRoleBadge = (userRole: UserRole | null) => {
    switch (userRole) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3.5 h-3.5" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <User className="w-3.5 h-3.5" />
            Member
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger + Logo */}
        <div className="flex items-center gap-3">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => navigate(currentUser ? '/dashboard' : '/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900 leading-none">
                Curriculum<span className="text-indigo-600">Craft</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                CV Engine & Security
              </div>
            </div>
          </div>
        </div>

        {/* Center: Quick navigation links for desktop */}
        {currentUser && (
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentPath === '/dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/my-cvs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentPath === '/my-cvs' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My CVs
            </button>
            <button
              onClick={() => navigate('/cv/new')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentPath === '/cv/new' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Create CV
            </button>
            <button
              onClick={() => navigate('/profiles')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentPath === '/profiles' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              User Profiles
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentPath === '/admin' ? 'bg-indigo-50 text-indigo-700' : 'text-indigo-600 hover:text-indigo-900'
                }`}
              >
                Admin
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => navigate('/super-admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentPath === '/super-admin' ? 'bg-rose-50 text-rose-700' : 'text-rose-600 hover:text-rose-900'
                }`}
              >
                Super Admin
              </button>
            )}
          </nav>
        )}

        {/* Right: Role Switcher & User Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Quick Sandbox Role Switcher (Essential for verifying tests 1-10 seamlessly) */}
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Quickly switch roles to test RLS & storage permissions"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Role Switcher</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {switcherOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setSwitcherOpen(false)}
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role Test
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => {
                      switchTestUser('super_admin');
                      setSwitcherOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      role === 'super_admin' ? 'bg-rose-50/70 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Helen Danjuma</div>
                      <div className="text-[11px] text-slate-500">Full visibility across all images</div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-rose-600 px-1.5 py-0.5 rounded bg-rose-100">
                      Super
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      switchTestUser('admin');
                      setSwitcherOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      role === 'admin' ? 'bg-indigo-50/70 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Marcus Sterling</div>
                      <div className="text-[11px] text-slate-500">Sees Member & Admin images only</div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 px-1.5 py-0.5 rounded bg-indigo-100">
                      Admin
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      switchTestUser('member');
                      setSwitcherOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      role === 'member' ? 'bg-emerald-50/70 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Elena Rostova</div>
                      <div className="text-[11px] text-slate-500">Sees Member images only (Admin blocked)</div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 px-1.5 py-0.5 rounded bg-emerald-100">
                      Member
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="User profile menu"
              >
                {currentUser.profile_image_url ? (
                  <img
                    src={currentUser.profile_image_url}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.full_name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900">{currentUser.full_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      My Profile & Image
                    </button>
                    <button
                      onClick={() => {
                        navigate('/my-cvs');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      My CVs
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      Supabase & Security Tests
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
