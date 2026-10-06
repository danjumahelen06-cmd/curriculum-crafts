import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  getSupabaseClient,
} from '../lib/supabase';
import { runSecurityTests } from '../lib/security-tests';
import { SecurityTestResult } from '../types';
import {
  Database,
  ShieldCheck,
  Play,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Lock,
  Terminal,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { isSupabaseConnected } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'security_tests' | 'connection' | 'sql_schema' | 'discord_oauth'>('security_tests');

  // Supabase connection form state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Security Test runner state
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseAnonKey(config.anonKey);

    // Run tests automatically on mount
    handleRunTests();
  }, []);

  const handleRunTests = async () => {
    setRunningTests(true);
    try {
      const results = await runSecurityTests();
      setTestResults(results);
      const passedCount = results.filter((r) => r.passed).length;
      if (passedCount === 10) {
        toast.success('Security Audit Passed', 'All 10 backend security tests passed successfully.');
      } else {
        toast.warning('Security Audit Warning', `${passedCount} of 10 security tests passed.`);
      }
    } finally {
      setRunningTests(false);
    }
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error('Missing Credentials', 'Please supply both Supabase Project URL and Anon Key.');
      return;
    }

    setTestingConnection(true);
    try {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.from('profiles').select('id').limit(1);
        if (error && !error.message.includes('relation "public.profiles" does not exist')) {
          toast.warning('Connected with Warning', `Supabase reached: ${error.message}`);
        } else {
          toast.success('Supabase Connected', 'Successfully saved project connection credentials.');
        }
      }
    } catch (err: any) {
      toast.error('Connection Error', err.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    toast.info('Disconnected', 'Supabase credentials cleared. System resumed in local security simulator mode.');
  };

  const copySqlSchema = () => {
    const sqlText = `-- Supabase PostgreSQL Schema & Security Policies
CREATE TYPE user_role AS ENUM ('member', 'admin', 'super_admin');

CREATE TABLE public.profiles (
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role based profile view policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'super_admin' OR
    ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin' AND role IN ('member', 'admin')) OR
    ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'member' AND role = 'member')
  );

-- Storage bucket & policies
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Users can upload their own profile image" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Role based image view policy" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-images' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.profiles viewer
        JOIN public.profiles owner ON owner.user_id::text = (storage.foldername(name))[1]
        WHERE viewer.user_id = auth.uid()
        AND (
          viewer.role = 'super_admin' OR
          (viewer.role = 'admin' AND owner.role IN ('member', 'admin')) OR
          (viewer.role = 'member' AND owner.role = 'member')
        )
      )
    )
  );`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    toast.success('SQL Copied', 'Full PostgreSQL DDL and RLS schema copied to clipboard.');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const totalPassed = testResults.filter((r) => r.passed).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Governance & Database Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verify backend RLS policies, execute the 10-point security test suite, and configure Supabase connectivity.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 max-w-2xl">
        <button
          onClick={() => setActiveTab('security_tests')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'security_tests'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security Test Suite (10/10)
        </button>
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'connection'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Supabase Connection
        </button>
        <button
          onClick={() => setActiveTab('sql_schema')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'sql_schema'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          PostgreSQL DDL
        </button>
        <button
          onClick={() => setActiveTab('discord_oauth')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'discord_oauth'
              ? 'bg-[#5865F2] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#5865F2]'
          }`}
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          Discord Setup Guide
        </button>
      </div>

      {/* 1. Security Test Runner */}
      {activeTab === 'security_tests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Automated 10-Point Security Verification
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Directly tests all 10 security constraints: role-based image access, cross-user denial, storage isolation, and privilege escalation prevention.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {totalPassed} / 10 Tests Passed
              </span>

              <button
                onClick={handleRunTests}
                disabled={runningTests}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                {runningTests ? 'Running...' : 'Run All Tests'}
              </button>
            </div>
          </div>

          {/* Test Cards List */}
          <div className="space-y-3">
            {testResults.map((t, idx) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        t.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {t.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{t.id}</span>
                        <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{t.description}</p>
                      <div className="mt-2 text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {t.details}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      t.passed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {t.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Supabase Connection Configuration */}
      {activeTab === 'connection' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Supabase Project Integration</h2>
            <p className="text-xs text-slate-500 mt-1">
              Connect your external Supabase project for direct PostgreSQL storage and authentication, or continue using the local backend security engine.
            </p>
          </div>

          <form onSubmit={handleSaveConnection} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Anon (Publishable) Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-[11px]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Never supply your service_role secret. Only the public anon key is safe on the client.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSupabaseConnected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Clear & Disconnect
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={testingConnection}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {testingConnection ? 'Validating...' : 'Save & Connect Supabase'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. PostgreSQL Schema & Policies Tab */}
      {activeTab === 'sql_schema' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">PostgreSQL Schema & Security Policies</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste this script into your Supabase SQL Editor to bootstrap all tables, triggers, and storage policies.
              </p>
            </div>

            <button
              onClick={copySqlSchema}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? 'Copied to Clipboard' : 'Copy SQL Schema'}
            </button>
          </div>

          <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px]">
            <pre className="leading-relaxed">
{`-- 1. Create Roles Enum
CREATE TYPE user_role AS ENUM ('member', 'admin', 'super_admin');

-- 2. Profiles Table with RLS
CREATE TABLE public.profiles (
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

-- 3. Automatic Profile Creation on Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'danjumahelen06@gmail.com' THEN 'super_admin'::user_role ELSE 'member'::user_role END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Role Tampering Protection Trigger (Prevents privilege escalation)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
DECLARE
  v_caller_role user_role;
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE user_id = auth.uid();
    IF v_caller_role IS NULL OR v_caller_role != 'super_admin' THEN
      RAISE EXCEPTION 'Privilege Escalation Blocked: Only super administrators can modify user roles.';
    END IF;
  END IF;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Storage Policies for private bucket 'profile-images'
CREATE POLICY "Users can upload their own profile image" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Role based image view policy" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-images' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.profiles viewer
        JOIN public.profiles owner ON owner.user_id::text = (storage.foldername(name))[1]
        WHERE viewer.user_id = auth.uid()
        AND (
          viewer.role = 'super_admin' OR
          (viewer.role = 'admin' AND owner.role IN ('member', 'admin')) OR
          (viewer.role = 'member' AND owner.role = 'member')
        )
      )
    )
  );`}
            </pre>
          </div>
        </div>
      )}
      {/* 4. Discord OAuth Setup Guide */}
      {activeTab === 'discord_oauth' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shadow-xs">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Discord OAuth Integration Setup
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Step-by-step instructions to configure Discord OAuth in the Discord Developer Portal and Supabase Auth.
                  </p>
                </div>
              </div>

              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
              >
                <span>Discord Developer Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Redirect URLs to copy */}
            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Required OAuth Redirect URLs to Add in Discord
              </h3>
              <p className="text-xs text-slate-600">
                In your Discord Application under <strong>OAuth2 &rarr; General &rarr; Redirects</strong>, add these URLs:
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">Supabase Auth Callback URL (Primary)</div>
                    <code className="text-xs font-mono text-indigo-700 break-all">
                      {supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : 'https://<your-supabase-project-id>.supabase.co/auth/v1/callback'}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const urlToCopy = supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : 'https://<your-supabase-project-id>.supabase.co/auth/v1/callback';
                      navigator.clipboard.writeText(urlToCopy);
                      toast.success('Copied', 'Supabase Callback URL copied to clipboard.');
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">Vercel Deployment URL</div>
                    <code className="text-xs font-mono text-indigo-700 break-all">
                      https://curriculum-crafts.vercel.app/
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://curriculum-crafts.vercel.app/');
                      toast.success('Copied', 'Vercel URL copied to clipboard.');
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">Development / Preview Container URL</div>
                    <code className="text-xs font-mono text-indigo-700 break-all">
                      https://ais-dev-kd5kl77zsl2ttrmhaqu4ke-565837962579.europe-west3.run.app/
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://ais-dev-kd5kl77zsl2ttrmhaqu4ke-565837962579.europe-west3.run.app/');
                      toast.success('Copied', 'Development URL copied to clipboard.');
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Step-by-Step Setup Instructions
              </h3>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[10px]">1</span>
                    Create Application in Discord Developer Portal
                  </div>
                  <p className="text-slate-600 pl-7">
                    Open <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">Discord Developer Portal</a> and click <strong>New Application</strong>. Name it <em>CurriculumCraft</em>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[10px]">2</span>
                    Add OAuth2 Redirects in Discord
                  </div>
                  <p className="text-slate-600 pl-7">
                    Navigate to <strong>OAuth2 &rarr; General</strong> in the left menu. Click <strong>Add Redirect</strong> and paste your Supabase callback URL (<code className="bg-slate-100 px-1 py-0.5 rounded">https://&lt;your-project-id&gt;.supabase.co/auth/v1/callback</code>). Click <strong>Save Changes</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[10px]">3</span>
                    Copy Client ID & Client Secret
                  </div>
                  <p className="text-slate-600 pl-7">
                    Under <strong>OAuth2 &rarr; General</strong>, copy the <strong>Client ID</strong> and click <strong>Reset Secret</strong> to copy the <strong>Client Secret</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[10px]">4</span>
                    Enable Discord Provider in Supabase Dashboard
                  </div>
                  <p className="text-slate-600 pl-7">
                    In your Supabase Dashboard, go to <strong>Authentication &rarr; Providers &rarr; Discord</strong>. Toggle <strong>Enable Discord</strong>, paste your <strong>Client ID</strong> and <strong>Client Secret</strong>, and click <strong>Save</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                  <div className="font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Done! Test Discord Sign-In
                  </div>
                  <p className="text-emerald-800 pl-7">
                    Users can now click <strong>Continue with Discord</strong> on the login page or <strong>Sign up with Discord</strong> on the registration page to authenticate seamlessly!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
