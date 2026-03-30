1. What We Are Building
CMe is a people intelligence platform that starts with hiring. The core product is a traits-based psychometric assessment tool that creates a longitudinal data feedback loop between candidate evaluation and post-hire performance outcomes.

Strategic framing: 'Workforce insight tool with a marketplace attached' — not a hiring marketplace with better signals. This reframe is deliberate.

Principle	Detail
The moat	Longitudinal, outcome-linked trait data at the business level. A data flywheel competitors cannot replicate quickly. LinkedIn has candidate data but zero post-hire performance data.
The vulnerable window	First 12-18 months. Must lock in employers via workflow stickiness and applicant-side lock-in before incumbents notice.
Platform positioning	CMe measures forward, not backward. Traits, behaviours, and fit — not job titles and CV keywords.
Most defensible element	The inference layer. Requires both outcome-linked data AND a calibration mechanism before it can be trusted.

⛑ Key relationship: Dean Anderson at Kernel Wealth (advisor + early candidate source). Distribution target: Icehouse NZ startup accelerator network. Will is based in Christchurch NZ.

2. Trait Framework — Six Dimensions
All six dimensions are derived from the Big Five / OCEAN model and Self-Determination Theory. These are finalised. Do not change without an explicit redesign conversation.

Dimension	Field name	Plain English definition
Learning Velocity	learning_velocity	How quickly and deeply someone acquires new skills, updates their thinking, and connects ideas across different areas.
Ownership & Follow-Through	ownership_follow_through	Whether someone takes genuine responsibility for outcomes — not just tasks — and follows through on commitments regardless of conditions.
Resilience	resilience	How well someone maintains their effectiveness under pressure, setbacks, and conditions that are harder than expected.
Communication Confidence	communication_confidence	Whether someone communicates directly and clearly, holds their position under social pressure, and raises difficult things when they need to be raised.
Relational Intelligence	relational_intelligence	How accurately someone reads the people and situations around them, and how well they build genuine trust over time.
Motivational Fit	motivational_fit_[sub]	Whether what drives this person aligns with what this role and environment actually offer. Four sub-dimensions: mastery, impact, recognition, autonomy.

Motivational Fit sub-dimensions (Self-Determination Theory):
•	Mastery — driven by craft, depth, and getting better at the work itself
•	Impact — driven by visible effect on outcomes or people around them
•	Recognition — driven by being seen, acknowledged, and valued
•	Autonomy — driven by independence and self-direction over how work gets done

3. Employer Weighting System
100-point allocation across six dimensions. Rules:
•	5% minimum floor per dimension (30 points pre-allocated, 70 free points)
•	Cannot submit until total = exactly 100
•	V1: company-level defaults only (not per-role)

Match score formula: weighted sum of (candidate dimension score × employer weight/100) across all six dimensions, normalised to a percentage.

// Scoring functions
function normalise(rawScore) { return ((rawScore - 1) / 4) * 100; }
function computeDimensionScore(inputs) {
  const mean = inputs.reduce((a,b) => a+b, 0) / inputs.length;
  return Math.round(normalise(mean) * 100) / 100;
}
function computeMatchScore(candidateScores, weights) {
  return Object.keys(weights).reduce((sum, dim) => {
    return sum + (candidateScores[dim] * (weights[dim] / 100));
  }, 0);
}

⛑ Scoring is triggered as a Supabase Edge Function when candidate intake_status is set to 'complete'.

4. Role Templates — 10 Categories
System-level defaults. Employer can customise from any template. Weights shown as percentages.

