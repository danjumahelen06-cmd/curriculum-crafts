/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CVProvider } from './context/CVContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CVEditorPage } from './pages/CVEditorPage';
import { MyCVsPage } from './pages/MyCVsPage';
import { ProfilesDirectoryPage } from './pages/ProfilesDirectoryPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SuperAdminDashboardPage } from './pages/SuperAdminDashboardPage';
import { SettingsPage } from './pages/SettingsPage';

const normalizePath = (p: string) => {
  // If hash routing is used like /#/signup or #/login or #signup
  if (typeof window !== 'undefined' && window.location.hash) {
    const rawHash = window.location.hash;
    if (rawHash.startsWith('#/') || rawHash.startsWith('#')) {
      const fromHash = rawHash.replace(/^#\/?/, '/');
      if (fromHash && fromHash !== '/' && !fromHash.includes('access_token')) {
        return fromHash.split('?')[0].replace(/\/+$/, '') || '/';
      }
    }
  }

  if (!p) return '/';
  const withoutParams = p.split('?')[0].split('#')[0];
  const cleaned = withoutParams.replace(/\/+$/, '');
  return cleaned || '/';
};

function Router() {
  const { currentUser, role, isAdmin, isSuperAdmin, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(normalizePath(window.location.pathname));

  useEffect(() => {
    // 1. Recover path if served via public/404.html on static hosts like Vercel
    try {
      const redirect = sessionStorage.getItem('spa_redirect');
      if (redirect) {
        sessionStorage.removeItem('spa_redirect');
        window.history.replaceState({}, '', redirect);
        setCurrentPath(normalizePath(redirect));
        return;
      }
    } catch {
      // ignore
    }

    // 2. Gracefully handle OAuth callback hashes or params if returning from redirect
    if (
      window.location.hash.includes('access_token') ||
      window.location.search.includes('code=') ||
      window.location.pathname.includes('/callback') ||
      window.location.pathname.includes('/auth')
    ) {
      window.history.replaceState({}, '', '/dashboard');
      setCurrentPath('/dashboard');
      return;
    }

    const handleRouteUpdate = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handleRouteUpdate);
    window.addEventListener('hashchange', handleRouteUpdate);
    return () => {
      window.removeEventListener('popstate', handleRouteUpdate);
      window.removeEventListener('hashchange', handleRouteUpdate);
    };
  }, []);

  const navigate = (path: string) => {
    const clean = normalizePath(path);
    window.history.pushState({}, '', clean);
    setCurrentPath(clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Initializing Curriculum Craft...
          </div>
        </div>
      </div>
    );
  }

  // Routing Switch
  const renderRoute = () => {
    const path = normalizePath(currentPath);

    // Public auth routes
    if (path === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (path === '/signup') {
      return <SignupPage navigate={navigate} />;
    }
    if (path === '/forgot-password' || path === '/reset-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    // Root landing
    if (path === '/') {
      if (currentUser) {
        return <DashboardPage navigate={navigate} />;
      }
      return <LandingPage navigate={navigate} />;
    }

    // Require authentication for all protected app routes
    if (!currentUser) {
      return <LoginPage navigate={navigate} />;
    }

    // Split-Screen CV Editor
    if (path === '/cv/new') {
      return <CVEditorPage cvId="new" navigate={navigate} />;
    }
    if (path.startsWith('/cv/')) {
      const id = path.replace('/cv/', '');
      return <CVEditorPage cvId={id} navigate={navigate} />;
    }

    // Core app routes
    if (path === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (path === '/my-cvs') {
      return <MyCVsPage navigate={navigate} />;
    }
    if (path === '/profiles') {
      return <ProfilesDirectoryPage navigate={navigate} />;
    }
    if (path === '/profile') {
      return <MyProfilePage />;
    }
    if (path === '/settings') {
      return <SettingsPage />;
    }

    // Admin Dashboard (Protected: admin, super_admin)
    if (path === '/admin') {
      if (!isAdmin) {
        return <DashboardPage navigate={navigate} />;
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    // Super Admin Dashboard (Protected: super_admin only)
    if (path === '/super-admin') {
      if (!isSuperAdmin) {
        return <DashboardPage navigate={navigate} />;
      }
      return <SuperAdminDashboardPage navigate={navigate} />;
    }

    // Fallback
    return currentUser ? <DashboardPage navigate={navigate} /> : <LandingPage navigate={navigate} />;
  };

  return (
    <AppLayout currentPath={currentPath} navigate={navigate}>
      {renderRoute()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CVProvider>
          <Router />
        </CVProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
