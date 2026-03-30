2. Trait Framework — Six Dimensions
All six dimensions are derived from the Big Five / OCEAN model and Self-Determination Theory. Finalised. Do not change without an explicit redesign conversation.

Dimension	Field name	Plain English definition
Learning Velocity	learning_velocity	How quickly and deeply someone acquires new skills, updates their thinking, and connects ideas across different areas.
Ownership & Follow-Through	ownership_follow_through	Whether someone takes genuine responsibility for outcomes — not just tasks — and follows through regardless of conditions.
Resilience	resilience	How well someone maintains their effectiveness under pressure, setbacks, and conditions that are harder than expected.
Communication Confidence	communication_confidence	Whether someone communicates directly and clearly, holds their position under social pressure, and raises difficult things when needed.
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

⛑ Scoring triggered as Supabase Edge Function when candidate intake_status is set to 'complete'.

Role Templates — 10 Categories
Role type	Dimension weights	Motivation signals
Sales	Ownership 25%, Resilience 20%, Comm Confidence 20%, Motivational Fit 15%, Learning Velocity 12%, Relational Intelligence 8%	recognition + impact
Operations	Ownership 32%, Resilience 22%, Learning Velocity 18%, Relational Intelligence 15%, Comm Confidence 8%, Motivational Fit 5%	mastery + autonomy
Client Services	Relational Intelligence 25%, Motivational Fit 22%, Comm Confidence 20%, Resilience 15%, Ownership 13%, Learning Velocity 5%	impact + recognition
Marketing/Creative	Learning Velocity 28%, Motivational Fit 22%, Ownership 20%, Comm Confidence 15%, Relational Intelligence 10%, Resilience 5%	mastery + autonomy
Finance	Ownership 37%, Resilience 18%, Learning Velocity 18%, Relational Intelligence 12%, Comm Confidence 10%, Motivational Fit 5%	mastery + recognition
Technical/Engineering	Learning Velocity 28%, Ownership 25%, Motivational Fit 20%, Resilience 12%, Comm Confidence 10%, Relational Intelligence 5%	mastery + autonomy
People & Culture	Relational Intelligence 28%, Motivational Fit 22%, Comm Confidence 20%, Learning Velocity 13%, Ownership 12%, Resilience 5%	impact + mastery
Leadership/Mgmt	Resilience 22%, Relational Intelligence 22%, Ownership 20%, Comm Confidence 18%, Learning Velocity 13%, Motivational Fit 5%	impact + recognition
Strategy/Consulting	Learning Velocity 25%, Comm Confidence 22%, Motivational Fit 20%, Ownership 18%, Resilience 10%, Relational Intelligence 5%	mastery + impact
Admin/Coordination	Ownership 35%, Relational Intelligence 22%, Motivational Fit 18%, Resilience 15%, Comm Confidence 5%, Learning Velocity 5%	mastery + recognition

4. Candidate Intake Flow — Complete Question Set
Total target time: 57–73 minutes. Eight sections. Anti-gaming architecture embedded throughout. This section contains every question, option text, and score map needed to build and design the full flow in Figma or Cursor.

Anti-Gaming Architecture — Three Layers
•	Layer 1 — Opposing trait axes: each question scores two dimensions that trade off against each other. No option scores high on both simultaneously.
•	Layer 2 — Scrambled written order: the highest-scoring option is never in position A/first across all questions. The written order in the data is already scrambled.
•	Layer 3 — Randomised display order: shuffle options array on mount per session. Map scores via option ID, not array position.

function shuffleOptions(options) {
  return [...options].sort(() => Math.random() - 0.5);
}
// Shuffle once on mount. Stable for the session. Never re-shuffle on re-render.

Candidate Framing (shown before the flow begins)
"Before you start — every answer in this assessment reflects a genuine working style that suits different roles and environments. There are no universally good or bad answers."

Question Formats
Format	Description
Format A — Diametric Choice	Two behavioural descriptions (Person A / Person B). Four response options: Strongly A, Mostly A, Mostly B, Strongly B. No midpoint. Score: StronglyA=1, MostlyA=2, MostlyB=4, StronglyB=5.
Format B — Anchored Behaviour Scale	Four option descriptions each describing a real person. Shuffle on display. Each option has an ID and a score map object. Scores are mapped via ID, not position.
Format C — Ranked Preference	Four items in randomised initial order. Candidate drags to rank. Position scores: 1st=5, 2nd=3, 3rd=2, 4th=1. Used only for S6Q3 (Motivational Fit sub-dimensions).

⚠️  Design rule: every option must describe someone a reasonable employer might want in some context. No option should read as a character flaw. Option A (first written) must never read as a flaw.

Section Overview
Section	Time	Purpose
Account setup	4–5 min	Location, availability, work type, salary range, notice period. No trait scoring.
Section 1 — Background	5–7 min	Free narrative. LLM processes into soft trait signals for consistency check only — NOT primary scoring.
Section 2 — How You Work	7–9 min	5 questions. Primary: Resilience, Motivational Fit sub-dims (Autonomy, Mastery, Recognition). Secondary: Relational Intelligence.
Section 3 — How You Think	10–12 min	5 questions inc. Henderson behavioural task (80–150 words, LLM rubric). Primary: Learning Velocity, Comm Confidence. Secondary: Ownership.
Section 4 — Handling Difficulty	8–10 min	5 questions. Primary: Resilience, Ownership. Secondary: Comm Confidence, Autonomy, Mastery.
Section 5 — Relating to Others	8–10 min	5 questions. Primary: Relational Intelligence, Comm Confidence. Secondary: Ownership, Learning Velocity.
Section 6 — What Drives You	8–10 min	5 questions inc. Format C ranking. Primary: all Motivational Fit sub-dims. Secondary: Impact, Mastery.
Section 7 — Career Direction	4–5 min	5 fields. Employer filtering data: role type pref, growth direction, industry openness, salary, logistics. No trait scoring.
Section 8 — Your Profile	3–5 min	4 fields. Strengths, working context, testimonial, open context. Optional fields completion is a Conscientiousness signal.


