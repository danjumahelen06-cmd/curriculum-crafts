import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Upload,
  Trash2,
  Save,
  Shield,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const MyProfilePage: React.FC = () => {
  const {
    currentUser,
    role,
    isSuperAdmin,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    uploadingImage,
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  if (!currentUser) {
    return <div className="text-center py-12">Please log in to manage your profile.</div>;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side quick check
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setImageError('Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File is too large. Image size must not exceed 5 MB.');
      return;
    }

    const res = await uploadProfileImage(file);
    if (!res.success && res.error) {
      setImageError(res.error);
    }
  };

  const handleDeleteImage = async () => {
    if (window.confirm('Are you sure you want to delete your profile image?')) {
      setImageError(null);
      await deleteProfileImage();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      full_name: fullName,
      phone,
      location,
      bio,
    });
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details and encrypted profile photo stored in the private Supabase storage bucket.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Picture & Storage Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="relative mb-4">
            {currentUser.profile_image_url ? (
              <img
                src={currentUser.profile_image_url}
                alt={currentUser.full_name}
                className="w-32 h-32 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <User className="w-12 h-12 mb-1" />
                <span className="text-[10px] font-semibold text-slate-500">No Image</span>
              </div>
            )}

            {uploadingImage && (
              <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-semibold backdrop-blur-xs">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                Uploading...
              </div>
            )}
          </div>

          <h2 className="text-base font-bold text-slate-900">{currentUser.full_name}</h2>
          <div className="text-xs text-slate-500 mt-0.5">{currentUser.email}</div>

          {/* Role badge */}
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                role === 'super_admin'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : role === 'admin'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {role === 'super_admin' ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : role === 'admin' ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              {role?.replace('_', ' ')}
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {imageError && (
            <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {imageError}
            </div>
          )}

          {/* Image actions */}
          <div className="mt-6 w-full space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {currentUser.profile_image_url ? 'Replace Image' : 'Upload Image'}
            </button>

            {currentUser.profile_image_url && (
              <button
                onClick={handleDeleteImage}
                disabled={uploadingImage}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Image
              </button>
            )}
          </div>

          <div className="mt-4 text-[11px] text-slate-400 text-left leading-relaxed border-t border-slate-100 pt-3 w-full">
            • Allowed: JPG, PNG, WEBP<br />
            • Max size: 5 MB<br />
            • Stored in private bucket <code>profile-images/{currentUser.user_id}/</code>
          </div>
        </div>

        {/* Right Column: Edit Profile Details */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Edit Profile Information</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400">Derived from Supabase Auth</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State / Country"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Summary</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional background..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
              />
            </div>

            {/* Role Guard Notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Security Rule: Role is Read-Only</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  To prevent privilege escalation, users cannot modify their own assigned role. Only Super Administrators can alter account governance tiers.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
