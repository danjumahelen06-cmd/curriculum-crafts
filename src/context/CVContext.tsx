import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CV, CVTemplate, CVSectionKey } from '../types';
import { useAuth } from './AuthContext';
import { BackendSecuritySimulator, INITIAL_SAMPLE_CV } from '../lib/supabase';
import { useToast } from './ToastContext';

interface CVContextType {
  cvs: CV[];
  currentCV: CV | null;
  loading: boolean;
  loadCV: (id: string) => CV | null;
  setCurrentCV: React.Dispatch<React.SetStateAction<CV | null>>;
  createCV: (title?: string, template?: CVTemplate) => CV;
  saveCV: (cvData: Partial<CV>) => Promise<boolean>;
  deleteCV: (id: string) => Promise<boolean>;
  duplicateCV: (id: string) => Promise<CV | null>;
  reorderSections: (newOrder: CVSectionKey[]) => void;
  printCV: () => void;
  downloadPDF: () => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [currentCV, setCurrentCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Load CVs belonging to current user
  useEffect(() => {
    if (!currentUser) {
      setCvs([]);
      setCurrentCV(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const all = BackendSecuritySimulator.getCVs();
    // User-isolated CV list (RLS enforcement: user_id = auth.uid())
    let userCvs = all.filter((c) => c.user_id === currentUser.user_id);

    // If current user is initial user and has none, associate sample CV with them
    if (userCvs.length === 0 && currentUser.email === INITIAL_SAMPLE_CV.personal_info.email) {
      const seeded = { ...INITIAL_SAMPLE_CV, user_id: currentUser.user_id };
      all.push(seeded);
      BackendSecuritySimulator.setCVs(all);
      userCvs = [seeded];
    }

    setCvs(userCvs);
    setLoading(false);
  }, [currentUser]);

  const loadCV = useCallback(
    (id: string): CV | null => {
      if (!currentUser) return null;
      const all = BackendSecuritySimulator.getCVs();
      const found = all.find((c) => c.id === id && c.user_id === currentUser.user_id);
      if (found) {
        setCurrentCV(found);
        return found;
      }
      return null;
    },
    [currentUser]
  );

  const createCV = useCallback(
    (title = 'Professional CV', template: CVTemplate = 'modern'): CV => {
      if (!currentUser) {
        throw new Error('You must be signed in to create a CV.');
      }

      const newCV: CV = {
        id: `cv-${Math.random().toString(36).substring(2, 9)}`,
        user_id: currentUser.user_id,
        title,
        template,
        primary_color: '#1e40af',
        font_family: 'Plus Jakarta Sans',
        font_size: 'medium',
        spacing: 'normal',
        status: 'draft',
        personal_info: {
          full_name: currentUser.full_name || '',
          job_title: 'Professional Title',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          location: currentUser.location || '',
          website: '',
          linkedin: '',
          github: '',
          avatar_url: currentUser.profile_image_url || undefined,
        },
        summary: currentUser.bio || 'Accomplished professional with proven ability to deliver high-impact results.',
        experiences: [
          {
            id: `exp-${Date.now()}`,
            job_title: 'Software Engineer',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            start_date: '2023-01',
            end_date: '',
            is_current: true,
            description: 'Leading feature delivery and architecture enhancements.',
            highlights: ['Improved system efficiency by 25%', 'Collaborated with international teams'],
          },
        ],
        education: [
          {
            id: `edu-${Date.now()}`,
            degree: 'Bachelor of Science in Computer Science',
            field_of_study: 'Software Systems',
            institution: 'University of Technology',
            location: 'New York, NY',
            start_date: '2019-09',
            end_date: '2023-05',
            is_current: false,
            description: 'Graduated with honors. Relevant coursework in Algorithms and Databases.',
          },
        ],
        skills: [
          { id: `sk-1`, name: 'TypeScript', category: 'Frontend', level: 'expert' },
          { id: `sk-2`, name: 'React', category: 'Frontend', level: 'expert' },
          { id: `sk-3`, name: 'PostgreSQL', category: 'Backend', level: 'advanced' },
          { id: `sk-4`, name: 'Tailwind CSS', category: 'Design', level: 'expert' },
        ],
        certifications: [],
        projects: [],
        languages: [{ id: `lang-1`, name: 'English', proficiency: 'Fluent' }],
        awards: [],
        references: [],
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const all = BackendSecuritySimulator.getCVs();
      all.unshift(newCV);
      BackendSecuritySimulator.setCVs(all);

      setCvs((prev) => [newCV, ...prev]);
      setCurrentCV(newCV);
      toast.success('CV Created', `"${title}" has been created with the ${template} template.`);
      return newCV;
    },
    [currentUser, toast]
  );

  const saveCV = useCallback(
    async (cvData: Partial<CV>): Promise<boolean> => {
      if (!currentCV || !currentUser) return false;

      const updated: CV = {
        ...currentCV,
        ...cvData,
        updated_at: new Date().toISOString(),
      };

      const all = BackendSecuritySimulator.getCVs();
      const index = all.findIndex((c) => c.id === updated.id && c.user_id === currentUser.user_id);
      if (index === -1) {
        toast.error('Save Failed', 'CV not found or access denied.');
        return false;
      }

      all[index] = updated;
      BackendSecuritySimulator.setCVs(all);

      setCurrentCV(updated);
      setCvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success('CV Saved', 'All changes have been safely stored.');
      return true;
    },
    [currentCV, currentUser, toast]
  );

  const deleteCV = useCallback(
    async (id: string): Promise<boolean> => {
      if (!currentUser) return false;

      const all = BackendSecuritySimulator.getCVs();
      const target = all.find((c) => c.id === id);
      if (!target || target.user_id !== currentUser.user_id) {
        toast.error('Deletion Denied', 'You can only delete your own CV.');
        return false;
      }

      const filtered = all.filter((c) => c.id !== id);
      BackendSecuritySimulator.setCVs(filtered);

      setCvs((prev) => prev.filter((c) => c.id !== id));
      if (currentCV?.id === id) {
        setCurrentCV(null);
      }
      toast.success('CV Deleted', 'The CV has been removed.');
      return true;
    },
    [currentUser, currentCV, toast]
  );

  const duplicateCV = useCallback(
    async (id: string): Promise<CV | null> => {
      if (!currentUser) return null;

      const all = BackendSecuritySimulator.getCVs();
      const original = all.find((c) => c.id === id && c.user_id === currentUser.user_id);
      if (!original) {
        toast.error('Error', 'CV could not be found.');
        return null;
      }

      const duplicate: CV = {
        ...original,
        id: `cv-${Math.random().toString(36).substring(2, 9)}`,
        title: `${original.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      all.unshift(duplicate);
      BackendSecuritySimulator.setCVs(all);

      setCvs((prev) => [duplicate, ...prev]);
      toast.success('CV Duplicated', `Created copy: "${duplicate.title}"`);
      return duplicate;
    },
    [currentUser, toast]
  );

  const reorderSections = useCallback((newOrder: CVSectionKey[]) => {
    setCurrentCV((prev) => {
      if (!prev) return null;
      return { ...prev, section_order: newOrder };
    });
  }, []);

  const printCV = useCallback(() => {
    window.print();
  }, []);

  const downloadPDF = useCallback(() => {
    // Print dialog configured with background graphics on browsers prompts save to PDF
    window.print();
  }, []);

  return (
    <CVContext.Provider
      value={{
        cvs,
        currentCV,
        loading,
        loadCV,
        setCurrentCV,
        createCV,
        saveCV,
        deleteCV,
        duplicateCV,
        reorderSections,
        printCV,
        downloadPDF,
      }}
    >
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};