Section 1 — Background Narrative
Free text only. No structured questions. Two prompts shown in sequence:

Prompt 1 (required, 80–200 words): "Tell us a bit about yourself — your background, the kind of work you've done, and what you've found you're naturally good at. Don't worry about making it formal — write it how you'd say it."

Prompt 2 (required, 40–120 words): "Describe a time you did something you were genuinely proud of at work or in a project. What was the situation and what did you do?"

⛑ LLM processes both responses into soft trait signals for consistency check against Section 3–6 scores. Not used as primary dimension inputs. Store raw text in intake_responses, section=1.


Section 2 — How You Work (5 questions)

S2Q1  —  Format A — Diametric Choice
Dimensions: motivational_fit_autonomy
[personA]  Person A prefers structure — clear processes, defined expectations, and a role where they know what good looks like and can execute well within it.
       scores: motivational_fit_autonomy: 1
[personB]  Person B prefers autonomy — the freedom to figure out their own approach, set their own pace, and take ownership of how they get things done.
       scores: motivational_fit_autonomy: 5
⛑ StronglyA=1, MostlyA=2, MostlyB=4, StronglyB=5 on autonomy axis.
S2Q2  —  Format A — Diametric Choice
Dimensions: motivational_fit_mastery, motivational_fit_impact
[personA]  At the end of a good day, Person A felt like they got on top of something new — figured out a problem, picked up a skill, finished feeling like they had moved forward.
       scores: motivational_fit_mastery: 5, motivational_fit_impact: 1
[personB]  At the end of a good day, Person B got a lot done — delivered on commitments and was genuinely useful to the people around them.
       scores: motivational_fit_mastery: 1, motivational_fit_impact: 5
⛑ StronglyA: mastery=5, impact=1. MostlyA: mastery=4, impact=2. MostlyB: mastery=2, impact=4. StronglyB: mastery=1, impact=5.
S2Q3  —  Format B — Anchored Behaviour Scale (shuffled)
Dimensions: motivational_fit_autonomy, relational_intelligence
[collab-a]  Works best with regular back-and-forth — thinks better working alongside others with consistent collaboration throughout.
       scores: autonomy: 2, relational_intelligence: 4
[collab-b]  Works best independently — owns work completely and prefers minimal check-ins over collaborative working patterns.
       scores: autonomy: 5, relational_intelligence: 2
[collab-c]  Thrives in highly collaborative environments where working closely with others is a core part of how the work gets done.
       scores: autonomy: 1, relational_intelligence: 5
[collab-d]  Prefers working independently with deliberate checkpoints — wants alignment at the right moments without constant group input.
       scores: autonomy: 4, relational_intelligence: 3
⛑ Options shown in shuffled display order. Score is applied via option ID.
S2Q4  —  Format B — Anchored Behaviour Scale (shuffled)
Dimensions: motivational_fit_mastery, motivational_fit_recognition
[recog-a]  Mostly self-directed — appreciates acknowledgment but does not seek it and does not need it to stay engaged.
       scores: mastery: 4, recognition: 2
[recog-b]  Performs best in environments where good work gets regularly acknowledged — recognition from the right people is a meaningful motivator.
       scores: mastery: 1, recognition: 5
[recog-c]  Rarely thinks about being noticed — internal satisfaction is the primary measure and external recognition does not significantly change engagement.
       scores: mastery: 5, recognition: 1
[recog-d]  Feedback and recognition are important to staying engaged over time — performs better in environments where contribution is visible.
       scores: mastery: 2, recognition: 4
S2Q5  —  Format B — Anchored Behaviour Scale (shuffled)
Dimensions: resilience, motivational_fit_autonomy
[press-a]  Pressure tends to lift output — the focus and urgency of high-stakes situations often produces better work.
       scores: resilience: 5, autonomy: 1
[press-b]  Pressure affects output somewhat — delivers but performance is more consistent when there is room to work at a pace that suits them.
       scores: resilience: 2, autonomy: 4
[press-c]  Stays fairly consistent under pressure — quality does not change dramatically regardless of external urgency.
       scores: resilience: 4, autonomy: 2
[press-d]  Best work comes from having space and time — output suffers when external urgency is high and self-directed pace is disrupted.
       scores: resilience: 1, autonomy: 5
⛑ S2 work style field (no trait scoring): multi-select work style preferences stored on candidate_profiles.work_type[]. Options: remote, hybrid, in-person, flexible hours, structured schedule.


Section 3 — How You Think (5 questions)

S3Q1  —  Format B — Anchored Behaviour Scale (shuffled)
Dimensions: learning_velocity
[lv-a]  Gets on top of things reasonably quickly — moves independently with solid grounding, does not need extended time before contributing.
       scores: learning_velocity: 4
