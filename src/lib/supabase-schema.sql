-- ==============================================================================
-- CURRICULUM CRAFT - SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Create Roles Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('member', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'member',
  profile_image_url TEXT,
  phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Automatic Profile Creation on Signup (auth.users Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'member';
BEGIN
  -- Initial Super Admin bootstrap:
  -- If configured email or first registered user, grant super_admin; else strictly member.
  IF NEW.email = 'danjumahelen06@gmail.com' OR NOT EXISTS (SELECT 1 FROM public.profiles) THEN
    v_role := 'super_admin';
  ELSE
    v_role := 'member';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Role Tampering Protection Trigger (Prevents privilege escalation)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
DECLARE
  v_caller_role user_role;
BEGIN
  -- If the role is being updated
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Look up the requesting user's actual role
    SELECT role INTO v_caller_role FROM public.profiles WHERE user_id = auth.uid();
    
    -- Only super_admin can change user roles
    IF v_caller_role IS NULL OR v_caller_role != 'super_admin' THEN
      RAISE EXCEPTION 'Privilege Escalation Blocked: Only super administrators can modify user roles.';
    END IF;
  END IF;

  -- Ensure updated_at timestamp updates
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 5. Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5A. SELECT Policy:
-- - User can always view their own profile
-- - Super Admin can view all profiles
-- - Admin can view member and admin profiles (cannot view super_admin)
-- - Member can only view member profiles
DROP POLICY IF EXISTS "Role based profile view policy" ON public.profiles;
CREATE POLICY "Role based profile view policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'super_admin' OR
    ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin' AND role IN ('member', 'admin')) OR
    ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'member' AND role = 'member')
  );

-- 5B. UPDATE Policy:
-- - Users can update their own personal info (name, bio, phone, etc., but role is guarded by trigger)
-- - Super Admin can update any profile (including roles)
DROP POLICY IF EXISTS "Role based profile update policy" ON public.profiles;
CREATE POLICY "Role based profile update policy" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'super_admin'
  )
  WITH CHECK (
    user_id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'super_admin'
  );

-- 5C. DELETE Policy:
-- - Only Super Admin can delete profiles
DROP POLICY IF EXISTS "Super admin profile delete policy" ON public.profiles;
CREATE POLICY "Super admin profile delete policy" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'super_admin'
  );

-- 6. CV Tables
CREATE TABLE IF NOT EXISTS public.cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled CV',
  template TEXT NOT NULL DEFAULT 'modern',
  primary_color TEXT NOT NULL DEFAULT '#1e40af',
  font_family TEXT NOT NULL DEFAULT 'Plus Jakarta Sans',
  font_size TEXT NOT NULL DEFAULT 'medium',
  spacing TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'draft',
  personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT DEFAULT '',
  section_order JSONB NOT NULL DEFAULT '["summary","experience","education","skills","certifications","projects","languages","awards","references"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON public.cvs(user_id);
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own CVs" ON public.cvs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Child tables for normalized CV sections
CREATE TABLE IF NOT EXISTS public.cv_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT '',
  is_current BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cv_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own experiences" ON public.cv_experiences
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cv_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT DEFAULT '',
  institution TEXT NOT NULL,
  location TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT '',
  is_current BOOLEAN DEFAULT false,
  gpa TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cv_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own education" ON public.cv_education
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cv_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Technical',
  level TEXT DEFAULT 'intermediate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cv_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own skills" ON public.cv_skills
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cv_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT DEFAULT '',
  credential_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cv_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own certifications" ON public.cv_certifications
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cv_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  technologies TEXT[] DEFAULT '{}',
  link TEXT DEFAULT '',
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cv_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own projects" ON public.cv_projects
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cv_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  proficiency TEXT DEFAULT 'Fluent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cv_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own languages" ON public.cv_languages
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cv_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  company TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  relationship TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cv_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own references" ON public.cv_references
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET & POLICIES ('profile-images' PRIVATE BUCKET)
-- ==============================================================================

-- Create private bucket 'profile-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policy 1: Upload (INSERT) - User can upload only into their own folder {user_id}/...
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Update (UPDATE) - User can update/replace only their own image
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Delete (DELETE) - User can delete only their own image
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Access (SELECT) - Role based visibility matrix:
-- - Own image: Always accessible
-- - Super Admin: Can access all images
-- - Admin: Can access member and admin images (CANNOT access super_admin images)
-- - Member: Can access member images (CANNOT access admin or super_admin images)
DROP POLICY IF EXISTS "Role based image view policy" ON storage.objects;
CREATE POLICY "Role based image view policy"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-images' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM public.profiles viewer
      JOIN public.profiles owner ON owner.user_id::text = (storage.foldername(name))[1]
      WHERE viewer.user_id = auth.uid()
      AND (
        viewer.role = 'super_admin'
        OR (viewer.role = 'admin' AND owner.role IN ('member', 'admin'))
        OR (viewer.role = 'member' AND owner.role = 'member')
      )
    )
  )
);
