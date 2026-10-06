import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserRole, CV } from '../types';
import {
  canViewProfileImage,
  canModifyRole,
  canUpdateProfile,
  canDeleteStorageImage,
  canAccessStorageObject,
} from './security-engine';

// Initial Super Admin email
export const INITIAL_SUPER_ADMIN_EMAIL = 'danjumahelen06@gmail.com';

const SUPABASE_URL_KEY = 'curriculumcraft_supabase_url';
const SUPABASE_ANON_KEY_KEY = 'curriculumcraft_supabase_anon_key';
const LOCAL_PROFILES_KEY = 'curriculumcraft_mock_profiles_v2';
const LOCAL_CVS_KEY = 'curriculumcraft_mock_cvs_v2';
const LOCAL_CURRENT_USER_KEY = 'curriculumcraft_active_user_v2';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const storedUrl = localStorage.getItem(SUPABASE_URL_KEY) || envUrl;
  const storedKey = localStorage.getItem(SUPABASE_ANON_KEY_KEY) || envKey;
  return {
    url: storedUrl,
    anonKey: storedKey,
    isConfigured: Boolean(storedUrl && storedKey),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_ANON_KEY_KEY, anonKey);
}

export function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_ANON_KEY_KEY);
}

// Initial seed profiles showcasing the 3 roles & private images
export const INITIAL_SEED_PROFILES: UserProfile[] = [
  {
    id: 'p-superadmin-01',
    user_id: 'u-superadmin-01',
    full_name: 'Helen Danjuma',
    email: INITIAL_SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    profile_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (555) 987-6543',
    location: 'San Francisco, CA',
    bio: 'Chief Technology Architect & Super Administrator. Managing enterprise CV pipelines and governance.',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-admin-01',
    user_id: 'u-admin-01',
    full_name: 'Marcus Sterling',
    email: 'marcus.sterling@curriculumcraft.io',
    role: 'admin',
    profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    bio: 'Platform Administrator overseeing member formatting quality and directory operations.',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-admin-02',
    user_id: 'u-admin-02',
    full_name: 'Sarah Jenkins',
    email: 'sarah.jenkins@curriculumcraft.io',
    role: 'admin',
    profile_image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (555) 876-5432',
    location: 'Seattle, WA',
    bio: 'Lead Talent Consultant & Admin. Helping members tailor ATS-optimized resumes.',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-member-01',
    user_id: 'u-member-01',
    full_name: 'Elena Rostova',
    email: 'elena.rostova@designpro.dev',
    role: 'member',
    profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Senior Full-Stack Engineer specializing in React, TypeScript, and distributed cloud applications.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-member-02',
    user_id: 'u-member-02',
    full_name: 'David Chen',
    email: 'david.chen@cloudtech.co',
    role: 'member',
    profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (555) 654-3210',
    location: 'Boston, MA',
    bio: 'Product Strategist & Agile Coach with 8+ years driving consumer SaaS growth.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initial pre-formatted CV template sample
export const INITIAL_SAMPLE_CV: CV = {
  id: 'cv-sample-01',
  user_id: 'u-superadmin-01',
  title: 'Helen Danjuma - Lead Executive CV',
  template: 'modern',
  primary_color: '#0f766e',
  font_family: 'Plus Jakarta Sans',
  font_size: 'medium',
  spacing: 'normal',
  status: 'completed',
  personal_info: {
    full_name: 'Helen Danjuma',
    job_title: 'Chief Technology Architect',
    email: INITIAL_SUPER_ADMIN_EMAIL,
    phone: '+1 (555) 987-6543',
    location: 'San Francisco, CA',
    website: 'https://helendanjuma.tech',
    linkedin: 'linkedin.com/in/helendanjuma',
    github: 'github.com/helendanjuma',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  summary:
    'Distinguished Technology Architect with 12+ years spearheading scalable cloud architectures, zero-trust security postures, and engineering leadership. Track record of designing distributed platforms handling tens of millions of daily transactions while driving high-performing cross-functional teams.',
  experiences: [
    {
      id: 'exp-1',
      job_title: 'Principal Systems Architect',
      company: 'Apex Cloud Solutions',
      location: 'San Francisco, CA',
      start_date: '2022-01',
      end_date: '',
      is_current: true,
      description: 'Architecting zero-trust multi-tenant platforms across hybrid cloud infrastructure.',
      highlights: [
        'Designed Row Level Security (RLS) and storage isolation frameworks serving 1.2M+ active accounts.',
        'Decreased P99 database query latencies by 42% through optimized indexing and caching layers.',
        'Mentored 25+ senior engineers and instituted enterprise security governance protocols.',
      ],
    },
    {
      id: 'exp-2',
      job_title: 'Senior Software Engineer & Team Lead',
      company: 'Novus Technologies',
      location: 'Palo Alto, CA',
      start_date: '2018-03',
      end_date: '2021-12',
      is_current: false,
      description: 'Led core platform microservices engineering with React, Node.js, and PostgreSQL.',
      highlights: [
        'Constructed resilient event-driven data streaming pipeline processing 50M daily events.',
        'Led transition from monolithic architecture to federated micro-frontends and APIs.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Master of Science in Computer Science',
      field_of_study: 'Distributed Systems & Security',
      institution: 'Stanford University',
      location: 'Stanford, CA',
      start_date: '2016-09',
      end_date: '2018-06',
      is_current: false,
      gpa: '3.94 / 4.0',
      description: 'Research focus on high-throughput distributed consensus and cryptographic access control.',
    },
    {
      id: 'edu-2',
      degree: 'Bachelor of Science in Software Engineering',
      field_of_study: 'Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      start_date: '2012-09',
      end_date: '2016-05',
      is_current: false,
      gpa: '3.88 / 4.0',
      description: 'Dean’s Honor List. President of Women in Computer Science.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'PostgreSQL & RLS', category: 'Databases', level: 'expert' },
    { id: 'sk-2', name: 'React & TypeScript', category: 'Frontend', level: 'expert' },
    { id: 'sk-3', name: 'Cloud Security (IAM)', category: 'Security', level: 'expert' },
    { id: 'sk-4', name: 'Distributed Systems', category: 'Architecture', level: 'expert' },
    { id: 'sk-5', name: 'Supabase & Storage', category: 'Backend', level: 'advanced' },
    { id: 'sk-6', name: 'Docker & Kubernetes', category: 'DevOps', level: 'advanced' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      issue_date: '2023-04',
      expiry_date: '2026-04',
      credential_url: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      issue_date: '2022-09',
      expiry_date: '2025-09',
      credential_url: 'https://cncf.io/verify',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Curriculum Craft Engine',
      description: 'Open-source ATS resume compiler rendering semantic templates with real-time PDF generation.',
      technologies: ['TypeScript', 'React', 'Tailwind CSS', 'PostgreSQL'],
      link: 'https://github.com/curriculumcraft',
      highlights: ['Adopted by 15,000+ job seekers with 98% ATS parse compatibility score.'],
    },
  ],
  languages: [
    { id: 'lang-1', name: 'English', proficiency: 'Native' },
    { id: 'lang-2', name: 'French', proficiency: 'Professional' },
  ],
  awards: [
    {
      id: 'aw-1',
      title: 'Outstanding Technical Leadership Award',
      issuer: 'Silicon Valley Engineering Forum',
      date: '2023-11',
      description: 'Awarded for exceptional contributions to zero-trust cloud data governance standards.',
    },
  ],
  references: [
    {
      id: 'ref-1',
      name: 'Dr. Raymond Scott',
      title: 'VP of Engineering',
      company: 'Apex Cloud Solutions',
      email: 'r.scott@apexcloud.io',
      phone: '+1 (555) 777-8899',
      relationship: 'Direct Executive Supervisor',
    },
  ],
  section_order: [
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'languages',
    'awards',
    'references',
  ],
  created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Client cache
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;
  if (!supabaseClientInstance) {
    try {
      supabaseClientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClientInstance;
}

// Local storage storage engine with strict backend policy enforcement
export class BackendSecuritySimulator {
  public static getProfiles(): UserProfile[] {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(INITIAL_SEED_PROFILES));
      return INITIAL_SEED_PROFILES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SEED_PROFILES;
    }
  }

  public static setProfiles(profiles: UserProfile[]) {
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
  }

  // Passwords storage for simulated sandbox auth
  private static getPasswords(): Record<string, string> {
    const raw = localStorage.getItem('curriculumcraft_mock_passwords');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  public static setPasswordForEmail(email: string, password: string) {
    const pw = this.getPasswords();
    pw[email.trim().toLowerCase()] = password;
    localStorage.setItem('curriculumcraft_mock_passwords', JSON.stringify(pw));
  }

  public static checkPasswordForEmail(email: string, password: string): boolean {
    const pw = this.getPasswords();
    const stored = pw[email.trim().toLowerCase()];
    if (!stored) {
      // Default initial seeds accept 'Password123!' or any input of at least 6 characters
      return password.length >= 6;
    }
    return stored === password;
  }

  // Create / Register New Profile
  public static createProfile(newProfile: UserProfile): {
    success: boolean;
    profile?: UserProfile;
    error?: string;
  } {
    const profiles = this.getProfiles();
    const normalizedEmail = newProfile.email.trim().toLowerCase();
    const exists = profiles.some((p) => p.email.trim().toLowerCase() === normalizedEmail);
    if (exists) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    // Role enforcement: new accounts are strictly member unless matching super admin email
    const finalRole: UserRole =
      normalizedEmail === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase() ? 'super_admin' : 'member';

    const profileToSave: UserProfile = {
      ...newProfile,
      email: normalizedEmail,
      role: finalRole,
      created_at: newProfile.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    profiles.push(profileToSave);
    this.setProfiles(profiles);
    return { success: true, profile: profileToSave };
  }

  public static getCVs(): CV[] {
    const raw = localStorage.getItem(LOCAL_CVS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CVS_KEY, JSON.stringify([INITIAL_SAMPLE_CV]));
      return [INITIAL_SAMPLE_CV];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [INITIAL_SAMPLE_CV];
    }
  }

  public static setCVs(cvs: CV[]) {
    localStorage.setItem(LOCAL_CVS_KEY, JSON.stringify(cvs));
  }

  // RLS-guarded Profiles Query
  public static fetchProfiles(viewer: UserProfile | null): UserProfile[] {
    const all = this.getProfiles();
    if (!viewer) return [];

    // Emulate PostgreSQL RLS SELECT Policy:
    // User can see own profile
    // super_admin sees all
    // admin sees member + admin
    // member sees member
    return all.filter((target) => {
      if (target.user_id === viewer.user_id) return true;
      if (viewer.role === 'super_admin') return true;
      if (viewer.role === 'admin') return target.role === 'member' || target.role === 'admin';
      if (viewer.role === 'member') return target.role === 'member';
      return false;
    });
  }

  // RLS-guarded Profile Update
  public static updateProfile(
    actor: UserProfile,
    targetUserId: string,
    updates: Partial<UserProfile>
  ): { success: boolean; profile?: UserProfile; error?: string } {
    const check = canUpdateProfile(actor.user_id, actor.role, targetUserId);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    // Role tampering check
    if (updates.role && updates.role !== actor.role && actor.role !== 'super_admin') {
      const roleCheck = canModifyRole(actor.role, actor.role, updates.role);
      if (!roleCheck.allowed) {
        return { success: false, error: roleCheck.reason };
      }
    }

    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.user_id === targetUserId);
    if (index === -1) {
      return { success: false, error: 'Profile not found.' };
    }

    const updated: UserProfile = {
      ...profiles[index],
      ...updates,
      // If not super_admin, never allow role mutation
      role: actor.role === 'super_admin' && updates.role ? updates.role : profiles[index].role,
      updated_at: new Date().toISOString(),
    };

    profiles[index] = updated;
    this.setProfiles(profiles);
    return { success: true, profile: updated };
  }

  // Super Admin Role Mutation
  public static changeUserRole(
    actor: UserProfile,
    targetUserId: string,
    newRole: UserRole
  ): { success: boolean; error?: string; profile?: UserProfile } {
    if (actor.role !== 'super_admin') {
      return {
        success: false,
        error: 'Privilege Escalation Blocked: Only super administrators can modify user roles.',
      };
    }

    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.user_id === targetUserId);
    if (index === -1) {
      return { success: false, error: 'User profile not found.' };
    }

    profiles[index].role = newRole;
    profiles[index].updated_at = new Date().toISOString();
    this.setProfiles(profiles);
    return { success: true, profile: profiles[index] };
  }

  // Super Admin Delete User
  public static deleteUser(
    actor: UserProfile,
    targetUserId: string
  ): { success: boolean; error?: string } {
    if (actor.role !== 'super_admin') {
      return {
        success: false,
        error: 'Access Denied: Only super administrators can remove users.',
      };
    }
    if (actor.user_id === targetUserId) {
      return { success: false, error: 'Cannot remove your own super administrator account.' };
    }

    const profiles = this.getProfiles().filter((p) => p.user_id !== targetUserId);
    this.setProfiles(profiles);
    return { success: true };
  }

  // Storage Upload Policy Simulation
  public static uploadProfileImage(
    actor: UserProfile,
    targetUserId: string,
    imageDataUrl: string
  ): { success: boolean; url?: string; error?: string } {
    // Bucket policy: (storage.foldername(name))[1] = auth.uid()
    if (actor.user_id !== targetUserId) {
      return {
        success: false,
        error: 'Storage Policy Violation: You can only upload images to your own profile folder.',
      };
    }

    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.user_id === actor.user_id);
    if (index !== -1) {
      profiles[index].profile_image_url = imageDataUrl;
      profiles[index].updated_at = new Date().toISOString();
      this.setProfiles(profiles);
    }

    return { success: true, url: imageDataUrl };
  }

  // Storage Delete Policy Simulation
  public static deleteProfileImage(
    actor: UserProfile,
    imageOwnerUserId: string
  ): { success: boolean; error?: string } {
    const check = canDeleteStorageImage(actor.user_id, imageOwnerUserId);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.user_id === actor.user_id);
    if (index !== -1) {
      profiles[index].profile_image_url = null;
      profiles[index].updated_at = new Date().toISOString();
      this.setProfiles(profiles);
    }

    return { success: true };
  }

  // Storage Access (Signed URL) Policy Simulation
  public static generateSignedImageUrl(
    viewer: UserProfile,
    targetProfile: UserProfile
  ): { success: boolean; signedUrl?: string; error?: string } {
    const check = canAccessStorageObject(
      viewer.user_id,
      viewer.role,
      targetProfile.user_id,
      targetProfile.role
    );

    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    return {
      success: true,
      signedUrl: targetProfile.profile_image_url || undefined,
    };
  }
}
