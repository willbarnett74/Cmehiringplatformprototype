import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfileData {
  // Foundation Overview
  motivation_tags: string[];
  work_style_selection: 'Analytical' | 'Collaborative' | 'Creative' | 'Balanced' | null;
  
  // Experience & Work History
  experience_level: string | null;
  industries: string[];
  total_experience: number | null; // Total years of work experience
  
  // Career Readiness & Growth
  is_transitioning: boolean; // Career transition or returner
  open_to_change: boolean; // Open to career change
  ready_to_step_up: boolean; // Ready to step up to next level
  recently_retrained: boolean; // Recently retrained or reskilled
  
  // Career Direction
  career_focus: string | null;
  
  // Deeper Insights
  adaptability_tag: 'High' | 'Moderate' | 'Structured' | null;
  decision_style: 'Data-Driven' | 'Intuitive' | 'Collaborative' | 'Balanced' | null;
  communication_style: 'Direct' | 'Thoughtful' | 'Visual' | 'Facilitative' | null;
  
  // Skills & Testing
  cognitive_score: number | null;
  
  // Meta
  profile_complete: boolean;
}

interface UserProfileContextType {
  profileData: UserProfileData;
  updateProfileData: (updates: Partial<UserProfileData>) => void;
  resetProfile: () => void;
}

const defaultProfileData: UserProfileData = {
  motivation_tags: [],
  work_style_selection: null,
  experience_level: null,
  industries: [],
  total_experience: null,
  is_transitioning: false,
  open_to_change: false,
  ready_to_step_up: false,
  recently_retrained: false,
  career_focus: null,
  adaptability_tag: null,
  decision_style: null,
  communication_style: null,
  cognitive_score: null,
  profile_complete: false,
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<UserProfileData>(defaultProfileData);

  const updateProfileData = (updates: Partial<UserProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfileData(defaultProfileData);
  };

  return (
    <UserProfileContext.Provider value={{ profileData, updateProfileData, resetProfile }}>
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