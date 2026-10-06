import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole } from '../types';
import { BackendSecuritySimulator } from '../lib/supabase';
import { canViewProfileImage } from '../lib/security-engine';
import {
  Users,
  Search,
  MapPin,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  User,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ProfilesDirectoryPageProps {
  navigate: (path: string) => void;
}

export const ProfilesDirectoryPage: React.FC<ProfilesDirectoryPageProps> = ({ navigate }) => {
  const { currentUser, role } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | UserRole>('all');

  useEffect(() => {
    // Load profiles through RLS-enforced backend simulator
    const data = BackendSecuritySimulator.fetchProfiles(currentUser);
    setProfiles(data);
  }, [currentUser]);

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRoleFilter === 'all' || p.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <User className="w-3 h-3" />
            Member
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profiles Directory</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore team members and professional resumes. Profile image visibility is strictly governed by Supabase RLS and Storage policies.
        </p>
      </div>

      {/* Security Permission Matrix Status Notice */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Active Policy Enforcement: Logged in as <span className="capitalize text-indigo-600">{role?.replace('_', ' ')}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {role === 'member' && 'You can view Member profile images. Admin and Super Admin profile images are strictly hidden.'}
                {role === 'admin' && 'You can view Member and Admin images. Super Admin images are strictly hidden.'}
                {role === 'super_admin' && 'You have full authorization to view profile images across all user tiers.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 self-start sm:self-auto flex items-center gap-1"
          >
            Review 10-point test suite →
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, bio, or location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto">
          {(['all', 'member', 'admin', 'super_admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                selectedRoleFilter === r
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No profiles found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or role filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((profile) => {
            const isOwn = currentUser?.user_id === profile.user_id;
            const hasImageAccess = role
              ? canViewProfileImage(role, profile.role, isOwn)
              : false;

            return (
              <div
                key={profile.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isOwn ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top card header with avatar & role */}
                  <div className="flex items-start gap-4">
                    {/* Role-governed Avatar Container */}
                    <div className="relative shrink-0">
                      {hasImageAccess && profile.profile_image_url ? (
                        <div className="relative">
                          <img
                            src={profile.profile_image_url}
                            alt={profile.full_name}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          />
                          <div
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]"
                            title="Image visible via Storage Policy"
                          >
                            <Eye className="w-3 h-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-1 relative">
                          <EyeOff className="w-6 h-6 text-slate-400" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                            Locked
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {profile.full_name}
                        </h3>
                        {isOwn && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="mt-1">{getRoleBadge(profile.role)}</div>

                      {profile.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-3">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Storage Permission Explanation Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {hasImageAccess ? (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isOwn
                          ? 'Viewing own profile image'
                          : `Image authorized for ${role?.toUpperCase()} role`}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-rose-600 flex items-center gap-1.5 font-medium">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Image denied: {profile.role.toUpperCase()} image blocked for {role?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
