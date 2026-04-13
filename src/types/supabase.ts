// ─── Enums & Aliases ─────────────────────────────────────────

export type UserRole = 'candidate' | 'employer';

export type EngagementStage =
  | 'discovered' | 'contacted' | 'interviewing'
  | 'decision' | 'hired' | 'rejected';

export type PerformanceBand = 'top' | 'mid' | 'low';

export type DepartureType = 'voluntary' | 'involuntary' | 'role_change';

export type Cohort = 'active' | 'departed';

export type IntakeFormat =
  | 'diametric' | 'anchored_scale' | 'ranked'
  | 'free_text' | 'multi_select';

// ─── Trait Types ─────────────────────────────────────────────

export type TraitDimensions = {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
};

export type MotivationalFitSubDimensions = {
  motivational_fit_mastery: number;
  motivational_fit_impact: number;
  motivational_fit_recognition: number;
  motivational_fit_autonomy: number;
};

export type EmployerWeightings = TraitDimensions; // must sum to 100

export type ScoreData = Partial<TraitDimensions>;

export type LLMScoreEntry = {
  criterion: string;
  score: number;
  dimension: keyof TraitDimensions;
};

// ─── Row Types (match live database) ─────────────────────────

export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  onboarding_complete: boolean;
};

export type Business = {
  id: string;
  created_at: string;
  owner_id: string;
  name: string;
  industry: string | null;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
};

export type EmployerTraitWeighting = {
  id: string;
  created_at: string;
  superseded_at: string | null;
  business_id: string;
  role_template: string | null;
} & EmployerWeightings;

export type CandidateProfile = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: string | null;
  location: string | null;
  work_rights: string | null;
  availability: string | null;
  notice_period: string | null;
  salary_min: number | null;
  salary_currency: string | null;
  experience_years: number | null;
  current_situation: string | null;
  industry_background: string[] | null;
  open_to_industries: boolean | null;
  preferred_work_type: string[] | null;
  preferred_role_types: string[] | null;
  org_size_preference: string | null;
  open_to_contract: string | null;
  education_summary: string | null;
  experience_narrative: string | null;
  enjoyed_most: string | null;
  one_thing_to_know: string | null;
  strength_1: string | null;
  strength_2: string | null;
  strength_3: string | null;
  working_context: string | null;
  testimonial_name: string | null;
  testimonial_relation: string | null;
  testimonial_text: string | null;
  open_context: string | null;
  // Trait scores (merged from former applicant_trait_scores)
  learning_velocity: number | null;
  ownership_follow_through: number | null;
  resilience: number | null;
  communication_confidence: number | null;
  relational_intelligence: number | null;
  motivational_fit_mastery: number | null;
  motivational_fit_impact: number | null;
  motivational_fit_recognition: number | null;
  motivational_fit_autonomy: number | null;
  // Intake tracking
  intake_status: string | null;
  published: boolean | null;
};

export type IntakeResponse = {
  id: string;
  created_at: string;
  candidate_id: string;        // was applicant_id
  section: number;
  question_key: string;         // was question_id
  format: IntakeFormat;
  response_value: string | null;
  response_array: string[] | null;
  score_data: ScoreData | null;
  llm_score: LLMScoreEntry[] | null;
  time_spent_sec: number | null;
};

export type Role = {
  id: string;
  created_at: string;
  business_id: string;
  title: string;
  role_type: string | null;
  seniority: string | null;
  location: string | null;
  description: string | null;
  status: 'open' | 'paused' | 'closed';
  assessment_link_token: string | null;
};

export type Engagement = {
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;        // was applicant_id
  business_id: string;
  role_id: string | null;
  source: string | null;
  stage: EngagementStage;
  match_score: number | null;
  employer_notes: string | null;
  departure_date: string | null;
  departure_type: DepartureType | null;
  cohort: Cohort | null;
  role_type: string | null;
  hired_at: string | null;
};

export type PerformanceSnapshot = {
  id: string;
  created_at: string;
  engagement_id: string;       // was hiring_decision_id
  snapshot_day: number | null;  // was snapshot_type; values: 30 or 90
  performance_band: PerformanceBand | null;
  would_rehire: boolean | null;
  learning_velocity: number | null;
  ownership_follow_through: number | null;
  resilience: number | null;
  communication_confidence: number | null;
  relational_intelligence: number | null;
  motivational_fit: number | null;
  notes: string | null;
};

export type RoleTemplate = {
  id: string;
  name: string;
  category: string;
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
  motivation_signal: string;
  is_system: boolean;
};

export type CalibrationVersion = {
  id: string;
  business_id: string;
  version_number: number;
  output_quality_criteria: string | null;
  ownership_criteria: string | null;
  team_contribution_criteria: string | null;
  growth_trajectory_criteria: string | null;
  kpi_targets: string | null;
  created_at: string;
  created_by: string;
  superseded_at: string | null;
};

export type RoleConditionSnapshot = {
  id: string;
  engagement_id: string;
  snapshot_quarter: number;
  snapshot_date: string;
  mastery_conditions: number | null;
  impact_conditions: number | null;
  recognition_conditions: number | null;
  autonomy_conditions: number | null;
  submitted_by: string;
  created_at: string;
};

// ─── Helpers ─────────────────────────────────────────────────

export const normaliseConditions = (rating: number): number =>
  ((rating - 1) / 4) * 100;

export const getGapStatus = (gap: number) =>
  gap <= 15 ? 'aligned' : gap <= 30 ? 'watch' : 'at-risk';