[lv-b]  Takes time, goes deep before feeling confident — thorough over fast, prefers deep understanding before moving independently.
       scores: learning_velocity: 1
[lv-c]  Things click fairly quickly — connects new information to existing knowledge and moves fast, sometimes filling gaps on the fly.
       scores: learning_velocity: 5
[lv-d]  Deliberate pace — revisits material, lets things settle, builds solid understanding over time rather than moving fast with partial knowledge.
       scores: learning_velocity: 2
⛑ Note: lv-b (score 1) is not a character flaw. Thoroughness is valuable in many roles.
S3Q2  —  Format B — Anchored Behaviour Scale (shuffled)
Dimensions: learning_velocity, communication_confidence
[view-a]  Holds views but updates when the argument is strong enough — separates ego from position and updates without it being a big deal.
       scores: learning_velocity: 4, communication_confidence: 4
[view-b]  Forms strong views and holds them firmly — conviction is a strength and does not shift positions under social pressure.
       scores: learning_velocity: 1, communication_confidence: 4
[view-c]  Actively seeks challenges to their thinking — forms strong views but genuinely welcomes better ones and updates readily.
       scores: learning_velocity: 5, communication_confidence: 3
[view-d]  Considered positions — needs substantial evidence before updating, deliberate about changing a view once formed.
       scores: learning_velocity: 2, communication_confidence: 3
S3Q3  —  Behavioural Task — LLM Rubric (80–150 words)
Dimensions: learning_velocity, ownership_follow_through, communication_confidence
[henderson-task]  "You are two weeks into a new role. Your manager pulls you aside before heading into back-to-back meetings until 4pm and says: 'Can you sort out the Henderson account — they are not happy.' No other context is given. Describe what you would do." (80–150 words)
       scores: LLM rubric — see below
⛑ Live word counter. Block submission outside 80–150 word range. LLM scores four criteria mapped to dimensions (see rubric below).

Henderson Task — LLM Scoring Rubric
Call Anthropic API with the candidate’s response. System prompt:
Score this response on four criteria, each 1–5.
Return ONLY JSON: { clarity_of_reasoning, handling_ambiguity,
                    initiative_and_ownership, communication_intent }

clarity_of_reasoning → maps to learning_velocity
  5 = explains logic clearly | 3 = lists actions without reasoning | 1 = vague

handling_ambiguity → maps to learning_velocity
  5 = acknowledges unknowns AND adapts approach
  3 = acts without acknowledging | 2 = acknowledges but does not adapt | 1 = ignores

initiative_and_ownership → maps to ownership_follow_through
  5 = takes clear ownership of outcome | 3 = describes tasks only
  1 = waits for more information before acting

communication_intent → maps to communication_confidence
  5 = proactively communicates to client AND manager
  3 = communicates to one party | 1 = no communication intent mentioned

⛑ LLM rubric scoring is the only place the LLM produces primary dimension scores. All other free text (S1, S8) is used for consistency checking only.

S3Q4  —  Format B — Anchored Behaviour Scale (shuffled)
Dimensions: communication_confidence, ownership_follow_through
[dis-a]  Finds the right moment to raise concern directly — frames as a question or alternative perspective rather than a challenge.
       scores: communication_confidence: 4, ownership_follow_through: 4
[dis-b]  Accepts and executes — debating decided matters rarely changes the outcome and demonstrates value through work quality instead.
       scores: communication_confidence: 2, ownership_follow_through: 3
[dis-c]  Raises disagreement clearly and directly at the earliest appropriate moment — respectful but does not dilute the view.
       scores: communication_confidence: 5, ownership_follow_through: 5
[dis-d]  Notes disagreement privately and demonstrates through work that a different approach may be better — lets results speak.
       scores: communication_confidence: 3, ownership_follow_through: 4
⛑ Design note: staying silent on a disagreement can reflect strategic maturity, not low confidence.
S3Q5  —  Format B — Anchored Behaviour Scale (shuffled)
Dimensions: communication_confidence
[comm-a]  Actively adjusts to the audience — finds analogies, tests understanding as they go, and explains in different ways until it lands.
       scores: communication_confidence: 4
[comm-b]  Gives the context they think is needed and follows up afterwards to check it landed — confirms understanding after rather than interrupting.
       scores: communication_confidence: 3
[comm-c]  Strips back to the core of what the person needs — prefers brevity and would rather re-add detail than overwhelm upfront.
       scores: communication_confidence: 4
[comm-d]  Prioritises completeness — gives the full picture even if it takes longer, because oversimplifying can create bigger problems downstream.
       scores: communication_confidence: 3

Section 4 — How You Handle Difficulty (5 questions)
Primary dimensions: Resilience, Ownership. Secondary: Comm Confidence, Autonomy, Mastery.

