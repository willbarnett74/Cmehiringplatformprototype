// ─── candidate_profiles (merged from applicant_profiles + applicant_trait_scores) ───
export interface CandidateProfile {
  id: number; // maps to candidate_id in DB (reconciled from applicant_id)
  candidate_id?: number; // alias kept for explicit DB references
  name: string;
  role: string;
  location: string;
  level: string;
  traits: string[];
  score: number;
  // Engagement stage — outcomes (hired/rejected) live on the engagement, not a separate hiring_decisions table
  stage: 'newSignals' | 'assessmentSent' | 'finalRound' | 'hired' | 'rejected';
  aiMatchPercent?: number;
  totalExperience?: number; // Total years of work experience
  transitioning?: boolean; // Career transition or returner status
  openToChange?: boolean; // Open to career change
  readyToStepUp?: boolean; // Ready to step up to next level
  retrained?: boolean; // Recently retrained or reskilled
  // Trait scores (merged from applicant_trait_scores into candidate_profiles)
  traitScores?: {
    adaptability?: number;
    decisionMaking?: number;
    communication?: number;
    cognitiveAgility?: number;
    collaboration?: number;
    ownership?: number;
  };
}

// Backward-compatible alias — existing components reference `Candidate`
export type Candidate = CandidateProfile;

// ─── engagements (replaces hiring_decisions; stage + outcome live here) ───
export interface Engagement {
  engagement_id: number;
  candidate_id: number; // FK → candidate_profiles.candidate_id
  role_template_id?: number; // FK → role_templates.id
  stage: 'newSignals' | 'assessmentSent' | 'finalRound' | 'hired' | 'rejected';
  outcome?: 'hired' | 'rejected' | null;
  created_at?: string;
  updated_at?: string;
}

// ─── role_templates (new seed table) ───
export interface RoleTemplate {
  id: number;
  title: string;
  department?: string;
  required_traits: string[];
  weight_config?: Record<string, number>; // trait → weight
  created_at?: string;
}

// ─── performance_calibration_versions (new seed table) ───
export interface PerformanceCalibrationVersion {
  id: number;
  version_label: string;
  calibration_date: string;
  parameters: Record<string, unknown>;
  is_active: boolean;
}

// ─── role_condition_snapshots (new seed table) ───
export interface RoleConditionSnapshot {
  id: number;
  role_template_id: number; // FK → role_templates.id
  calibration_version_id: number; // FK → performance_calibration_versions.id
  condition_data: Record<string, unknown>;
  snapshot_date: string;
}

// ─── employer_trait_weightings (new table for trait allocation) ───
export interface EmployerTraitWeightings {
  id: number;
  employer_id?: number; // FK → employers table
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
  created_at?: string;
  updated_at?: string;
}

// ─── performance_snapshots (re-linked from hiring_decisions → engagements) ───
export interface PerformanceSnapshot {
  id: number;
  engagement_id: number; // FK → engagements.engagement_id (was hiring_decisions)
  metric_label: string;
  metric_value: number;
  recorded_at: string;
}

// ─── intake_responses (FK updated: applicant_id → candidate_id) ───
export interface IntakeResponse {
  id: number;
  candidate_id: number; // FK → candidate_profiles.candidate_id (was applicant_id)
  question_key: string;
  response_value: string;
  submitted_at?: string;
}

export type Section = 'dashboard' | 'search' | 'candidates' | 'insights' | 'settings';