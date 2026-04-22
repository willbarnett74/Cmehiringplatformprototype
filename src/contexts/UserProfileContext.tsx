import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { DimensionScores } from '../utils/intakeScoring';

// Intake response structure for all 8 sections
export interface IntakeData {
  section1?: any;
  section2?: any;
  section3?: any;
  section4?: any;
  section5?: any;
  section6?: any;
  section7?: any;
  section8?: any;
  completedSections: number[];
  isComplete: boolean;
}

// User profile data mapped to candidate_profiles table
export interface UserProfileData {
  // Intake Flow Completion Status
  intakeData: IntakeData;
  
  // 9-Dimension Trait Scores (from Sections 2-6)
  trait_scores: DimensionScores | null;

  cognitive_score?: number;
  work_style_selection?: string;
  adaptability_tag?: string;
  decision_style?: string;
  communication_style?: string;
  total_experience?: number | null;
  isComplete?: boolean;
  is_transitioning?: boolean;
  open_to_change?: boolean;
  ready_to_step_up?: boolean;
  recently_retrained?: boolean;
  motivation_tags?: string[];
  
  // Section 7 - Career Direction Preferences
  career_preferences: {
    what_looking_for?: string;
    growth_direction?: string;
    industry_openness?: string[];
    role_type_preference?: string[];
    employment_preferences?: {
      location?: string[];
      work_arrangement?: string[];
      company_size?: string[];
      salary_range?: string;
    };
  };
  
  // Section 8 - Profile Information
  profile_info: {
    strengths?: string[];
    working_context?: string;
    testimonial?: {
      name: string;
      relationship: string;
      quote: string;
    };
    anything_else?: string;
    optional_fields_completed?: boolean;
  };
  
  // Meta
  profile_complete: boolean;
  last_updated: Date | null;
}

interface UserProfileContextType {
  profileData: UserProfileData;
  updateProfileData: (updates: Partial<UserProfileData>) => void;
  updateIntakeSection: (section: number, data: any) => void;
  updateTraitScores: (scores: DimensionScores) => void;
  markIntakeComplete: () => void;
  resetProfile: () => void;
  /** Replace full profile (e.g. after loading from Supabase). */
  replaceProfileData: (next: UserProfileData) => void;
}

const defaultIntakeData: IntakeData = {
  completedSections: [],
  isComplete: false,
};

const defaultProfileData: UserProfileData = {
  intakeData: defaultIntakeData,
  trait_scores: null,
  career_preferences: {},
  profile_info: {},
  profile_complete: false,
  last_updated: null,
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<UserProfileData>(defaultProfileData);

  const updateProfileData = (updates: Partial<UserProfileData>) => {
    setProfileData((prev) => ({ 
      ...prev, 
      ...updates,
      last_updated: new Date(),
    }));
  };

  const updateIntakeSection = (section: number, data: any) => {
    setProfileData((prev) => {
      const updatedIntakeData = {
        ...prev.intakeData,
        [`section${section}`]: data,
        completedSections: prev.intakeData.completedSections.includes(section)
          ? prev.intakeData.completedSections
          : [...prev.intakeData.completedSections, section].sort(),
      };

      return {
        ...prev,
        intakeData: updatedIntakeData,
        last_updated: new Date(),
      };
    });
  };

  const updateTraitScores = (scores: DimensionScores) => {
    setProfileData((prev) => ({
      ...prev,
      trait_scores: scores,
      last_updated: new Date(),
    }));
  };

  const markIntakeComplete = () => {
    setProfileData((prev) => ({
      ...prev,
      intakeData: {
        ...prev.intakeData,
        isComplete: true,
      },
      profile_complete: true,
      last_updated: new Date(),
    }));
  };

  const resetProfile = () => {
    setProfileData(defaultProfileData);
  };

  const replaceProfileData = useCallback((next: UserProfileData) => {
    setProfileData(next);
  }, []);

  return (
    <UserProfileContext.Provider 
      value={{ 
        profileData, 
        updateProfileData, 
        updateIntakeSection,
        updateTraitScores,
        markIntakeComplete,
        resetProfile,
        replaceProfileData,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
}
