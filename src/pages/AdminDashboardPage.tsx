import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { BackendSecuritySimulator } from '../lib/supabase';
import { canViewProfileImage } from '../lib/security-engine';
import {
  Shield,
  Users,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { currentUser, role, isAdmin, isSuperAdmin } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'members' | 'admins'>('all');

  useEffect(() => {
    if (currentUser) {
      const data = BackendSecuritySimulator.fetchProfiles(currentUser);
      setProfiles(data);
    }
  }, [currentUser]);

  // Authorization Guard: Admin or Super Admin only
  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-rose-200 p-8 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          The Admin Dashboard is strictly restricted to Administrators and Super Administrators. Your current role is <strong>{role}</strong>.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const memberCount = profiles.filter((p) => p.role === 'member').length;
  const adminCount = profiles.filter((p) => p.role === 'admin').length;
  const superAdminCount = profiles.filter((p) => p.role === 'super_admin').length;

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === 'members') return matchesSearch && p.role === 'member';
    if (activeTab === 'admins') return matchesSearch && p.role === 'admin';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Administrative Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Overview of organization members and peer administrators. Image permissions strictly enforced.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => navigate('/super-admin')}
            className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            Switch to Super Admin Suite →
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Members</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{memberCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Profile images visible</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Administrators</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{adminCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Profile images visible</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Super Administrators</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{superAdminCount}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            {isSuperAdmin ? 'Full visibility' : 'Images strictly hidden from Admin'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto">
          {(['all', 'members', 'admins'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Storage Image Visibility</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const isOwn = currentUser?.user_id === u.user_id;
                const canSeeImage = role ? canViewProfileImage(role, u.role, isOwn) : false;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {canSeeImage && u.profile_image_url ? (
                          <img
                            src={u.profile_image_url}
                            alt={u.full_name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.full_name}
                            {isOwn && (
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                          u.role === 'super_admin'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : u.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Image Policy Status */}
                    <td className="py-3.5 px-4">
                      {canSeeImage ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Authorized
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium flex items-center gap-1 text-[11px]">
                          <Lock className="w-3.5 h-3.5" />
                          Blocked (Super Admin tier protected)
                        </span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.location || '—'}
                    </td>

                    {/* Joined */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