Question	Score map + option summaries
S4Q1 — Setbacks	Format B. Score map — A: resilience=4, ownership=3 | B: resilience=1, ownership=5 | C: resilience=5, ownership=2 | D: resilience=2, ownership=4 Options: A=initially frustrated but refocuses quickly | B=takes full ownership of what went wrong | C=bounces back without much reflection | D=takes time to process then reengages
S4Q2 — Taking responsibility	Format B. Score map — A: ownership=4, resilience=3 | B: ownership=3, resilience=5 | C: ownership=5, resilience=1 | D: ownership=4, resilience=4 Options: A=acknowledges and corrects | B=completes the task and addresses root cause after | C=immediately owns it publicly and fixes | D=acts fast and explains later
S4Q3 — Under sustained pressure	Format B. Score map — A: resilience=5, autonomy=1 | B: resilience=2, autonomy=4 | C: resilience=4, autonomy=2 | D: resilience=1, autonomy=5 Options: A=thrives under pressure, sharpens focus | B=manages but performance dips slightly | C=stays consistent regardless of urgency | D=needs space to do best work
S4Q4 — Commitments under change	Format B. Score map — A: ownership=4, comm_confidence=4 | B: ownership=5, comm_confidence=1 | C: ownership=3, comm_confidence=5 | D: ownership=4, comm_confidence=2 Options: A=renegotiates early and clearly | B=finds a way to deliver regardless | C=flags proactively and offers alternatives | D=absorbs the change and communicates impact after
S4Q5 — Learning from difficulty	Format B. Score map — A: resilience=2, mastery=3 | B: resilience=5, mastery=3 | C: resilience=1, mastery=4 | D: resilience=4, mastery=5 Options: A=reflects carefully over time | B=bounces back quickly and moves forward | C=finds difficulty demotivating until it resolves | D=treats it as a problem to analyse and improve from


Section 5 — How You Relate to Others (5 questions)
Primary dimensions: Relational Intelligence, Communication Confidence. Secondary: Ownership, Learning Velocity.

Question	Score map + option summaries
S5Q1 — Reading a room	Format B. Score map — A: rel_intel=5, comm_conf=2 | B: rel_intel=2, comm_conf=5 | C: rel_intel=3, comm_conf=4 | D: rel_intel=2, comm_conf=3 Options: A=notices unspoken tension immediately | B=focuses on stated content | C=picks up on signals and asks a clarifying question | D=generally reads situations accurately
S5Q2 — Navigating conflict	Format B. Score map — A: rel_intel=2, ownership=5 | B: rel_intel=5, ownership=3 | C: rel_intel=4, ownership=4 | D: rel_intel=3, ownership=2 Options: A=names it early and directly | B=takes time to understand the other party first | C=identifies the core issue and addresses that | D=lets it settle and addresses when cooler
S5Q3 — Adapting to people	Format B. Score map — A: rel_intel=5, comm_conf=2 | B: rel_intel=2, comm_conf=5 | C: rel_intel=3, comm_conf=4 | D: rel_intel=4, comm_conf=3 Options: A=adapts instinctively to different people | B=communicates consistently regardless of audience | C=observes first then adjusts style | D=consciously adjusts based on known preferences
S5Q4 — Building trust	Format B. Score map — A: rel_intel=2, learning_velocity=5 | B: rel_intel=5, comm_conf=_:skip | C: rel_intel=4, learning_velocity=3 | D: rel_intel=3, comm_conf=5 Options: A=through consistent delivery | B=through genuine interest in the other person | C=over time through showing up reliably | D=by being direct and transparent
S5Q5 — Difficult person	Format B. Score map — A: rel_intel=1, ownership=5, comm_conf=_ | B: rel_intel=5, ownership=2 | C: rel_intel=3, ownership=3, comm_conf=5 | D: rel_intel=4, ownership=3 Options: A=addresses the behaviour directly and early | B=tries to understand what’s driving it first | C=raises it clearly with relevant parties | D=finds a way to work around it constructively


Section 6 — What Drives You (5 questions)
Primary dimensions: all four Motivational Fit sub-dimensions. Secondary: Impact, Mastery, Learning Velocity.

Question	Score map + option summaries (Format C noted where applicable)
S6Q1 — Good work feeling	Format B. Score map — A: impact=5, mastery=2 | B: impact=2, mastery=5 | C: impact=4, mastery=3 | D: impact=1, mastery=5, learning_velocity=5 Options: A=made a visible difference to people or outcomes | B=got noticeably better at something | C=delivered something genuinely useful | D=figured out something no one had worked out before
S6Q2 — Staying motivated	Format B. Score map — A: recognition=5, mastery=1 | B: recognition=1, mastery=5 | C: recognition=_, impact=5 | D: recognition=4, mastery=3 Options: A=being recognised for doing good work | B=getting genuinely better at the craft | C=seeing the real-world impact of what they do | D=combination of craft and feeling valued
S6Q3 — Motivation ranking	Format C — Drag-to-rank. Items: Mastery (getting better at the work), Impact (seeing the effect of my work), Recognition (being acknowledged and valued), Autonomy (independence over how I work). Scores: 1st=5, 2nd=3, 3rd=2, 4th=1. Maps directly to four sub-dimension scores.
S6Q4 — Intrinsic vs extrinsic	Format B. Score map — A: recognition=5, mastery=1 | B: recognition=2, mastery=4 | C: recognition=1, mastery=5 | D: recognition=1, impact=5 Options: A=thrives when contribution is seen and acknowledged | B=motivated by growing skills and occasional recognition | C=almost entirely self-motivated, external rewards minor | D=driven by knowing work has real-world impact
S6Q5 — Autonomy and direction	Format B. Score map — A: impact=5, autonomy=1 | B: impact=2, autonomy=5 | C: impact=3, autonomy=4 | D: impact=2, autonomy=2, recognition=4 Options: A=collaborative environments with clear shared goals | B=maximum independence over approach and timing | C=loosely defined direction with self-directed execution | D=structured environment with clear acknowledgment of contribution