Role type	Dimension weights	Motivation signals
Sales	Ownership 25%, Resilience 20%, Comm Confidence 20%, Motivational Fit 15%, Learning Velocity 12%, Relational Intelligence 8%	Motivation signals: recognition + impact
Operations	Ownership 32%, Resilience 22%, Learning Velocity 18%, Relational Intelligence 15%, Comm Confidence 8%, Motivational Fit 5%	Motivation signals: mastery + autonomy
Client Services	Relational Intelligence 25%, Motivational Fit 22%, Comm Confidence 20%, Resilience 15%, Ownership 13%, Learning Velocity 5%	Motivation signals: impact + recognition
Marketing/Creative	Learning Velocity 28%, Motivational Fit 22%, Ownership 20%, Comm Confidence 15%, Relational Intelligence 10%, Resilience 5%	Motivation signals: mastery + autonomy
Finance	Ownership 37%, Resilience 18%, Learning Velocity 18%, Relational Intelligence 12%, Comm Confidence 10%, Motivational Fit 5%	Motivation signals: mastery + recognition
Technical/Engineering	Learning Velocity 28%, Ownership 25%, Motivational Fit 20%, Resilience 12%, Comm Confidence 10%, Relational Intelligence 5%	Motivation signals: mastery + autonomy
People & Culture	Relational Intelligence 28%, Motivational Fit 22%, Comm Confidence 20%, Learning Velocity 13%, Ownership 12%, Resilience 5%	Motivation signals: impact + mastery
Leadership/Management	Resilience 22%, Relational Intelligence 22%, Ownership 20%, Comm Confidence 18%, Learning Velocity 13%, Motivational Fit 5%	Motivation signals: impact + recognition
Strategy/Consulting	Learning Velocity 25%, Comm Confidence 22%, Motivational Fit 20%, Ownership 18%, Resilience 10%, Relational Intelligence 5%	Motivation signals: mastery + impact
Admin/Coordination	Ownership 35%, Relational Intelligence 22%, Motivational Fit 18%, Resilience 15%, Comm Confidence 5%, Learning Velocity 5%	Motivation signals: mastery + recognition

5. Candidate Intake Flow
Total target time: 57–73 minutes. Eight phases after account setup. Anti-gaming architecture embedded throughout.

Anti-gaming architecture — three layers
•	Opposing trait axes: each question scores two dimensions that naturally trade off against each other
•	Scrambled written order: the highest-scoring option is never in the same position twice
•	Randomised display order: shuffle options array on mount per session; map scores via option ID, not position

Candidate framing shown before assessment begins:
"Before you start — every answer in this assessment reflects a genuine
 working style that suits different roles and environments.
 There are no universally good or bad answers."

Phase structure
Phase	Time	Purpose
Account setup	4–5 min	Location, availability, work type, salary range, notice period
Section 1	5–7 min	Background narrative — free text, processed by LLM into structured traits
Section 2	7–9 min	How You Work — Format A diametric choices + Format B anchored behaviour scale
Section 3	10–12 min	How You Think — includes LLM-scored behavioural task (Henderson account scenario, 80–150 words)
Section 4	8–10 min	How You Handle Difficulty — resilience, pressure response, setback framing
Section 5	8–10 min	How You Relate to Others — relational intelligence, trust-building, conflict approach
Section 6	8–10 min	What Drives You — includes Format C ranked preference for Motivational Fit sub-dimensions
Section 7	4–5 min	Career Direction — role type preferences, industry interests, work environment
Section 8	3–5 min	Your Profile — review, testimonials, publish choice

Question formats
•	Format A — Diametric choice: two options, no midpoint, each option scores opposing dimensions
•	Format B — Anchored behaviour scale: 1–5 scale with clearly described anchors at each end
•	Format C — Ranked preference: drag-to-rank ordering (used for Motivational Fit sub-dimensions in S6Q3)

Design principles (hard-won, do not violate)
•	Every answer option must describe a legitimate person a reasonable employer might want to hire in some context
•	No answer should sound clearly better than the others — neutrality is non-negotiable
•	Preparation preference does not equal low learning velocity
•	Staying silent on a disagreement can reflect strategic maturity, not low communication confidence
•	Option 1 descriptions must never read as character flaws

