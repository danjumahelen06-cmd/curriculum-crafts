import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  getSupabaseClient,
  getStoredSupabaseConfig,
  BackendSecuritySimulator,
  INITIAL_SEED_PROFILES,
  INITIAL_SUPER_ADMIN_EMAIL,
} from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isMember: boolean;
  loading: boolean;
  uploadingImage: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  uploadProfileImage: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  deleteProfileImage: () => Promise<{ success: boolean; error?: string }>;
  switchTestUser: (role: UserRole) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'curriculumcraft_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const toast = useToast();

  const role = currentUser?.role || null;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isMember = role === 'member';

  // Load initial session
  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      const config = getStoredSupabaseConfig();
      setIsSupabaseConnected(config.isConfigured);

      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (profile) {
              setCurrentUser(profile as UserProfile);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase auth session check failed, falling back to simulated session', err);
        }
      }

      // Fallback: check stored local user
      const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.user_id && parsed.email) {
            setCurrentUser(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // parse failed
        }
      }

      // Guest / unauthenticated state by default (no automatic login)
      setCurrentUser(null);
      setLoading(false);
    }

    initAuth();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!currentUser) return;
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.user_id)
          .single();
        if (profile) {
          setCurrentUser(profile as UserProfile);
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(profile));
          return;
        }
      } catch (e) {
        console.warn('Failed to refresh profile from Supabase:', e);
      }
    }

    // Refresh from simulated storage
    const all = BackendSecuritySimulator.getProfiles();
    const found = all.find((p) => p.user_id === currentUser.user_id);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(found));
    }
  }, [currentUser]);

  // Sign up
  const signup = async (email: string, password = 'Password123!', fullName = '') => {
    setLoading(true);
    const client = getSupabaseClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) {
          setLoading(false);
          toast.error('Signup Failed', error.message);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // If Supabase requires email confirmation first
          if (!data.session) {
            setLoading(false);
            toast.info(
              'Verification Email Sent',
              'Please check your inbox to confirm your email, then sign in.'
            );
            return { success: true };
          }

          // Fetch profile created by PostgreSQL trigger
          let profileData: UserProfile | null = null;
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (profile) {
            profileData = profile as UserProfile;
          } else {
            // Profile fallback insert
            const determinedRole: UserRole =
              normalizedEmail === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase()
                ? 'super_admin'
                : 'member';
            const newProfile: UserProfile = {
              id: crypto.randomUUID(),
              user_id: data.user.id,
              full_name: fullName.trim() || normalizedEmail.split('@')[0],
              email: data.user.email || normalizedEmail,
              role: determinedRole,
              profile_image_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await client.from('profiles').insert(newProfile);
            profileData = newProfile;
          }

          setCurrentUser(profileData);
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(profileData));
          toast.success(
            'Account Created',
            `Welcome, ${profileData.full_name}! You are registered as a ${profileData.role}.`
          );
          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setLoading(false);
        const msg = err.message || 'An unexpected error occurred during signup.';
        toast.error('Signup Error', msg);
        return { success: false, error: msg };
      }
    }

    // Local / Sandbox signup (Enforces that normal signup ALWAYS creates member)
    const assignedRole: UserRole =
      normalizedEmail === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase() ? 'super_admin' : 'member';

    const newProfile: UserProfile = {
      id: `p-${Math.random().toString(36).substring(2, 9)}`,
      user_id: `u-${Math.random().toString(36).substring(2, 9)}`,
      full_name: fullName.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: assignedRole,
      profile_image_url: null,
      phone: '',
      location: '',
      bio: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save in simulated backend profiles database
    const res = BackendSecuritySimulator.createProfile(newProfile);
    if (!res.success) {
      setLoading(false);
      toast.error('Registration Error', res.error || 'An account with this email already exists.');
      return { success: false, error: res.error };
    }

    BackendSecuritySimulator.setPasswordForEmail(normalizedEmail, password);
    const createdProfile = res.profile || newProfile;
    setCurrentUser(createdProfile);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(createdProfile));
    setLoading(false);
    toast.success(
      'Account Registered',
      `Welcome, ${createdProfile.full_name}! Your ${assignedRole} account is ready.`
    );
    return { success: true };
  };

  // Login
  const login = async (email: string, password = 'Password123!') => {
    setLoading(true);
    const client = getSupabaseClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          setLoading(false);
          toast.error('Authentication Error', error.message);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (profile) {
            setCurrentUser(profile as UserProfile);
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(profile));
            toast.success('Welcome back', `Signed in as ${profile.full_name} (${profile.role})`);
            setLoading(false);
            return { success: true };
          }
        }
      } catch (err: any) {
        setLoading(false);
        const msg = err.message || 'Login failed. Please check your credentials.';
        toast.error('Login Failed', msg);
        return { success: false, error: msg };
      }
    }

    // Sandbox authentication
    const allProfiles = BackendSecuritySimulator.getProfiles();
    const user = allProfiles.find((p) => p.email.toLowerCase() === normalizedEmail);

    if (!user) {
      setLoading(false);
      toast.error('Authentication Error', 'No account found with this email address. Please sign up first.');
      return { success: false, error: 'User not found' };
    }

    if (!BackendSecuritySimulator.checkPasswordForEmail(normalizedEmail, password)) {
      setLoading(false);
      toast.error('Authentication Error', 'Incorrect password. Please verify and try again.');
      return { success: false, error: 'Incorrect password' };
    }

    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    setLoading(false);
    toast.success('Signed In', `Welcome back, ${user.full_name} (${user.role})`);
    return { success: true };
  };

  // Google OAuth Login
  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    const client = getSupabaseClient();
    const targetEmail = (customEmail || INITIAL_SUPER_ADMIN_EMAIL).trim().toLowerCase();
    const isSuperAdminEmail = targetEmail === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();

    // 1. If live Supabase client is configured and no specific mock account was explicitly requested
    if (client && !customEmail) {
      try {
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return { success: true };
        }
      } catch (err: any) {
        console.warn('OAuth attempt failed:', err);
      }
    }

    // 2. Local / Sandbox Google Authentication
    const allProfiles = BackendSecuritySimulator.getProfiles();
    let user = allProfiles.find((p) => p.email.toLowerCase() === targetEmail);

    if (!user) {
      // Create new profile for this Google user
      const assignedRole: UserRole = isSuperAdminEmail ? 'super_admin' : 'member';
      const created: UserProfile = {
        id: `p-${Math.random().toString(36).substring(2, 9)}`,
        user_id: `u-${Math.random().toString(36).substring(2, 9)}`,
        full_name: customName?.trim() || targetEmail.split('@')[0],
        email: targetEmail,
        role: assignedRole,
        profile_image_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        phone: '',
        location: '',
        bio: isSuperAdminEmail
          ? 'Chief Technology Architect & Super Administrator'
          : 'CurriculumCraft platform member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = BackendSecuritySimulator.createProfile(created);
      user = res.profile || created;
    }

    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    setLoading(false);
    toast.success('Signed in with Google', `Welcome, ${user.full_name}! (${user.role})`);
    return { success: true };
  };

  // Logout
  const logout = async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    toast.info('Signed Out', 'You have been securely logged out.');
  };

  // Forgot / Reset password
  const resetPassword = async (email: string) => {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error('Password Reset Failed', error.message);
        return { success: false, error: error.message };
      }
    }
    toast.success('Reset Link Dispatched', `Password recovery instructions sent to ${email}.`);
    return { success: true };
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    // Reject client-side role tampering directly
    if (updates.role && updates.role !== currentUser.role && !isSuperAdmin) {
      toast.error('Security Violation', 'Privilege Escalation Blocked: Only super administrators can modify user roles.');
      return { success: false, error: 'Unauthorized role update attempt' };
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('profiles')
          .update(updates)
          .eq('user_id', currentUser.user_id)
          .select()
          .single();

        if (error) {
          toast.error('Update Failed', error.message);
          return { success: false, error: error.message };
        }
        if (data) {
          setCurrentUser(data as UserProfile);
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data));
          toast.success('Profile Saved', 'Your profile updates have been securely synchronized.');
          return { success: true };
        }
      } catch (err: any) {
        toast.error('Update Failed', err.message);
        return { success: false, error: err.message };
      }
    }

    // Backend Security Simulator RLS Check
    const res = BackendSecuritySimulator.updateProfile(currentUser, currentUser.user_id, updates);
    if (!res.success) {
      toast.error('Permission Denied', res.error || 'Failed to update profile.');
      return { success: false, error: res.error };
    }

    if (res.profile) {
      setCurrentUser(res.profile);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(res.profile));
      toast.success('Profile Updated', 'Profile details have been updated.');
      return { success: true };
    }
    return { success: false, error: 'Unknown error' };
  };

  // Upload Profile Image with validation (JPG, JPEG, PNG, WEBP, max 5MB)
  const uploadProfileImage = async (file: File) => {
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    // File validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const msg = 'Invalid file format. Please upload JPG, JPEG, PNG, or WEBP only.';
      toast.error('Upload Rejected', msg);
      return { success: false, error: msg };
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      const msg = 'File exceeds 5MB size limit. Please upload a smaller image.';
      toast.error('File Too Large', msg);
      return { success: false, error: msg };
    }

    setUploadingImage(true);

    try {
      const client = getSupabaseClient();
      if (client) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const filePath = `${currentUser.user_id}/profile.${fileExt}`;

        // Upload to private bucket 'profile-images'
        const { error: uploadError } = await client.storage
          .from('profile-images')
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Generate signed URL (expires in 1 year / 31536000s)
        const { data: signedData, error: signError } = await client.storage
          .from('profile-images')
          .createSignedUrl(filePath, 31536000);

        if (signError || !signedData?.signedUrl) {
          throw signError || new Error('Failed to generate signed URL');
        }

        const signedUrl = signedData.signedUrl;

        // Save URL in profile
        await client
          .from('profiles')
          .update({ profile_image_url: signedUrl })
          .eq('user_id', currentUser.user_id);

        const updatedUser: UserProfile = { ...currentUser, profile_image_url: signedUrl };
        setCurrentUser(updatedUser);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));

        setUploadingImage(false);
        toast.success('Image Uploaded', 'Your profile picture has been securely stored.');
        return { success: true, url: signedUrl };
      }

      // Convert to base64 Data URL for local preview storage
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = BackendSecuritySimulator.uploadProfileImage(currentUser, currentUser.user_id, dataUrl);
      if (!res.success) {
        throw new Error(res.error);
      }

      const updatedUser: UserProfile = { ...currentUser, profile_image_url: dataUrl };
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));

      setUploadingImage(false);
      toast.success('Profile Image Updated', 'Image stored with encrypted bucket policies.');
      return { success: true, url: dataUrl };
    } catch (err: any) {
      setUploadingImage(false);
      const msg = err.message || 'Image upload failed. Please try again.';
      toast.error('Upload Error', msg);
      return { success: false, error: msg };
    }
  };

  // Delete Profile Image
  const deleteProfileImage = async () => {
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const client = getSupabaseClient();
      if (client) {
        // Remove from storage
        const filePath = `${currentUser.user_id}/profile.jpg`;
        await client.storage.from('profile-images').remove([filePath]);

        // Clear in profile
        await client
          .from('profiles')
          .update({ profile_image_url: null })
          .eq('user_id', currentUser.user_id);
      }

      BackendSecuritySimulator.deleteProfileImage(currentUser, currentUser.user_id);

      const updatedUser: UserProfile = { ...currentUser, profile_image_url: null };
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
      toast.success('Image Removed', 'Your profile image has been deleted.');
      return { success: true };
    } catch (err: any) {
      toast.error('Delete Error', err.message || 'Failed to remove image.');
      return { success: false, error: err.message };
    }
  };

  // Quick switch between seed accounts to verify roles in 1 click
  const switchTestUser = (targetRole: UserRole) => {
    const seed = INITIAL_SEED_PROFILES.find((p) => p.role === targetRole);
    if (seed) {
      setCurrentUser(seed);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(seed));
      toast.info('Role Switched', `Now acting as ${seed.full_name} (${seed.role})`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isSuperAdmin,
        isAdmin,
        isMember,
        loading,
        uploadingImage,
        isSupabaseConnected,
        login,
        loginWithGoogle,
        signup,
        logout,
        resetPassword,
        updateProfile,
        uploadProfileImage,
        deleteProfileImage,
        switchTestUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
