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

function Router() {
  const { currentUser, role, isAdmin, isSuperAdmin, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
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
    // Public auth routes
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/signup') {
      return <SignupPage navigate={navigate} />;
    }
    if (currentPath === '/forgot-password' || currentPath === '/reset-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    // Root landing
    if (currentPath === '/') {
      if (currentUser) {
        return <DashboardPage navigate={navigate} />;
      }
      return <LandingPage navigate={navigate} />;
    }

    // Require authentication for all app routes
    if (!currentUser) {
      return <LoginPage navigate={navigate} />;
    }

    // Split-Screen CV Editor
    if (currentPath === '/cv/new') {
      return <CVEditorPage cvId="new" navigate={navigate} />;
    }
    if (currentPath.startsWith('/cv/')) {
      const id = currentPath.replace('/cv/', '');
      return <CVEditorPage cvId={id} navigate={navigate} />;
    }

    // Core app routes
    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/my-cvs') {
      return <MyCVsPage navigate={navigate} />;
    }
    if (currentPath === '/profiles') {
      return <ProfilesDirectoryPage navigate={navigate} />;
    }
    if (currentPath === '/profile') {
      return <MyProfilePage />;
    }
    if (currentPath === '/settings') {
      return <SettingsPage />;
    }

    // Admin Dashboard (Protected: admin, super_admin)
    if (currentPath === '/admin') {
      return <AdminDashboardPage navigate={navigate} />;
    }

    // Super Admin Dashboard (Protected: super_admin only)
    if (currentPath === '/super-admin') {
      return <SuperAdminDashboardPage navigate={navigate} />;
    }

    // Fallback to Dashboard
    return <DashboardPage navigate={navigate} />;
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