LLM rubric scoring (Section 3 behavioural task)
The Henderson account task is scored against four criteria using an LLM rubric:
•	Ownership signal: does the response show genuine responsibility or deflection?
•	Diagnosis quality: does it identify the real cause or symptoms only?
•	Action clarity: is the proposed action specific and deliverable?
•	Relationship awareness: does it consider the impact on the client relationship?

6. Employer Insight Layer — Three-Level Architecture
The insight layer is the platform’s most strategically important feature. It has three distinct levels. Navigation state lives in InsightPage.tsx.

Level	What it contains
Level 1 — Summary	Four panels. High-level signals. Reads in 90 seconds. Always visible from State 1.
Level 2 — Analysis	Drill paths into dimension distributions, cohort comparisons, motivational fit pulse data. Requires State 2+ for most views.
Level 3 — Inference	Platform-generated findings in plain English with explicit confidence. Unlocks progressively. Requires calibration gates.

Data states
State	What is available
State 1	Fewer than 5 performance snapshots. Summary + pipeline only. Level 3 locked entirely.
State 2	5–14 snapshots. Early directional signals. All levels visible; inference marked as 'early signal'.
State 3	15+ snapshots. Full correlations with confidence intervals. Inference findings unlock.

Level 1 — Four summary panels

Panel	What it shows
Panel 1 — Hiring Profile	Radar chart. Three layers: employer weighting (what you're hiring for) vs hired average (who you've brought in) vs top performer average (State 3 only). Divergence callout if any dimension differs >15 points between weighting and hired average.
Panel 2 — Performance Correlations	Grouped bar chart. Three bars per dimension: average intake score for top/mid/low performance bands. Confidence stated explicitly. Locks until State 2.
Panel 3 — Pipeline Snapshot	Real-time candidate cards sorted by match score. Stage label, match %, days in stage. Stale flag if >7 days in same stage. Always live.
Panel 4 — Motivational Fit Watch	Two-source architecture. See detailed spec below. Locks until first pulse check submitted.

Panel 4 — Motivational Fit Watch: two-source architecture
Critical design decision: managers cannot observe internal motivational states directly. Their ratings are not on the same scale as intake scores. Panel 4 uses TWO triangulated sources.

Source 1 — Candidate pulse check (PRIMARY signal):
At 30 days and 90 days post-hire, candidate receives a 4-question check-in (1–5 scale):
•	Mastery: 'How often are you encountering genuinely new challenges that stretch your thinking?'
•	Impact: 'How clearly can you see the effect of your work on outcomes or people around you?'
•	Recognition: 'How well does the feedback and acknowledgment you receive match what motivates you?'
•	Autonomy: 'How much genuine independence do you have over how you approach your work?'

Source 2 — Manager behavioural observation (SECONDARY signal):
Manager rates OBSERVABLE BEHAVIOURS ONLY — not motivational interpretations. Four corresponding behaviour ratings (1–5 scale).

Alignment logic:
gap = intakeScore - normalisedPulseScore
gap <= 15  → aligned (green)
gap 16-30  → watch (amber)
gap > 30   → at-risk (red)

⛑ Panel 4 waits for BOTH sources (candidate pulse + manager observation) before showing the alignment indicator. Panel shows 'Waiting for 30-day check-in' until both are submitted.

High performer calibration mechanism
Three-component system that protects the integrity of Level 3 inference data:

Component 1 — Calibration prompt (employer onboarding):
During onboarding, employer defines top performance via four structured observable behavioural criteria (output quality, ownership, team contribution, growth trajectory). Stored in performance_calibrations table.

Component 2 — Forced distribution nudge:
If more than 40% of hires are rated 'top', Level 3 surfaces an advisory prompt before showing findings.

Component 3 — Relative performance flag:
Tracks relative rank alongside absolute band. Computed on-the-fly; not persisted.

