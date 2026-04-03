// ============================================================
// CMe Platform — Spec 1: Core TypeScript Types
// Version: v1.0
// These types are referenced across all components.
// Do not rename fields without updating all downstream specs.
// ============================================================

// ─── Trait Dimensions ───────────────────────────────────────
// The six primary dimensions used across every table that
// stores trait data. Use exactly these names — no abbreviations.

export type TraitDimensions = {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
};

// ─── Motivational Fit Sub-Dimensions ────────────────────────
// Scored at the candidate level (1–100).
// Employer weights motivational_fit as a single dimension.

export type MotivationalFitSubDimensions = {
  motivational_fit_mastery: number;
  motivational_fit_impact: number;
  motivational_fit_recognition: number;
  motivational_fit_autonomy: number;
};

// ─── Applicant Trait Scores ──────────────────────────────────
// Full score set for a candidate — all six primary dimensions
// plus all four motivational fit sub-dimensions.

export type ApplicantTraitScores = TraitDimensions & MotivationalFitSubDimensions;

// ─── Employer Weightings ─────────────────────────────────────
// Mirrors TraitDimensions — all six values must sum to 100,
// each individual value >= 5.

export type EmployerWeightings = TraitDimensions; // must sum to 100

// ─── Enum-style union types ──────────────────────────────────

export type PerformanceBand = 'top' | 'middle' | 'low';

export type EngagementStage =
  | 'discovered'
  | 'contacted'
  | 'interviewing'
  | 'decision'
  | 'closed';

export type HiringOutcome = 'shortlisted' | 'hired' | 'rejected';

export type UserRole = 'applicant' | 'employer';

export type IntakeFormat =
  | 'diametric'
  | 'anchored_scale'
  | 'ranked'
  | 'free_text'
  | 'multi_select';

// ─── LLM Flag (stored in applicant_trait_scores.llm_flags) ──

export type LLMFlag = {
  dimension: keyof TraitDimensions;
  signal: string;
  severity: 'low' | 'medium' | 'high';
};

// ─── Score Data (stored in intake_responses.score_data) ─────
// Partial — not every question scores every dimension.

export type ScoreData = Partial<TraitDimensions>;

// ─── LLM Score (stored in intake_responses.llm_score) ───────
// Rubric output for behavioural task questions.

export type LLMScoreEntry = {
  criterion: string;
  score: number;
  dimension: keyof TraitDimensions;
};

// ─── Row types (mirrors DB tables) ──────────────────────────

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

export type ApplicantProfile = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: 'draft' | 'published' | 'hidden';
  intake_complete: boolean;
  intake_completed_at: string | null;
  location: string | null;
  work_rights: string | null;
  availability: string | null;
  notice_period: string | null;
  salary_min: number | null;
  salary_currency: string;
  experience_years: number | null;
  current_situation: string | null;
  industry_background: string[] | null;
  open_to_industries: boolean;
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
};

export type ApplicantTraitScoreRow = {
  id: string;
  created_at: string;
  updated_at: string;
  applicant_id: string;
  learning_velocity: number | null;
  ownership_follow_through: number | null;
  resilience: number | null;
  communication_confidence: number | null;
  relational_intelligence: number | null;
  motivational_fit_mastery: number | null;
  motivational_fit_impact: number | null;
  motivational_fit_recognition: number | null;
  motivational_fit_autonomy: number | null;
  motivational_fit: number | null;
  sections_complete: number;
  score_version: string;
  llm_flags: LLMFlag[] | null;
};

export type IntakeResponse = {
  id: string;
  created_at: string;
  applicant_id: string;
  section: number;
  question_id: string;
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
  applicant_id: string;
  business_id: string;
  role_id: string | null;
  source: 'assessment_link' | 'employer_search' | 'direct' | null;
  stage: EngagementStage;
  match_score: number | null;
  employer_notes: string | null;
};

export type HiringDecision = {
  id: string;
  created_at: string;
  engagement_id: string;
  outcome: HiringOutcome;
  decision_date: string | null;
  manager_notes: string | null;
};

export type PerformanceSnapshot = {
  id: string;
  created_at: string;
  hiring_decision_id: string;
  snapshot_type: '30_day' | '90_day';
  performance_band: PerformanceBand | null;
  would_rehire: boolean | null;
  // manager-rated 1–5 (intentionally different from candidate 1–100)
  learning_velocity: number | null;
  ownership_follow_through: number | null;
  resilience: number | null;
  communication_confidence: number | null;
  relational_intelligence: number | null;
  motivational_fit: number | null;
  notes: string | null;
};
