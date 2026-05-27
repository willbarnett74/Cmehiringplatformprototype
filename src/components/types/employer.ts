import type { CandidateDimensionScores, DimensionScores } from '../../utils/intakeScoreAggregate';

// ─── candidate_profiles (trait score columns merged from former applicant_trait_scores) ───
export interface CandidateProfile {
  id: number; // maps to candidate_profiles.id in DB
  candidate_id?: number; // alias kept for explicit DB references
  name: string;
  role: string;
  location: string;
  level: string;
  traits: string[];
  score: number;
  // Engagement stage — outcomes (hired/rejected) live on engagements.stage
  stage: 'discovered' | 'contacted' | 'interviewing' | 'decision' | 'hired' | 'rejected';
  daysInStage?: number;
  availability?: string;
  noticePeriod?: string;
  hired_date?: string; // ISO date string — set when stage moves to 'hired'
  aiMatchPercent?: number;
  totalExperience?: number; // Total years of work experience
  transitioning?: boolean; // Career transition or returner status
  openToChange?: boolean; // Open to career change
  readyToStepUp?: boolean; // Ready to step up to next level
  retrained?: boolean; // Recently retrained or reskilled
  // Trait scores (columns on candidate_profiles)
  traitScores?: {
    adaptability?: number;
    decisionMaking?: number;
    communication?: number;
    cognitiveAgility?: number;
    collaboration?: number;
    ownership?: number;
  };
  /** Same shape as applicant `UserProfileData.trait_scores` / intake `DimensionScores` (nine keys). */
  trait_scores?: DimensionScores | null;
  /** Spec 1 dimensions + aggregate motivational fit — used by match scoring and employer cards. */
  dimensionScores?: CandidateDimensionScores;
  // ISO timestamp of last stage change — used to compute days in current stage
  stageUpdatedAt?: string;
  /** UUID string — same as candidate_profiles.id in Supabase */
  profileId?: string;
  email?: string | null;
  avatarUrl?: string | null;
  currentCompany?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  certifications?: string | null;
  workRights?: string | null;
  salaryMin?: number | null;
  salaryCurrency?: string | null;
  currentSituation?: string | null;
  educationSummary?: string | null;
  experienceNarrative?: string | null;
  enjoyedMost?: string | null;
  oneThingToKnow?: string | null;
  strength1?: string | null;
  strength2?: string | null;
  strength3?: string | null;
  workingContext?: string | null;
  testimonialName?: string | null;
  testimonialRelation?: string | null;
  testimonialText?: string | null;
  openContext?: string | null;
  preferredRoleTypes?: string[] | null;
  preferredWorkType?: string[] | null;
  orgSizePreference?: string | null;
  industryBackground?: string[] | null;
  openToIndustries?: boolean | null;
  openToContract?: string | null;
  intakeComplete?: boolean | null;
  profileCompleteness?: number;
}

// Backward-compatible alias — existing components reference `Candidate`
export type Candidate = CandidateProfile;

// ─── engagements (stage + outcome; former hiring_decisions table removed) ───
export interface Engagement {
  engagement_id: number;
  candidate_id: number; // FK → candidate_profiles.candidate_id
  role_template_id?: number; // FK → role_templates.id
  stage: 'discovered' | 'contacted' | 'interviewing' | 'decision' | 'hired' | 'rejected';
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

// ─── performance_snapshots ───
export interface PerformanceSnapshot {
  id: number;
  engagement_id: number;
  snapshot_day: 30 | 90;
  learning_velocity_rating: number;
  ownership_rating: number;
  resilience_rating: number;
  communication_confidence_rating: number;
  relational_intelligence_rating: number;
  motivational_fit_rating: number;
  performance_band: 'Top' | 'Mid' | 'Low';
  would_rehire: boolean;
  notes?: string;
  submitted_at: string;
}

// ─── motivational_pulse_checks ───
export interface MotivationalPulseCheck {
  id: number;
  engagement_id: number;
  snapshot_day: 30 | 90;
  mastery_rating?: number;
  impact_rating?: number;
  recognition_rating?: number;
  autonomy_rating?: number;
  candidate_submitted: boolean;
  mastery_behaviour_rating?: number;
  impact_behaviour_rating?: number;
  recognition_behaviour_rating?: number;
  autonomy_behaviour_rating?: number;
  manager_submitted: boolean;
  submitted_at?: string;
}

// ─── intake_responses (candidate_id → candidate_profiles.id) ───
export interface IntakeResponse {
  id: number;
  candidate_id: number; // FK → candidate_profiles.id
  question_key: string;
  response_value: string;
  submitted_at?: string;
}

export type Section = 'dashboard' | 'search' | 'candidates' | 'insights' | 'settings';