Level 3 — Inference language rules (non-negotiable)
✓ Always state findings in plain English before showing data. Sentence first, chart second.
✓ Always state confidence explicitly: 'Based on X performance snapshots' on every finding.
✓ In State 2: prefix all directional findings with 'Early signal:' or 'Based on early data:'.
✓ In State 3: use 'Based on your data:' for reliable patterns. Never 'research shows' or 'typically'.
⚠️  Never say 'always', 'definitely', or 'predicts' unless the data strongly supports it. Use: 'associated with', 'tend to', 'in your data'.
⚠️  All findings are derived from the employer's own data. Never reference global benchmarks.

7. Supabase Schema — Key Tables

Table	Key fields
profiles	Extends auth.users. Fields: id, role (candidate|employer), full_name, avatar_url, created_at
businesses	owner_id (FK profiles), name, industry, size, created_at
employer_trait_weightings	business_id (unique). Six weight fields (min 5 each). Constraint: weights must sum to 100.
role_templates	10 system templates. Fields: id, name, description, plus 6 dimension weight fields.
candidate_profiles	user_id (unique). All filtering fields (location, availability, work_type, etc.). Nine trait score fields (numeric 5,2). intake_status ('draft'|'complete'). published boolean.
intake_responses	candidate_id, section (1-8), question_key (e.g. 'S2Q1'), response_value (text), response_scores (jsonb storing dimension score contributions).
engagements	business_id + candidate_id (unique together). stage enum (discovered|contacted|interviewing|decision|hired|rejected). match_score (numeric).
performance_snapshots	engagement_id, snapshot_day (30|90). Six dimension ratings (1-5). performance_band ('top'|'mid'|'low'). would_rehire boolean. notes text.
motivational_pulse_checks	NEW — see schema below. Required for Panel 4. Candidate-side pulse + manager behavioural observations.
performance_calibrations	NEW — see schema below. Required for Level 3. Employer-defined top performer criteria.

New table: motivational_pulse_checks
create table public.motivational_pulse_checks (
  id uuid default gen_random_uuid() primary key,
  engagement_id uuid references public.engagements(id) on delete cascade,
  snapshot_day integer check (snapshot_day in (30, 90)),
  -- Candidate pulse check (Source 1)
  mastery_rating integer check (mastery_rating between 1 and 5),
  impact_rating integer check (impact_rating between 1 and 5),
  recognition_rating integer check (recognition_rating between 1 and 5),
  autonomy_rating integer check (autonomy_rating between 1 and 5),
  submitted_by text check (submitted_by = 'candidate'),
  -- Manager behavioural observation (Source 2)
  mastery_behaviour_rating integer check (mastery_behaviour_rating between 1 and 5),
  impact_behaviour_rating integer check (impact_behaviour_rating between 1 and 5),
  recognition_behaviour_rating integer check (recognition_behaviour_rating between 1 and 5),
  autonomy_behaviour_rating integer check (autonomy_behaviour_rating between 1 and 5),
  manager_submitted boolean default false,
  created_at timestamptz default now(),
  unique(engagement_id, snapshot_day)
);
create index idx_pulse_checks_engagement on motivational_pulse_checks(engagement_id);
create index idx_pulse_checks_day on motivational_pulse_checks(engagement_id, snapshot_day);

New table: performance_calibrations
create table public.performance_calibrations (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  output_quality_criteria text,
  ownership_criteria text,
  team_contribution_criteria text,
  growth_trajectory_criteria text,
  updated_at timestamptz default now()
);

8. Six Cursor Build Spec Files
Apply specs in order. Specs 1 and 3 need updates before any implementation begins.