Section 7 — Career Direction (employer filtering data, no trait scoring)
Field	Detail
S7Q1 — What looking for	Multi-select, max 2. Options: New challenge, Step up in responsibility, Career change, Re-enter workforce, Flexible work, Growth environment, Culture fit priority. Stored: candidate_profiles.what_looking_for[]
S7Q2 — Growth direction	Free text 40–80 words. Prompt: "What kind of growth or development matters most to you in your next role?" Stored: candidate_profiles.growth_direction
S7Q3 — Industry openness	Single select. Options: Open to anything, Have strong preferences, Specific industries only, Returning to a familiar industry. Stored: candidate_profiles.industry_openness
S7Q4 — Role type preference	Multi-select max 2. Maps to the 10 role template categories. Stored: candidate_profiles.role_type_pref[]
S7Q5 — Logistics	Salary range (select), work location preference (remote/hybrid/in-person), organisation size preference (startup/SME/corporate/any), open to contract work (boolean). All stored as individual fields on candidate_profiles.

Section 8 — Your Profile (mostly optional)
Field	Detail
S8Q1 — Strengths (required)	3 entries, 10–30 words each. Prompt: "Describe three things you are genuinely good at — in your own words, not job titles." Stored: candidate_profiles.strengths[]
S8Q2 — Working context (optional)	Up to 100 words. Prompt: "Is there any context that would help an employer understand how you work best? (Optional)" Stored: intake_responses S8Q2.
S8Q3 — Testimonial (optional)	Structured: { name, relationship, quote }. Prompt: "A short reference from someone who has worked with you. (Optional)" Stored: intake_responses S8Q3 as jsonb.
S8Q4 — Open context (optional)	Up to 150 words. Prompt: "Anything else you’d want a potential employer to know? (Optional)" Stored: intake_responses S8Q4.

⛑ Whether a candidate completed optional fields (S8Q2, Q3, Q4) is a Conscientiousness signal. Store as optional_fields_completed: boolean on candidate_profiles.

5. Scoring Engine
After all sections complete, compute the candidate’s nine trait scores. Run as a Supabase Edge Function triggered when intake_status = 'complete'.

// For each dimension, collect all score inputs across all sections.
// Average them. Normalise from 1–5 raw scale to 0–100.

function normalise(rawScore) { return ((rawScore - 1) / 4) * 100; }

function computeDimensionScore(inputs) {
  const mean = inputs.reduce((a,b) => a+b, 0) / inputs.length;
  return Math.round(normalise(mean) * 100) / 100;
}

Write computed scores to candidate_profiles:
learning_velocity, ownership_follow_through, resilience,
communication_confidence, relational_intelligence,
motivational_fit_mastery, motivational_fit_impact,
motivational_fit_recognition, motivational_fit_autonomy

6. Employer Insight Layer — Three-Level Architecture
The insight layer is the platform’s most strategically important feature. Navigation state lives in InsightPage.tsx.

Level	What it contains
Level 1 — Summary	Four panels. High-level signals. Reads in 90 seconds. Always visible from State 1.
Level 2 — Analysis	Drill paths into dimension distributions, cohort comparisons, motivational fit pulse data. Requires State 2+ for most views.
Level 3 — Inference	Platform-generated findings in plain English with explicit confidence. Unlocks progressively. Requires calibration gates before any findings are surfaced.

Data States
State	What is available
State 1	< 5 performance snapshots. Summary + pipeline only. Level 3 locked entirely.
State 2	5–14 snapshots. Early directional signals. All levels visible; inference marked as 'Early signal:'.
State 3	15+ snapshots. Full correlations with confidence intervals. Inference findings unlock.

Level 1 — Four Summary Panels
Panel	What it shows
Panel 1 — Hiring Profile	Radar chart. Three layers: employer weighting vs hired average vs top performer average (State 3 only). Divergence callout if any dimension differs >15 points between weighting and hired average.
Panel 2 — Performance Correlations	Grouped bar chart. Three bars per dimension: average intake score for top/mid/low performance bands. Confidence stated explicitly. Locks until State 2.
Panel 3 — Pipeline Snapshot	Real-time candidate cards sorted by match score. Stage label, match %, days in stage. Stale flag if >7 days in same stage. Always live.
Panel 4 — Motivational Fit Watch	Two-source architecture. Locks until first pulse check submitted. See full spec below.

Panel 4 — Motivational Fit Watch: Two-Source Architecture
Managers cannot observe internal motivational states directly. Their ratings are not on the same scale as intake scores. Panel 4 uses TWO triangulated sources.

Source 1 — Candidate pulse check (PRIMARY):
At 30 days and 90 days post-hire, candidate receives a 4-question check-in (1–5 scale):
•	Mastery: 'How often are you encountering genuinely new challenges that stretch your thinking?'
•	Impact: 'How clearly can you see the effect of your work on outcomes or people around you?'
•	Recognition: 'How well does the feedback and acknowledgment you receive match what motivates you?'
•	Autonomy: 'How much genuine independence do you have over how you approach your work?'

Source 2 — Manager behavioural observation (SECONDARY):
Manager rates observable behaviours only — not motivational interpretations. Four corresponding behaviour ratings (1–5 scale), one per sub-dimension.

