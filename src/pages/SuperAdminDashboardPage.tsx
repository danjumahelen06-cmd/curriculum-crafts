import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole } from '../types';
import { BackendSecuritySimulator } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Users,
  UserPlus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Search,
  Eye,
  Lock,
  Database,
  BarChart3,
  X,
} from 'lucide-react';

interface SuperAdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const SuperAdminDashboardPage: React.FC<SuperAdminDashboardPageProps> = ({ navigate }) => {
  const { currentUser, isSuperAdmin, role } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<{
    action: 'delete' | 'role_change';
    targetUser: UserProfile;
    newRole?: UserRole;
  } | null>(null);

  // New user form state
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('member');

  const toast = useToast();

  const loadAllProfiles = () => {
    if (currentUser) {
      const data = BackendSecuritySimulator.fetchProfiles(currentUser);
      setProfiles(data);
    }
  };

  useEffect(() => {
    loadAllProfiles();
  }, [currentUser]);

  // Authorization Guard: Super Admin ONLY
  if (!isSuperAdmin) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-rose-200 p-8 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Restricted Security Zone</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          The Super Administrator Dashboard requires top-level governance credentials. Your current role is <strong>{role || 'unauthenticated'}</strong>.
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

  // Handle Role Change Execution
  const executeRoleChange = () => {
    if (!pendingConfirm || !pendingConfirm.newRole || !currentUser) return;
    const { targetUser, newRole } = pendingConfirm;

    const res = BackendSecuritySimulator.changeUserRole(currentUser, targetUser.user_id, newRole);
    if (res.success) {
      toast.success(
        'Role Updated',
        `Changed role for ${targetUser.full_name} from ${targetUser.role} to ${newRole}.`
      );
      loadAllProfiles();
    } else {
      toast.error('Operation Failed', res.error || 'Failed to update role.');
    }
    setPendingConfirm(null);
  };

  // Handle User Deletion Execution
  const executeDeleteUser = () => {
    if (!pendingConfirm || !currentUser) return;
    const { targetUser } = pendingConfirm;

    const res = BackendSecuritySimulator.deleteUser(currentUser, targetUser.user_id);
    if (res.success) {
      toast.success('User Removed', `Account for ${targetUser.full_name} was deleted.`);
      loadAllProfiles();
    } else {
      toast.error('Deletion Blocked', res.error || 'Cannot remove user.');
    }
    setPendingConfirm(null);
  };

  // Create User Handler
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserFullName || !currentUser) return;

    const created: UserProfile = {
      id: `p-${Math.random().toString(36).substring(2, 9)}`,
      user_id: `u-${Math.random().toString(36).substring(2, 9)}`,
      full_name: newUserFullName,
      email: newUserEmail,
      role: newUserRole,
      profile_image_url: null,
      phone: '',
      location: '',
      bio: `Created by Super Administrator ${currentUser.full_name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    BackendSecuritySimulator.updateProfile(currentUser, created.user_id, created);
    toast.success('User Created', `Successfully provisioned ${created.full_name} as ${created.role}.`);
    setNewUserFullName('');
    setNewUserEmail('');
    setNewUserRole('member');
    setShowCreateModal(false);
    loadAllProfiles();
  };

  const totalUsers = profiles.length;
  const members = profiles.filter((p) => p.role === 'member').length;
  const admins = profiles.filter((p) => p.role === 'admin').length;
  const superAdmins = profiles.filter((p) => p.role === 'super_admin').length;

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Root Governance & Role Authority
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Super Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full authority over user lifecycle, role elevation/demotion, system stats, and all profile images.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-indigo-400" />
          Provision New User
        </button>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total System Users</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalUsers}</div>
          <div className="text-[11px] text-slate-500 mt-1">Managed accounts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Members</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{members}</div>
          <div className="text-[11px] text-slate-500 mt-1">Normal users</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Administrators</div>
          <div className="text-2xl font-bold text-indigo-700 mt-2">{admins}</div>
          <div className="text-[11px] text-slate-500 mt-1">Operational admins</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Super Admins</div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{superAdmins}</div>
          <div className="text-[11px] text-slate-500 mt-1">Root governance tier</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search all users..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Showing {filtered.length} of {totalUsers} users
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User & Image</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Role Management</th>
                <th className="py-3 px-4">Image Access</th>
                <th className="py-3 px-4 text-right">Dangerous Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const isSelf = currentUser?.user_id === u.user_id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.profile_image_url ? (
                          <img
                            src={u.profile_image_url}
                            alt={u.full_name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {u.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.full_name}
                            {isSelf && (
                              <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Current Role */}
                    <td className="py-3 px-4">
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

                    {/* Role Promotion/Demotion Controls */}
                    <td className="py-3 px-4">
                      {isSelf ? (
                        <span className="text-slate-400 text-[11px] italic">Super Admin (Self)</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {u.role === 'member' && (
                            <button
                              onClick={() =>
                                setPendingConfirm({
                                  action: 'role_change',
                                  targetUser: u,
                                  newRole: 'admin',
                                })
                              }
                              className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              Promote → Admin
                            </button>
                          )}

                          {u.role === 'admin' && (
                            <>
                              <button
                                onClick={() =>
                                  setPendingConfirm({
                                    action: 'role_change',
                                    targetUser: u,
                                    newRole: 'super_admin',
                                  })
                                }
                                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                Promote → Super Admin
                              </button>
                              <button
                                onClick={() =>
                                  setPendingConfirm({
                                    action: 'role_change',
                                    targetUser: u,
                                    newRole: 'member',
                                  })
                                }
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <ArrowDownRight className="w-3 h-3" />
                                Demote → Member
                              </button>
                            </>
                          )}

                          {u.role === 'super_admin' && (
                            <button
                              onClick={() =>
                                setPendingConfirm({
                                  action: 'role_change',
                                  targetUser: u,
                                  newRole: 'admin',
                                })
                              }
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <ArrowDownRight className="w-3 h-3" />
                              Demote → Admin
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Image Access */}
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                        <Eye className="w-3.5 h-3.5" /> Full Root Access
                      </span>
                    </td>

                    {/* Dangerous Actions (Delete) */}
                    <td className="py-3 px-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() =>
                            setPendingConfirm({
                              action: 'delete',
                              targetUser: u,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-medium text-xs flex items-center gap-1 ml-auto transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Confirmation Dialog for Dangerous Actions */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {pendingConfirm.action === 'delete' ? 'Confirm User Removal' : 'Confirm Role Reassignment'}
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {pendingConfirm.action === 'delete' ? (
                <>
                  Are you certain you wish to permanently delete the account for{' '}
                  <strong>{pendingConfirm.targetUser.full_name}</strong> (
                  {pendingConfirm.targetUser.email})? This action cannot be reverted.
                </>
              ) : (
                <>
                  You are about to reassign <strong>{pendingConfirm.targetUser.full_name}</strong> from role{' '}
                  <span className="font-semibold text-slate-900 capitalize">
                    {pendingConfirm.targetUser.role}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-rose-700 capitalize">
                    {pendingConfirm.newRole}
                  </span>
                  . This will immediately update their PostgreSQL RLS and storage access permissions.
                </>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={
                  pendingConfirm.action === 'delete' ? executeDeleteUser : executeRoleChange
                }
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {pendingConfirm.action === 'delete' ? 'Yes, Delete Account' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Provision New User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="rachel.adams@enterprise.org"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="member">Member (Default standard user)</option>
                  <option value="admin">Admin (Operational manager)</option>
                  <option value="super_admin">Super Admin (Root authority)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