Spec	Status & location
Spec 1 — Data Schema	SQL migration + TypeScript types + role template seed data. STATUS: NEEDS UPDATE — add motivational_pulse_checks + performance_calibrations tables + indexes. File: /mnt/user-data/outputs/CMe-Spec-1-Data-Schema.docx
Spec 2 — Weighting UI	TraitWeightingUI component (src/components/employer-pages/TraitWeightingUI.tsx). 100-point allocation, 5% floor, live constraint feedback. STATUS: COMPLETE. File: /mnt/user-data/outputs/CMe-Spec-2-Weighting-UI.docx
Spec 3 — Role Templates	RoleTemplatePicker + 4-step employer onboarding flow. STATUS: NEEDS UPDATE — add calibration prompt step to employer onboarding. File: /mnt/user-data/outputs/CMe-Spec-3-Role-Templates.docx
Spec 4 — Intake Flow	IntakeFlow parent + all question formats + score maps + LLM rubric + scoring Edge Function. STATUS: COMPLETE. File: /mnt/user-data/outputs/CMe-Spec-4-Intake-Flow.docx
Spec 5 — Match Scoring	matchScoring.ts lib + CandidateCard + assessment link flow (for cold-start via Kernel). STATUS: COMPLETE. File: /mnt/user-data/outputs/CMe-Spec-5-Match-Scoring.docx
Spec 6 — Insight Layer v2	InsightPage three-level architecture. SUPERSEDES v1. STATUS: COMPLETE — spec6.js written but docx needs to be generated from it. Source: /home/claude/cme-spec6/spec6.js Target: /mnt/user-data/outputs/CMe-Spec-6-Insight-Layer-v2.docx

New files required by Spec 6
•	src/components/employer-pages/InsightPage.tsx — top-level with level state + panel drill state
•	src/components/employer-pages/insights/AnalysisView.tsx — Level 2 with three sub-views
•	src/components/employer-pages/insights/views/DimensionDrill.tsx — score distribution per dimension
•	src/components/employer-pages/insights/views/CohortComparison.tsx — two-period intake score comparison
•	src/components/employer-pages/insights/views/MotivationalPulse.tsx — intake vs pulse vs manager observation
•	src/components/employer-pages/insights/InferenceView.tsx — Level 3 plain English findings
•	src/lib/inferenceEngine.ts — pattern detection and confidence scoring

9. Tech Stack & Design System
Element	Value
Frontend	React + TypeScript + Tailwind CSS
Icons	lucide-react (strokeWidth={2}, w-4 h-4 inline, w-5 h-5 buttons)
Charts	recharts
State	React Context API — no Redux/Zustand. Context file: /contexts/UserProfileContext.tsx
Backend	Supabase (auth, database, edge functions)
Design inspiration	Notion, Linear, Webflow dashboards — modern minimal light-themed CRM interface
Primary accent	#7DBBFF (blue) — CTAs, active states, highlights
Success	#10B981 (green) — interview status, positive actions
Warning	#F59E0B (orange) — shortlisted, pending
Neutral	#6B7280 (gray) — secondary text, inactive
Text primary	#111827 | Text secondary: #6B7280 | Text muted: #9CA3AF
Background	#FFFFFF cards | #F9F9FA subtle | rgba(0,0,0,0.08) borders
Border radius	Badges 6-8px | Buttons/inputs 10-12px | Cards 12-14px | Modals 16-20px

10. Progress Log

Completed
✓ Six-dimension trait framework with Big Five / SDT grounding and plain English definitions
✓ Employer 100-point weighting system with 5% floor and 70 free points
✓ Ten role templates with research-backed default weightings and motivation signals
✓ Complete candidate intake flow — all 8 sections designed, formats defined, LLM rubric specified
✓ Anti-gaming architecture — opposing axes, scrambled written order, randomised display order
✓ Spec 1: Data schema, TypeScript types, role template seed data (needs two new tables added)
✓ Spec 2: TraitWeightingUI component fully specified
✓ Spec 3: RoleTemplatePicker + employer onboarding (needs calibration step added)
✓ Spec 4: IntakeFlow — all question formats, score maps, LLM rubric, scoring Edge Function
✓ Spec 5: matchScoring.ts lib + CandidateCard + assessment link (cold-start via Kernel)
✓ Spec 6 v2: three-level insight layer — full architecture, Panel 4 two-source design, inference engine
✓ Panel 4 two-source motivational fit architecture fully designed and specced
✓ High performer calibration mechanism fully designed and specced
✓ Insight framework thesis document (9 sections)
✓ Interactive React mockup of three-level insight layer