Alignment logic:
gap = intakeScore - normalisedPulseScore
gap <= 15  → aligned   (green)
gap 16-30  → watch     (amber)
gap > 30   → at-risk   (red)

⛑ Panel 4 waits for BOTH sources (candidate pulse + manager observation) before showing the alignment indicator. Shows 'Waiting for 30-day check-in' until both are submitted.

Level 2 — Analysis Drill Views
View	What it shows
Dimension drill	Score distribution across all hires for a selected dimension. Shows which band (0–25 / 26–50 / 51–75 / 76–100) candidates fall into. Correlation strength callout if State 2+.
Cohort comparison	Two-period average intake scores (last 6 months vs previous 6 months) per dimension. Shows delta and trend direction.
Motivational fit pulse	Per-hire view of intake scores vs 30-day and 90-day pulse check scores. Shows delta per sub-dimension with colour-coded gap status.

Level 3 — Inference Language Rules (non-negotiable)
✓ Always state findings in plain English before showing data. Sentence first, chart second.
✓ Always state confidence explicitly: 'Based on X performance snapshots' on every finding.
✓ State 2: prefix all directional findings with 'Early signal:' or 'Based on early data:'.
✓ State 3: use 'Based on your data:' for reliable patterns. Never 'research shows' or 'typically'.
⚠️  Never say 'always', 'definitely', or 'predicts'. Use: 'associated with', 'tend to', 'in your data'.
⚠️  All findings from employer's own data only. Never reference global benchmarks or industry averages.

7. High Performer Calibration Mechanism
This is the mechanism that protects the integrity of the inference layer. The core problem it solves: if an employer rates 60% of their hires as 'top performers', the correlation data is useless — it will show that almost every trait predicts 'top performance'. The calibration mechanism prevents this before it contaminates the data.

The mechanism has three components that work together:

Component 1 — Calibration Prompt (Employer Onboarding)
During employer onboarding (Step 4 of 4), before the employer ever rates a candidate, they are asked to define what 'top performance' means in their specific environment. This is not a generic definition — it is observable, behavioural, and specific to their team.

Step title shown to employer: "Define what great looks like"

Framing shown to employer: "Before CMe can show you what traits predict success in your environment, we need to understand what success looks like to you — specifically, not in general. The more precise your answers, the more useful your insights will be."

Four free-text fields (all required, skippable with 'set up later' option):

Field	Prompt + example placeholder
Output quality criteria	What does high-quality output look like for the roles you hire into? What would you point to and say 'that is what we want'? Example placeholder: 'Work that is accurate and needs minimal rework, delivered ahead of commitment, and clearly communicated to relevant stakeholders.'
Ownership criteria	What does genuine ownership look like in your team — as a behaviour, not a feeling? Example placeholder: 'Takes the outcome personally, not just the task. Flags problems early, proposes solutions, and follows through without reminding.'
Team contribution criteria	What does meaningful contribution to the team look like beyond individual output? Example placeholder: 'Makes others around them better. Raises the standard in the room. Shares knowledge without being asked.'
Growth trajectory criteria	What does strong growth and development trajectory look like in your environment over 12–18 months? Example placeholder: 'Needs less direction with each passing month. Takes on problems that are one level above where they started.'

Stores to: performance_calibrations table. INSERT on first save. UPSERT (versioned) on subsequent saves.

⚠️  Versioning rule: never overwrite an existing calibration row. On update: (1) set superseded_at = now() on the current active row, (2) insert a new row with version_number = previous_max + 1. Both steps in a single transaction.

Component 2 — Forced Distribution Nudge
This component fires when the employer is using the inference layer (Level 3). It does not block anything — it surfaces an advisory prompt.

Trigger condition: more than 40% of this employer's rated hires are in the 'top' performance band.

Advisory prompt shown at top of Level 3 before any findings:
"Your top band currently includes [N] of [total] hires ([%]). For CMe's patterns to be most reliable, top performers should represent the genuinely exceptional 15–25% — the people who, if you lost them, would be the hardest to replace. If this looks higher than that, it may be worth revisiting your ratings before acting on these findings."

Link below the advisory: 'Review performance ratings' — navigates to the performance snapshots view.

⛑ This prompt does not hide findings. It appears as a calibration card above the findings, not a blocker. The employer can proceed.

Component 3 — Relative Performance Flag
This component provides a second signal about where a hire sits — not just their absolute band (top/mid/low) but their relative rank within the employer's actual distribution.

Logic:
// Computed on-the-fly from all performance_snapshots for this business.
// Not persisted. Recomputed on each render of the inference layer.

function getRelativeRank(engagement_id, allSnapshots) {
  const sorted = allSnapshots.sort((a, b) => {
    // Sort by average dimension rating descending
    return avgRating(b) - avgRating(a);
  });
  const rank = sorted.findIndex(s => s.engagement_id === engagement_id) + 1;
  const percentile = Math.round((1 - rank / sorted.length) * 100);
  return { rank, percentile };
}

Display: shown on individual hire cards in Level 2 and Level 3 as a secondary label. Example: 'Top band — ranked 2nd of 12 hires'. Does not appear in Level 1 summary.

⛑ Relative rank is informational only. It does not override the absolute band for scoring or correlation calculations. Its purpose is to help the employer sense-check their own ratings.

