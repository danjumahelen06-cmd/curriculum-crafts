import React, { useState, useEffect } from 'react';
import { useCV } from '../context/CVContext';
import { useAuth } from '../context/AuthContext';
import { CV, CVTemplate, CVSectionKey, WorkExperience, Education, Skill, Project, Certification, Language, Award, Reference } from '../types';
import { CVDocument } from '../components/cv-templates/CVDocument';
import {
  Save,
  Printer,
  Download,
  Copy,
  Trash2,
  Eye,
  ArrowLeft,
  Plus,
  Trash,
  MoveUp,
  MoveDown,
  Palette,
  Type,
  Layout,
  Maximize2,
  Minimize2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CVEditorPageProps {
  cvId?: string;
  navigate: (path: string) => void;
}

export const CVEditorPage: React.FC<CVEditorPageProps> = ({ cvId, navigate }) => {
  const { loadCV, createCV, saveCV, deleteCV, duplicateCV, printCV, downloadPDF } = useCV();
  const { currentUser } = useAuth();

  const [activeCV, setActiveCV] = useState<CV | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'formatting' | 'sections'>('content');
  const [activeSection, setActiveSection] = useState<CVSectionKey | 'personal'>('personal');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load CV by ID or initialize new
  useEffect(() => {
    if (cvId && cvId !== 'new') {
      const found = loadCV(cvId);
      if (found) {
        setActiveCV(found);
      } else {
        // Fallback create or redirect
        const created = createCV('My New Resume', 'modern');
        setActiveCV(created);
      }
    } else {
      const created = createCV('New Professional Resume', 'modern');
      setActiveCV(created);
    }
  }, [cvId, loadCV, createCV]);

  if (!activeCV) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm font-medium text-slate-500 animate-pulse">Loading CV Editor...</div>
      </div>
    );
  }

  // Update handlers
  const handleUpdatePersonalInfo = (field: string, value: string) => {
    setActiveCV((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        personal_info: {
          ...prev.personal_info,
          [field]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!activeCV) return;
    setIsSaving(true);
    await saveCV(activeCV);
    setIsSaving(false);
  };

  const handleDuplicate = async () => {
    if (!activeCV) return;
    const copy = await duplicateCV(activeCV.id);
    if (copy) {
      navigate(`/cv/${copy.id}`);
    }
  };

  const handleDelete = async () => {
    if (!activeCV) return;
    if (window.confirm(`Are you sure you want to delete "${activeCV.title}"?`)) {
      await deleteCV(activeCV.id);
      navigate('/my-cvs');
    }
  };

  // Section order reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    setActiveCV((prev) => {
      if (!prev) return null;
      const newOrder = [...prev.section_order];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return prev;

      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;

      return { ...prev, section_order: newOrder };
    });
  };

  // Experiences handlers
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      job_title: 'Job Title',
      company: 'Company Name',
      location: 'City, Country',
      start_date: '2023-01',
      end_date: '',
      is_current: true,
      description: 'Key responsibilities and achievements in this position.',
      highlights: ['Accomplishment point 1', 'Accomplishment point 2'],
    };
    setActiveCV((prev) => prev ? { ...prev, experiences: [newExp, ...prev.experiences] } : null);
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    setActiveCV((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      };
    });
  };

  const removeExperience = (id: string) => {
    setActiveCV((prev) => prev ? { ...prev, experiences: prev.experiences.filter((e) => e.id !== id) } : null);
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: 'Degree / Certificate',
      field_of_study: 'Field of Study',
      institution: 'University / Institution',
      location: 'City, Country',
      start_date: '2019-09',
      end_date: '2023-05',
      is_current: false,
      gpa: '',
      description: '',
    };
    setActiveCV((prev) => prev ? { ...prev, education: [newEdu, ...prev.education] } : null);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setActiveCV((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        education: prev.education.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      };
    });
  };

  const removeEducation = (id: string) => {
    setActiveCV((prev) => prev ? { ...prev, education: prev.education.filter((e) => e.id !== id) } : null);
  };

  // Skills handlers
  const addSkill = () => {
    const newSkill: Skill = {
      id: `sk-${Date.now()}`,
      name: 'New Skill',
      category: 'Technical',
      level: 'intermediate',
    };
    setActiveCV((prev) => prev ? { ...prev, skills: [...prev.skills, newSkill] } : null);
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setActiveCV((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        skills: prev.skills.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      };
    });
  };

  const removeSkill = (id: string) => {
    setActiveCV((prev) => prev ? { ...prev, skills: prev.skills.filter((s) => s.id !== id) } : null);
  };

  // Projects handlers
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'Project Title',
      description: 'Overview of deliverables and engineering scope.',
      technologies: ['React', 'TypeScript'],
      link: '',
      highlights: [],
    };
    setActiveCV((prev) => prev ? { ...prev, projects: [...prev.projects, newProj] } : null);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setActiveCV((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      };
    });
  };

  const removeProject = (id: string) => {
    setActiveCV((prev) => prev ? { ...prev, projects: prev.projects.filter((p) => p.id !== id) } : null);
  };

  // Certifications handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: 'Certification Title',
      issuer: 'Issuing Organization',
      issue_date: '2024-01',
      expiry_date: '',
      credential_url: '',
    };
    setActiveCV((prev) => prev ? { ...prev, certifications: [...prev.certifications, newCert] } : null);
  };

  const updateCertification = (id: string, updates: Partial<Certification>) => {
    setActiveCV((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      };
    });
  };

  const removeCertification = (id: string) => {
    setActiveCV((prev) => prev ? { ...prev, certifications: prev.certifications.filter((c) => c.id !== id) } : null);
  };

  // Color options
  const colorPresets = [
    { name: 'Navy Blue', hex: '#1e40af' },
    { name: 'Slate Teal', hex: '#0f766e' },
    { name: 'Emerald', hex: '#047857' },
    { name: 'Burgundy', hex: '#881337' },
    { name: 'Charcoal', hex: '#1e293b' },
    { name: 'Indigo', hex: '#4338ca' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header / Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-cvs')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Return to My CVs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <input
              type="text"
              value={activeCV.title}
              onChange={(e) => setActiveCV({ ...activeCV, title: e.target.value })}
              className="font-bold text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none px-1"
            />
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1 mt-0.5">
              <span className="capitalize">{activeCV.template} template</span>
              <span>·</span>
              <select
                value={activeCV.status}
                onChange={(e) => setActiveCV({ ...activeCV, status: e.target.value as any })}
                className="bg-transparent font-medium text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save CV'}
          </button>

          <button
            onClick={handleDuplicate}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Duplicate CV"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            onClick={printCV}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title={isFullscreenPreview ? 'Split screen' : 'Fullscreen Preview'}
          >
            {isFullscreenPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete CV"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Main: Split screen layout */}
      <div className={`grid ${isFullscreenPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} gap-6`}>
        {/* Left Side: Form Editor Panel */}
        {!isFullscreenPreview && (
          <div className="lg:col-span-5 space-y-4 print:hidden">
            {/* Tab switchers: Content | Formatting | Sections */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'content' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab('formatting')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'formatting' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Format & Style
              </button>
              <button
                onClick={() => setActiveTab('sections')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'sections' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reorder
              </button>
            </div>

            {/* Content Editor Sub-sections */}
            {activeTab === 'content' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5 max-h-[750px] overflow-y-auto">
                {/* Section Quick Pills */}
                <div className="flex flex-wrap gap-1.5 pb-3 border-b border-slate-100">
                  {(['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] as const).map(
                    (sec) => (
                      <button
                        key={sec}
                        onClick={() => setActiveSection(sec)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                          activeSection === sec
                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sec}
                      </button>
                    )
                  )}
                </div>

                {/* 1. Personal Information */}
                {activeSection === 'personal' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={activeCV.personal_info.full_name}
                          onChange={(e) => handleUpdatePersonalInfo('full_name', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Professional Title</label>
                        <input
                          type="text"
                          value={activeCV.personal_info.job_title}
                          onChange={(e) => handleUpdatePersonalInfo('job_title', e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={activeCV.personal_info.email}
                          onChange={(e) => handleUpdatePersonalInfo('email', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={activeCV.personal_info.phone}
                          onChange={(e) => handleUpdatePersonalInfo('phone', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={activeCV.personal_info.location}
                          onChange={(e) => handleUpdatePersonalInfo('location', e.target.value)}
                          placeholder="City, Country"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">LinkedIn</label>
                        <input
                          type="text"
                          value={activeCV.personal_info.linkedin || ''}
                          onChange={(e) => handleUpdatePersonalInfo('linkedin', e.target.value)}
                          placeholder="linkedin.com/in/username"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">GitHub / Website</label>
                        <input
                          type="text"
                          value={activeCV.personal_info.github || ''}
                          onChange={(e) => handleUpdatePersonalInfo('github', e.target.value)}
                          placeholder="github.com/username"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Professional Summary */}
                {activeSection === 'summary' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Professional Summary
                    </h3>
                    <textarea
                      rows={5}
                      value={activeCV.summary}
                      onChange={(e) => setActiveCV({ ...activeCV, summary: e.target.value })}
                      placeholder="Write a compelling executive overview of your career accomplishments..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                    />
                  </div>
                )}

                {/* 3. Work Experience */}
                {activeSection === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Work Experience ({activeCV.experiences.length})
                      </h3>
                      <button
                        onClick={addExperience}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Experience
                      </button>
                    </div>

                    <div className="space-y-4">
                      {activeCV.experiences.map((exp) => (
                        <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Position Details</span>
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Remove Experience"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={exp.job_title}
                              onChange={(e) => updateExperience(exp.id, { job_title: e.target.value })}
                              placeholder="Job Title"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                              placeholder="Company"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={exp.start_date}
                              onChange={(e) => updateExperience(exp.id, { start_date: e.target.value })}
                              placeholder="Start Date (e.g. 2022-01)"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={exp.end_date}
                              onChange={(e) => updateExperience(exp.id, { end_date: e.target.value })}
                              placeholder="End Date (or Present)"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                          </div>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                            placeholder="Description of duties..."
                            className="w-full p-2 text-xs rounded bg-white border border-slate-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Education */}
                {activeSection === 'education' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Education ({activeCV.education.length})
                      </h3>
                      <button
                        onClick={addEducation}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Education
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeCV.education.map((edu) => (
                        <div key={edu.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Academic Entry</span>
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                              placeholder="Degree (e.g. B.S. Computer Science)"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                              placeholder="Institution / University"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={edu.start_date}
                              onChange={(e) => updateEducation(edu.id, { start_date: e.target.value })}
                              placeholder="Start Date"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={edu.end_date}
                              onChange={(e) => updateEducation(edu.id, { end_date: e.target.value })}
                              placeholder="End Date"
                              className="px-2.5 py-1 text-xs rounded bg-white border border-slate-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Skills */}
                {activeSection === 'skills' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Skills ({activeCV.skills.length})
                      </h3>
                      <button
                        onClick={addSkill}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Skill
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeCV.skills.map((s) => (
                        <div key={s.id} className="p-2 rounded-lg border border-slate-200 flex items-center gap-2 bg-slate-50/50">
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => updateSkill(s.id, { name: e.target.value })}
                            placeholder="Skill name"
                            className="flex-1 px-2 py-1 text-xs bg-white rounded border border-slate-200"
                          />
                          <select
                            value={s.level}
                            onChange={(e) => updateSkill(s.id, { level: e.target.value as any })}
                            className="text-[11px] bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                          <button
                            onClick={() => removeSkill(s.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Projects */}
                {activeSection === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Projects ({activeCV.projects.length})
                      </h3>
                      <button
                        onClick={addProject}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeCV.projects.map((p) => (
                        <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={p.title}
                              onChange={(e) => updateProject(p.id, { title: e.target.value })}
                              placeholder="Project Title"
                              className="font-semibold text-xs px-2 py-1 bg-white rounded border border-slate-200 flex-1 mr-2"
                            />
                            <button onClick={() => removeProject(p.id)} className="text-slate-400 hover:text-rose-600 p-1">
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={p.description}
                            onChange={(e) => updateProject(p.id, { description: e.target.value })}
                            placeholder="Project scope and impact..."
                            className="w-full p-2 text-xs bg-white rounded border border-slate-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Certifications */}
                {activeSection === 'certifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Certifications ({activeCV.certifications.length})
                      </h3>
                      <button
                        onClick={addCertification}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Certification
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activeCV.certifications.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 bg-slate-50/50">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateCertification(c.id, { name: e.target.value })}
                            placeholder="Certification Name"
                            className="flex-1 px-2 py-1 text-xs bg-white rounded border border-slate-200"
                          />
                          <input
                            type="text"
                            value={c.issuer}
                            onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                            placeholder="Issuer"
                            className="w-32 px-2 py-1 text-xs bg-white rounded border border-slate-200"
                          />
                          <button onClick={() => removeCertification(c.id)} className="text-slate-400 hover:text-rose-600 p-1">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formatting Tab: 5 Templates & Typography Controls */}
            {activeTab === 'formatting' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Select ATS Template (5 Formats)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'modern', name: '1. Modern', desc: 'Balanced accents & clean divider line' },
                      { id: 'professional', name: '2. Professional', desc: 'Corporate serif headers & classic center layout' },
                      { id: 'minimal', name: '3. Minimal', desc: 'Ultra-crisp monochrome, maximum ATS score' },
                      { id: 'executive', name: '4. Executive', desc: 'Distinguished header banner & leadership layout' },
                      { id: 'creative', name: '5. Creative', desc: 'Accent column sidebar for portfolio projects' },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setActiveCV({ ...activeCV, template: tpl.id as CVTemplate })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          activeCV.template === tpl.id
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{tpl.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{tpl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Accent Color */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Primary Accent Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {colorPresets.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setActiveCV({ ...activeCV, primary_color: c.hex })}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          activeCV.primary_color === c.hex ? 'scale-125 ring-2 ring-offset-2 ring-slate-900' : 'hover:scale-110'
                        }`}
                        title={c.name}
                      />
                    ))}
                    <input
                      type="color"
                      value={activeCV.primary_color}
                      onChange={(e) => setActiveCV({ ...activeCV, primary_color: e.target.value })}
                      className="w-7 h-7 rounded-full cursor-pointer p-0 border-0"
                      title="Custom color"
                    />
                  </div>
                </div>

                {/* Font Family & Spacing */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Font Family</label>
                    <select
                      value={activeCV.font_family}
                      onChange={(e) => setActiveCV({ ...activeCV, font_family: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="Inter">Inter (Sans)</option>
                      <option value="Playfair Display">Playfair (Serif)</option>
                      <option value="JetBrains Mono">JetBrains (Mono)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Density & Spacing</label>
                    <select
                      value={activeCV.spacing}
                      onChange={(e) => setActiveCV({ ...activeCV, spacing: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="compact">Compact (Dense)</option>
                      <option value="normal">Standard Normal</option>
                      <option value="relaxed">Relaxed (Spacious)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Sections Reordering Tab */}
            {activeTab === 'sections' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Drag & Reorder CV Sections
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Control the vertical order in which sections render on your exported CV.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {activeCV.section_order.map((sec, idx) => (
                    <div
                      key={sec}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 capitalize">{sec}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === activeCV.section_order.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Side: Live CV Preview Panel */}
        <div className={`${isFullscreenPreview ? 'col-span-1 max-w-4xl mx-auto w-full' : 'lg:col-span-7'}`}>
          <div className="sticky top-20 bg-slate-200/60 p-4 sm:p-6 rounded-2xl border border-slate-300/80 overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-600 print:hidden">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Live Dynamic ATS Preview
              </span>
              <span className="text-[11px] text-slate-500">Updates immediately on keystroke</span>
            </div>

            {/* Document Render Canvas */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden min-h-[750px]">
              <CVDocument cv={activeCV} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
