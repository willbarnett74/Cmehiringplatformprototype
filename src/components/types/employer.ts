export interface Candidate {
  id: number;
  name: string;
  role: string;
  location: string;
  level: string;
  traits: string[];
  score: number;
  stage: 'newSignals' | 'assessmentSent' | 'finalRound' | 'hired' | 'declined';
  aiMatchPercent?: number;
  totalExperience?: number; // Total years of work experience
  transitioning?: boolean; // Career transition or returner status
  openToChange?: boolean; // Open to career change
  readyToStepUp?: boolean; // Ready to step up to next level
  retrained?: boolean; // Recently retrained or reskilled
}

export type Section = 'dashboard' | 'search' | 'candidates' | 'insights' | 'settings';