Calibration Data State Interaction
The calibration mechanism interacts with data states as follows:
Data state	Calibration behaviour
State 1 (< 5 snapshots)	Calibration prompt shown during onboarding. Forced distribution nudge cannot fire (not enough rated hires). Relative rank not displayed.
State 2 (5–14 snapshots)	All three components active. Forced distribution nudge fires if 40% threshold met. Relative rank shown. Early signal language on all findings.
State 3 (15+ snapshots)	Full calibration in effect. Findings are most reliable when calibration has been completed AND top band is 15–25% of hires.

New Table: performance_calibrations
create table public.performance_calibrations (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  version_number integer not null default 1,
  output_quality_criteria text,
  ownership_criteria text,
  team_contribution_criteria text,
  growth_trajectory_criteria text,
  created_at timestamptz default now(),
  superseded_at timestamptz default null,
  unique(business_id, version_number)
);

8. Supabase Schema — Key Tables

Table	Key fields
profiles	Extends auth.users. Fields: id, role (candidate|employer), full_name, avatar_url, created_at
businesses	owner_id (FK profiles), name, industry, size, created_at
employer_trait_weightings	business_id (unique). Six weight fields (min 5 each). Constraint: weights must sum to 100.
role_templates	10 system templates. Fields: id, name, description, plus 6 dimension weight fields.
candidate_profiles	user_id (unique). All filtering fields. Nine trait score fields (numeric 5,2). intake_status ('draft'|'complete'). published boolean. optional_fields_completed boolean.
intake_responses	candidate_id, section (1-8), question_key (e.g. 'S2Q1'), response_value (text), response_scores (jsonb).
engagements	business_id + candidate_id (unique). stage enum (discovered|contacted|interviewing|decision|hired|rejected). match_score (numeric).
performance_snapshots	engagement_id, snapshot_day (30|90). Six dimension ratings (1-5). performance_band ('top'|'mid'|'low'). would_rehire boolean. notes text.
motivational_pulse_checks	NEW — engagement_id, snapshot_day (30|90). Four candidate pulse ratings (1-5). Four manager behaviour ratings (1-5). manager_submitted boolean. unique(engagement_id, snapshot_day).
performance_calibrations	NEW — business_id, version_number, four criteria text fields, superseded_at. Versioned — never overwrite, always insert new version.

