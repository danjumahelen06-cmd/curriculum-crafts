export type UserRole = 'member' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  profile_image_url: string | null;
  phone?: string;
  location?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export type CVTemplate = 'modern' | 'professional' | 'minimal' | 'executive' | 'creative';
export type CVFontSize = 'small' | 'medium' | 'large';
export type CVSpacing = 'compact' | 'normal' | 'relaxed';
export type CVStatus = 'draft' | 'completed';

export interface WorkExperience {
  id: string;
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  degree: string;
  field_of_study: string;
  institution: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  gpa?: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_url?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights: string[];
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface CVPersonalInfo {
  full_name: string;
  job_title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  avatar_url?: string;
}

export type CVSectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects'
  | 'languages'
  | 'awards'
  | 'references';

export interface CV {
  id: string;
  user_id: string;
  title: string;
  template: CVTemplate;
  primary_color: string;
  font_family: string;
  font_size: CVFontSize;
  spacing: CVSpacing;
  status: CVStatus;
  personal_info: CVPersonalInfo;
  summary: string;
  experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  languages: Language[];
  awards: Award[];
  references: Reference[];
  section_order: CVSectionKey[];
  created_at: string;
  updated_at: string;
}

export interface SecurityTestResult {
  id: string;
  name: string;
  description: string;
  scenario: string;
  passed: boolean;
  details: string;
  timestamp: string;
}
