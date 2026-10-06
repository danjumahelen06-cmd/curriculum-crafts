import React from 'react';
import { CV } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, Briefcase, GraduationCap, Code2, ShieldCheck, Languages, Users } from 'lucide-react';

interface CVDocumentProps {
  cv: CV;
  className?: string;
  isPrint?: boolean;
}

export const CVDocument: React.FC<CVDocumentProps> = ({ cv, className = '', isPrint = false }) => {
  const {
    template,
    primary_color = '#1e40af',
    font_family = 'Plus Jakarta Sans',
    font_size = 'medium',
    spacing = 'normal',
    personal_info,
    summary,
    experiences = [],
    education = [],
    skills = [],
    certifications = [],
    projects = [],
    languages = [],
    awards = [],
    references = [],
    section_order = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards', 'references'],
  } = cv;

  const fontClasses: Record<string, string> = {
    'Plus Jakarta Sans': 'font-sans',
    'Inter': 'font-sans',
    'Playfair Display': 'font-serif',
    'JetBrains Mono': 'font-mono',
  };

  const sizeClasses: Record<string, { body: string; h1: string; h2: string; h3: string; sub: string }> = {
    small: { body: 'text-xs', h1: 'text-xl', h2: 'text-sm', h3: 'text-xs font-semibold', sub: 'text-[11px]' },
    medium: { body: 'text-sm', h1: 'text-2xl', h2: 'text-base', h3: 'text-sm font-semibold', sub: 'text-xs' },
    large: { body: 'text-base', h1: 'text-3xl', h2: 'text-lg', h3: 'text-base font-semibold', sub: 'text-sm' },
  };

  const spacingClasses: Record<string, { section: string; item: string }> = {
    compact: { section: 'mb-4', item: 'mb-2.5' },
    normal: { section: 'mb-6', item: 'mb-4' },
    relaxed: { section: 'mb-8', item: 'mb-5' },
  };

  const currentSize = sizeClasses[font_size] || sizeClasses.medium;
  const currentSpacing = spacingClasses[spacing] || spacingClasses.normal;
  const selectedFont = fontClasses[font_family] || 'font-sans';

  // Section renderers
  const renderSummary = () => {
    if (!summary) return null;
    return (
      <div key="summary" className={currentSpacing.section}>
        <SectionTitle title="Professional Summary" color={primary_color} h2Class={currentSize.h2} template={template} />
        <p className={`${currentSize.body} text-slate-700 leading-relaxed mt-2 text-justify`}>
          {summary}
        </p>
      </div>
    );
  };

  const renderExperience = () => {
    if (!experiences.length) return null;
    return (
      <div key="experience" className={currentSpacing.section}>
        <SectionTitle title="Work Experience" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="space-y-4 mt-2">
          {experiences.map((exp) => (
            <div key={exp.id} className={currentSpacing.item}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className={`${currentSize.h3} text-slate-900`}>{exp.job_title}</span>
                <span className={`${currentSize.sub} text-slate-500 shrink-0 font-medium`}>
                  {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 mt-0.5">
                <span className={`${currentSize.sub} font-semibold`} style={{ color: primary_color }}>{exp.company}</span>
                {exp.location && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className={`${currentSize.sub} text-slate-500`}>{exp.location}</span>
                  </>
                )}
              </div>
              {exp.description && (
                <p className={`${currentSize.body} text-slate-700 mt-1.5 leading-relaxed`}>
                  {exp.description}
                </p>
              )}
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className={`${currentSize.body} text-slate-700 leading-normal pl-1`}>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!education.length) return null;
    return (
      <div key="education" className={currentSpacing.section}>
        <SectionTitle title="Education" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="space-y-3 mt-2">
          {education.map((edu) => (
            <div key={edu.id} className={currentSpacing.item}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className={`${currentSize.h3} text-slate-900`}>
                  {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                </span>
                <span className={`${currentSize.sub} text-slate-500 shrink-0 font-medium`}>
                  {edu.start_date} – {edu.is_current ? 'Present' : edu.end_date || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 mt-0.5">
                <span className={`${currentSize.sub} font-semibold`} style={{ color: primary_color }}>{edu.institution}</span>
                {edu.location && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className={`${currentSize.sub} text-slate-500`}>{edu.location}</span>
                  </>
                )}
                {edu.gpa && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className={`${currentSize.sub} text-slate-500`}>GPA: {edu.gpa}</span>
                  </>
                )}
              </div>
              {edu.description && (
                <p className={`${currentSize.body} text-slate-700 mt-1 leading-relaxed`}>{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!skills.length) return null;
    return (
      <div key="skills" className={currentSpacing.section}>
        <SectionTitle title="Skills & Competencies" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="flex flex-wrap gap-2 mt-2.5">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/60 flex items-center gap-1.5"
            >
              <span>{skill.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">({skill.level})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (!projects.length) return null;
    return (
      <div key="projects" className={currentSpacing.section}>
        <SectionTitle title="Key Projects" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="space-y-3 mt-2">
          {projects.map((proj) => (
            <div key={proj.id} className={currentSpacing.item}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`${currentSize.h3} text-slate-900`}>{proj.title}</span>
                {proj.link && (
                  <span className={`${currentSize.sub} text-blue-600 underline truncate max-w-xs`}>
                    {proj.link.replace(/^https?:\/\//, '')}
                  </span>
                )}
              </div>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-600">Tech Stack:</span> {proj.technologies.join(', ')}
                </div>
              )}
              {proj.description && (
                <p className={`${currentSize.body} text-slate-700 mt-1 leading-relaxed`}>{proj.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!certifications.length) return null;
    return (
      <div key="certifications" className={currentSpacing.section}>
        <SectionTitle title="Certifications" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
          {certifications.map((cert) => (
            <div key={cert.id} className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
              <div className={`${currentSize.sub} font-semibold text-slate-900`}>{cert.name}</div>
              <div className="text-xs text-slate-600 mt-0.5 flex items-center justify-between">
                <span>{cert.issuer}</span>
                <span className="text-slate-400">{cert.issue_date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLanguages = () => {
    if (!languages.length) return null;
    return (
      <div key="languages" className={currentSpacing.section}>
        <SectionTitle title="Languages" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="flex flex-wrap gap-4 mt-2 text-xs">
          {languages.map((lang) => (
            <div key={lang.id} className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">{lang.name}:</span>
              <span className="text-slate-600">{lang.proficiency}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAwards = () => {
    if (!awards.length) return null;
    return (
      <div key="awards" className={currentSpacing.section}>
        <SectionTitle title="Honors & Awards" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="space-y-2 mt-2">
          {awards.map((award) => (
            <div key={award.id} className="text-xs">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{award.title}</span>
                <span className="text-slate-500 font-normal">{award.date}</span>
              </div>
              <div className="text-slate-600">{award.issuer}</div>
              {award.description && <div className="text-slate-500 mt-0.5">{award.description}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReferences = () => {
    if (!references.length) return null;
    return (
      <div key="references" className={currentSpacing.section}>
        <SectionTitle title="References" color={primary_color} h2Class={currentSize.h2} template={template} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {references.map((ref) => (
            <div key={ref.id} className="p-2.5 rounded bg-slate-50 border border-slate-200/80 text-xs">
              <div className="font-semibold text-slate-900">{ref.name}</div>
              <div className="text-slate-600">{ref.title} · {ref.company}</div>
              <div className="text-slate-500 mt-1 flex flex-col gap-0.5">
                {ref.email && <span>Email: {ref.email}</span>}
                {ref.phone && <span>Phone: {ref.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    certifications: renderCertifications,
    languages: renderLanguages,
    awards: renderAwards,
    references: renderReferences,
  };

  // 1. Template: Minimal
  if (template === 'minimal') {
    return (
      <div
        className={`bg-white text-slate-900 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:shadow-none print:p-0 ${selectedFont} ${className}`}
        id="cv-printable-document"
      >
        <header className="border-b border-slate-900 pb-5 mb-6">
          <h1 className={`${currentSize.h1} font-bold tracking-tight uppercase text-slate-950`}>
            {personal_info.full_name || 'Your Name'}
          </h1>
          <p className={`${currentSize.h2} text-slate-600 tracking-wide uppercase mt-1 font-medium`}>
            {personal_info.job_title}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-3">
            {personal_info.email && <span>{personal_info.email}</span>}
            {personal_info.phone && <span>· {personal_info.phone}</span>}
            {personal_info.location && <span>· {personal_info.location}</span>}
            {personal_info.linkedin && <span>· {personal_info.linkedin}</span>}
            {personal_info.github && <span>· {personal_info.github}</span>}
          </div>
        </header>

        <main>{section_order.map((key) => sectionRenderers[key]?.())}</main>
      </div>
    );
  }

  // 2. Template: Executive
  if (template === 'executive') {
    return (
      <div
        className={`bg-white text-slate-900 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:shadow-none print:p-0 ${selectedFont} ${className}`}
        id="cv-printable-document"
      >
        <header className="p-6 rounded-lg text-white mb-6" style={{ backgroundColor: primary_color }}>
          <div className="flex items-center gap-6">
            {personal_info.avatar_url && (
              <img
                src={personal_info.avatar_url}
                alt={personal_info.full_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/80 shadow"
              />
            )}
            <div>
              <h1 className={`${currentSize.h1} font-extrabold tracking-tight text-white`}>
                {personal_info.full_name || 'Executive Candidate'}
              </h1>
              <p className={`${currentSize.h2} text-white/90 font-medium tracking-wide mt-1`}>
                {personal_info.job_title}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80 mt-2.5">
                {personal_info.email && <span>{personal_info.email}</span>}
                {personal_info.phone && <span>· {personal_info.phone}</span>}
                {personal_info.location && <span>· {personal_info.location}</span>}
                {personal_info.linkedin && <span>· {personal_info.linkedin}</span>}
              </div>
            </div>
          </div>
        </header>

        <main>{section_order.map((key) => sectionRenderers[key]?.())}</main>
      </div>
    );
  }

  // 3. Template: Creative
  if (template === 'creative') {
    return (
      <div
        className={`bg-white text-slate-900 shadow-sm max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[900px] print:shadow-none print:grid-cols-12 ${selectedFont} ${className}`}
        id="cv-printable-document"
      >
        {/* Sidebar */}
        <aside className="col-span-4 p-6 sm:p-8 bg-slate-50 border-r border-slate-200 text-slate-800">
          {personal_info.avatar_url && (
            <img
              src={personal_info.avatar_url}
              alt={personal_info.full_name}
              className="w-24 h-24 rounded-2xl object-cover mb-4 border border-slate-300 shadow-sm mx-auto md:mx-0"
            />
          )}
          <h1 className={`${currentSize.h1} font-bold text-slate-900 leading-tight`}>
            {personal_info.full_name || 'Your Name'}
          </h1>
          <p className={`${currentSize.sub} font-semibold uppercase tracking-wider mt-1`} style={{ color: primary_color }}>
            {personal_info.job_title}
          </p>

          <div className="mt-6 space-y-2 text-xs text-slate-600">
            {personal_info.email && <div className="truncate">{personal_info.email}</div>}
            {personal_info.phone && <div>{personal_info.phone}</div>}
            {personal_info.location && <div>{personal_info.location}</div>}
            {personal_info.website && <div className="truncate">{personal_info.website}</div>}
            {personal_info.linkedin && <div className="truncate">{personal_info.linkedin}</div>}
            {personal_info.github && <div className="truncate">{personal_info.github}</div>}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s.id} className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-200 text-slate-700">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {languages.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Languages</h3>
              <div className="space-y-1 text-xs text-slate-600">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span>{l.name}</span>
                    <span className="text-slate-400">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="col-span-8 p-6 sm:p-8">
          {section_order
            .filter((k) => k !== 'skills' && k !== 'languages')
            .map((key) => sectionRenderers[key]?.())}
        </main>
      </div>
    );
  }

  // 4. Template: Professional (Corporate classic)
  if (template === 'professional') {
    return (
      <div
        className={`bg-white text-slate-900 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:shadow-none print:p-0 ${selectedFont} ${className}`}
        id="cv-printable-document"
      >
        <header className="text-center pb-6 border-b-2 border-slate-200 mb-6">
          <h1 className={`${currentSize.h1} font-serif font-bold tracking-tight text-slate-900`}>
            {personal_info.full_name || 'Professional Name'}
          </h1>
          <p className={`${currentSize.h2} text-slate-600 font-medium italic mt-1`}>
            {personal_info.job_title}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 font-sans">
            {personal_info.location && <span>{personal_info.location}</span>}
            {personal_info.phone && <span>· {personal_info.phone}</span>}
            {personal_info.email && <span>· {personal_info.email}</span>}
            {personal_info.linkedin && <span>· {personal_info.linkedin}</span>}
          </div>
        </header>

        <main>{section_order.map((key) => sectionRenderers[key]?.())}</main>
      </div>
    );
  }

  // 5. Template: Modern (Default)
  return (
    <div
      className={`bg-white text-slate-900 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:shadow-none print:p-0 ${selectedFont} ${className}`}
      id="cv-printable-document"
    >
      <header className="pb-6 mb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${currentSize.h1} font-extrabold tracking-tight text-slate-900`}>
            {personal_info.full_name || 'Candidate Full Name'}
          </h1>
          <p className={`${currentSize.h2} font-semibold mt-1`} style={{ color: primary_color }}>
            {personal_info.job_title}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2.5">
            {personal_info.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{personal_info.email}</span>}
            {personal_info.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{personal_info.phone}</span>}
            {personal_info.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{personal_info.location}</span>}
            {personal_info.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5 text-slate-400" />{personal_info.linkedin}</span>}
          </div>
        </div>

        {personal_info.avatar_url && (
          <img
            src={personal_info.avatar_url}
            alt={personal_info.full_name}
            className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
          />
        )}
      </header>

      <main>{section_order.map((key) => sectionRenderers[key]?.())}</main>
    </div>
  );
};

// Reusable Section Header with dynamic styling
const SectionTitle: React.FC<{
  title: string;
  color: string;
  h2Class: string;
  template: string;
}> = ({ title, color, h2Class, template }) => {
  if (template === 'minimal') {
    return (
      <div className="border-b border-slate-300 pb-1 mb-2">
        <h2 className={`${h2Class} font-bold uppercase tracking-wider text-slate-900`}>{title}</h2>
      </div>
    );
  }

  if (template === 'professional') {
    return (
      <div className="border-b border-slate-300 pb-1 mb-2">
        <h2 className={`${h2Class} font-serif font-bold text-slate-800`}>{title}</h2>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
      <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }} />
      <h2 className={`${h2Class} font-bold text-slate-900 tracking-tight`}>{title}</h2>
    </div>
  );
};