Pending — immediate next actions
⏳ NEXT: Generate Spec 6 v2 docx from /home/claude/cme-spec6/spec6.js — run: cd /home/claude/cme-spec6 && node spec6.js, then copy to /mnt/user-data/outputs/
⏳ NEXT: Update Spec 1 to add motivational_pulse_checks + performance_calibrations tables + both indexes
⏳ NEXT: Update Spec 3 to add calibration prompt step to employer onboarding flow

Pending — future build items
⚠️  Candidate-facing pulse check submission UI — 4-question form sent via link at 30 and 90 days post-hire. NOT in Spec 6 scope. Separate build item.
⚠️  Performance snapshot trigger automation — 30/90 day reminder emails to employer
⚠️  Actual Cursor implementation of all six specs in order (Specs 1 and 3 updates first)
⚠️  V2 features: per-role trait weighting, KPI integrations, cross-business benchmarking, ML-driven inference

11. Key Context & Preferences

Context item	Detail
Will's background	Commercial insurance broker, Christchurch NZ. Brings real-world hiring observation and advisory lens to product decisions.
Working style	Pressure-tests ideas rigorously before deciding. Wants precise, decision-capturing outputs. Runs parallel Claude conversations by workstream.
Cursor usage	Active build in Cursor using agent mode with Tailwind CSS. Prefers a pre-confirmation step before destructive changes: 'Show me the specific line you plan to delete before making any changes.'
Output preference	Structured docx spec documents after design sessions. Clean final versions, not working drafts.
Prompt style	Precise surgical prompting in Cursor agent mode. Values understanding WHY certain phrasing works.
Cold-start solution	Assessment links sent via Dean at Kernel to candidates. Seeds data before employer onboarding at scale.
Competitive threats	HireVue, Pymetrics/Harver, Predictive Index, Sapia.ai. NOT LinkedIn.
Component files in use	DashboardPage.tsx, CompaniesPage.tsx, CareerReadinessPage.tsx, profile builder step files, ApplicantScreen.tsx, EmployerScreen.tsx, OverviewScreen.tsx

12. Exact Next Task — Where to Resume

The session ended immediately after writing spec6.js. The docx was not generated. The three immediate tasks in priority order:

Task 1 — Generate Spec 6 v2 docx (5 minutes)
cd /home/claude/cme-spec6 && node spec6.js
cp /home/claude/cme-spec6/CMe-Spec-6-Insight-Layer-v2.docx /mnt/user-data/outputs/
Then present_files the output so Will can download it.

Task 2 — Update Spec 1 to add two new tables
Open /mnt/user-data/outputs/CMe-Spec-1-Data-Schema.docx. Add a new section after the existing schema tables titled 'v2 Additions'. Include:
•	Full CREATE TABLE statement for motivational_pulse_checks (see Section 7 above)
•	Full CREATE TABLE statement for performance_calibrations (see Section 7 above)
•	Both indexes for motivational_pulse_checks
•	Updated TypeScript types file (src/types/cme.ts) additions for both tables

Task 3 — Update Spec 3 to add calibration prompt step
Open /mnt/user-data/outputs/CMe-Spec-3-Role-Templates.docx. Add a new onboarding step (Step 4 of 4) for the calibration prompt:
•	Step title: 'Define what great looks like'
•	Framing: 'This helps CMe learn what top performance means specifically in your environment, not in general.'
•	Four free-text fields: output quality criteria, ownership criteria, team contribution criteria, growth trajectory criteria
•	Each field has an example placeholder to guide completion
•	Stores to: performance_calibrations table (INSERT or UPSERT on business_id)

⛑ After Tasks 1-3 are complete, all six specs are ready for implementation in Cursor. Apply in order: 1 → 2 → 3 → 4 → 5 → 6.