motivational_pulse_checks — full CREATE TABLE
create table public.motivational_pulse_checks (
  id uuid default gen_random_uuid() primary key,
  engagement_id uuid references public.engagements(id) on delete cascade,
  snapshot_day integer check (snapshot_day in (30, 90)),
  mastery_rating integer check (mastery_rating between 1 and 5),
  impact_rating integer check (impact_rating between 1 and 5),
  recognition_rating integer check (recognition_rating between 1 and 5),
  autonomy_rating integer check (autonomy_rating between 1 and 5),
  submitted_by text check (submitted_by = 'candidate'),
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

9. Six Cursor Build Spec Files
Apply specs in order. Specs 1 and 3 need updates before any implementation begins.

Spec	Status & location
Spec 1 — Data Schema	SQL migration + TypeScript types + role template seed data. STATUS: NEEDS UPDATE — add motivational_pulse_checks + performance_calibrations tables + indexes. File: /mnt/user-data/outputs/CMe-Spec-1-Data-Schema.docx
Spec 2 — Weighting UI	TraitWeightingUI.tsx. 100-point allocation, 5% floor, live constraint feedback. STATUS: COMPLETE. File: /mnt/user-data/outputs/CMe-Spec-2-Weighting-UI.docx
Spec 3 — Role Templates	RoleTemplatePicker + 4-step employer onboarding. STATUS: NEEDS UPDATE — add calibration prompt step (Step 4 of 4) with four free-text criteria fields. File: /mnt/user-data/outputs/CMe-Spec-3-Role-Templates.docx
Spec 4 — Intake Flow	IntakeFlow parent + all 8 sections + all question formats + LLM rubric + scoring Edge Function. STATUS: COMPLETE. File: /mnt/user-data/outputs/CMe-Spec-4-Intake-Flow.docx
Spec 5 — Match Scoring	matchScoring.ts lib + CandidateCard + assessment link flow (cold-start via Kernel). STATUS: COMPLETE. File: /mnt/user-data/outputs/CMe-Spec-5-Match-Scoring.docx
Spec 6 — Insight Layer v2	InsightPage three-level architecture. SUPERSEDES v1. STATUS: COMPLETE — spec6.js written but docx not yet generated. Source: /home/claude/cme-spec6/spec6.js Target: /mnt/user-data/outputs/CMe-Spec-6-Insight-Layer-v2.docx

10. Tech Stack & Design System
Element	Value
Frontend	React + TypeScript + Tailwind CSS
Icons	lucide-react (strokeWidth={2}, w-4 h-4 inline, w-5 h-5 buttons)
Charts	recharts
State	React Context API only. No Redux/Zustand. Context: /contexts/UserProfileContext.tsx
Backend	Supabase (auth, database, edge functions)
Design inspiration	Notion, Linear, Webflow dashboards — modern minimal light-themed CRM
Primary accent	#7DBBFF (blue) — CTAs, active states, highlights
Success	#10B981 (green) — interview status, positive actions
Warning	#F59E0B (orange) — shortlisted, pending
Neutral	#6B7280 (gray) — secondary text, inactive
Text	Primary #111827 | Secondary #6B7280 | Muted #9CA3AF
Background	#FFFFFF cards | #F9F9FA subtle | rgba(0,0,0,0.08) borders
Border radius	Badges 6-8px | Buttons/inputs 10-12px | Cards 12-14px | Modals 16-20px

11. Progress Log

Completed
✓ Six-dimension trait framework with Big Five / SDT grounding and plain English definitions
✓ Employer 100-point weighting system with 5% floor and 70 free points
✓ Ten role templates with research-backed default weightings and motivation signals
✓ Complete candidate intake flow — all 8 sections designed, all questions written, formats defined, LLM rubric specified
✓ Anti-gaming architecture — opposing axes, scrambled written order, randomised display order
✓ Spec 1: Data schema, TypeScript types, role template seed data (needs two new tables added)
✓ Spec 2: TraitWeightingUI component fully specified
✓ Spec 3: RoleTemplatePicker + employer onboarding (needs calibration step added)
✓ Spec 4: IntakeFlow — all question formats, score maps, LLM rubric, scoring Edge Function
✓ Spec 5: matchScoring.ts lib + CandidateCard + assessment link (cold-start via Kernel)
✓ Spec 6 v2: three-level insight layer — full architecture, Panel 4 two-source design, inference engine
✓ Panel 4 two-source motivational fit architecture fully designed and specced
✓ High performer calibration mechanism — all three components fully designed (onboarding prompt, forced distribution nudge, relative performance flag)
✓ Insight framework thesis document (9 sections)
✓ Interactive React mockup of three-level insight layer

Pending — immediate next actions
⏳ NEXT: Generate Spec 6 v2 docx from /home/claude/cme-spec6/spec6.js — run: cd /home/claude/cme-spec6 && node spec6.js, then cp to /mnt/user-data/outputs/
⏳ NEXT: Update Spec 1 to add motivational_pulse_checks + performance_calibrations tables + both indexes
⏳ NEXT: Update Spec 3 to add calibration prompt step (Step 4 of 4) with four free-text criteria fields and versioned INSERT logic

Pending — future build items
⚠️  Candidate-facing pulse check submission UI — 4-question form sent via link at 30 and 90 days post-hire. Separate build spec required.
⚠️  Performance snapshot trigger automation — 30/90 day reminder emails to employer
⚠️  Actual Cursor implementation of all six specs in order (Specs 1 and 3 updates first)
⚠️  V2 features: per-role trait weighting, KPI integrations, cross-business benchmarking, ML-driven inference

12. Key Context & Preferences

Context item	Detail
Will's background	Commercial insurance broker, Christchurch NZ. Real-world hiring observation and advisory lens.
Working style	Pressure-tests ideas before deciding. Wants precise, decision-capturing outputs. Runs parallel Claude conversations by workstream (strategy / product design / build).
Cursor usage	Cursor agent mode with Tailwind CSS. Pre-confirmation step before destructive changes: 'Show me the specific line you plan to delete before making any changes.'
Output preference	Structured docx spec documents after design sessions. Clean final versions, not working drafts.
Prompt style	Precise surgical prompting in Cursor. Values understanding WHY certain phrasing works. Name specific component files, Tailwind values, and constraints.
Cold-start solution	Assessment links sent via Dean Anderson at Kernel Wealth to candidates. Seeds data before employer onboarding at scale.
Competitive threats	HireVue, Pymetrics/Harver, Predictive Index, Sapia.ai. NOT LinkedIn. Mercor optimises for speed/skills; CMe differentiates on psychometric depth and post-hire outcome data.
Component files	DashboardPage.tsx, CompaniesPage.tsx, CareerReadinessPage.tsx, profile builder step files, ApplicantScreen.tsx, EmployerScreen.tsx, OverviewScreen.tsx

13. Exact Next Task — Where to Resume

The session ended immediately after writing spec6.js. The docx was not generated. Three immediate tasks in priority order:

Task 1 — Generate Spec 6 v2 docx (5 minutes)
cd /home/claude/cme-spec6 && node spec6.js
cp /home/claude/cme-spec6/CMe-Spec-6-Insight-Layer-v2.docx /mnt/user-data/outputs/
Then present_files the output so Will can download it.

Task 2 — Update Spec 1 to add two new tables
Open /mnt/user-data/outputs/CMe-Spec-1-Data-Schema.docx. Add a section titled 'v2 Additions' after the existing schema tables. Include:
•	Full CREATE TABLE statement for motivational_pulse_checks (see Section 8 above)
•	Full CREATE TABLE statement for performance_calibrations (see Section 8 above)
•	Both indexes for motivational_pulse_checks
•	TypeScript type additions for both tables in src/types/cme.ts

Task 3 — Update Spec 3 to add calibration prompt step
Open /mnt/user-data/outputs/CMe-Spec-3-Role-Templates.docx. Add a new onboarding step (Step 4 of 4):
•	Step title: 'Define what great looks like'
•	Framing copy: 'This helps CMe learn what top performance means specifically in your environment, not in general.'
•	Four free-text fields with example placeholders (see Section 7 above for all field details)
•	All fields skippable with 'Set up later' option — show brief confirmation if skipped
•	Save logic: versioned INSERT to performance_calibrations (never overwrite — see versioning rule in Section 7)

⛑ After Tasks 1–3 are complete, all six specs are ready for Cursor implementation. Apply in order: Spec 1 → Spec 4 → Spec 2 → Spec 3 → Spec 5 → Spec 6.
