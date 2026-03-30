2. App Shell
The employer interface uses a fixed left sidebar plus a main scrollable area. This layout is consistent across all employer-facing pages — the Insights page lives inside it.

2.1 Sidebar
Element	Spec
Width	220px fixed, does not collapse in v1
Background	#FFFFFF
Right border	1px solid #E5E7EB
Logo mark	30×30px, border-radius 7px, gradient linear-gradient(135deg, #3B82F6, #60A5FA), white 'C' in DM Mono 700 13px
Logo name	'CMe' DM Sans 700 15px, letter-spacing -0.3px
Nav item default	DM Sans 400 13px, color #6B7280, 9px 20px padding, full width, transparent background
Nav item active	DM Sans 600 13px, color #2563EB, background #EFF6FF, 2px right border #3B82F6
Nav items	Pipeline · Search · Insights · Settings (with icon left)
Org card (footer)	#F9FAFB bg, 1px #E5E7EB border, border-radius 10px, 12px 14px padding
Org label	10px DM Sans 600 #9CA3AF, uppercase, letter-spacing 0.06em, 'Viewing as'
Org name	13px DM Sans 600 #111827, business name
Status row	6px green dot + snapshot count and state label in 11px #6B7280

2.2 Topbar
Element	Spec
Position	Sticky top, z-index above content
Background	rgba(244,246,249,0.95), backdrop-filter blur(8px)
Bottom border	1px solid #E5E7EB
Padding	16px 32px
Left — page title	DM Sans 700 20px, letter-spacing -0.4px, '#111827'
Left — subtitle	12px #6B7280, 'N performance snapshots · N active hires · [Business name]'
Right — Export button	DM Sans 500 12px, #374151, white bg, 1px #E5E7EB border, border-radius 8px, 7px 14px padding — placeholder only in v1
⚠️  The state switcher (State 1 / 2 / 3 toggle) visible in the prototype is a development tool only. Do not include it in production Figma frames. Data state is computed from real snapshot count.

3. Data State System
The data state is the most important concept in the entire Insights page. It controls which content is visible in every section. Always design all three states for every section — never assume State 3.

State	Threshold
State 1	Fewer than 5 performance snapshots
State 2	5–14 performance snapshots
State 3	15+ performance snapshots

3.1 State Banner
Shown at the top of each unlocked section. Three visual variants:

State	Background
State 1	#F9FAFB
State 2	#FFFBEB
State 3	gradient #EFF6FF → #F0FDF4

Banner copy examples:
•	State 1 (Hiring Profile): 'Building your profile — 2 more performance snapshots needed to compare your priorities against who you're actually hiring.'
•	State 2 (Hiring Profile): 'Hired average now visible. Top performer layer unlocks at 15+ performance snapshots.'
•	State 3 (Hiring Profile): 'All three layers active — your priorities, hired average, and top performer profile are all visible.'

3.2 Gate Screen
Replaces full section content when that section is locked. Used on: Correlations (State 1), Motivational Fit (State 1), Inference (State 1 and 2).

Element	Spec
Layout	Centred vertically and horizontally within content area
Large number	DM Mono 700, 64px, color #E5E7EB — shows how many snapshots are needed
Primary text	14px DM Sans #6B7280 — 'performance snapshots needed to unlock [section name]'
Secondary text	12px DM Sans #9CA3AF, max-width 320px, line-height 1.5 — 'You have N. Submit N more to begin…'
Progress bar	200px wide, 5px height, #E5E7EB track, #7DBBFF fill, border-radius 99px — shows current vs required

4. Section Tab Navigation
Five tabs sit above the content panel. The active tab connects visually to the panel below it — creating a browser-tab effect. This is the primary navigation within the Insights page.

State	Spec
Tab labels (in order)	Hiring Profile · Performance Correlations · Pipeline · Motivational Fit · Inference
Tab padding	8px 18px
Tab font	DM Sans 500 13px
Inactive tab	Transparent background, color #9CA3AF, transparent border
Inactive hover	Color #6B7280
Active tab	White background, 1px #E5E7EB border on top/left/right, border-bottom white (matches content panel) — creates connected effect, DM Sans 600, color #111827
Tab gap	4px between tabs
Content panel	White background, 1px #E5E7EB border, border-radius 0 12px 12px 12px (flat top-left corner aligns with first active tab)

5. Panel Intro Block
Every section opens with a consistent intro block. This is not optional — it is the primary way the page communicates what each section is for.

Element	Spec
Section label	10px DM Sans 600 #9CA3AF, uppercase, letter-spacing 0.1em — e.g. '01 · Hiring Profile'
Heading	DM Sans 700 18px, letter-spacing -0.4px, #111827
Body text	DM Sans 400 13px, #6B7280, line-height 1.65, max-width 660px
Bottom border	1px solid #E5E7EB, 20px below body

Heading and body copy — all five sections
Section	Heading
01 · Hiring Profile	Are you hiring for what you think you're hiring for?
02 · Performance Correlations	Which traits at intake actually predict top performance?
03 · Pipeline	How does each active candidate stack up against your priorities?
04 · Motivational Fit Watch	Is the role structurally delivering what each hire needs?
05 · Inference	What patterns is CMe finding in your hiring data?

6. Callout Component
Callouts appear below charts within sections. They are auto-generated from data — not static copy. Design all four variants.

Variant	Background
warn	#FFFBEB
good	#F0FDF4
info	#EFF6FF
risk	#FEF2F2

Element	Spec
Layout	Horizontal flex: icon left (flex-shrink 0), body text right
Icon	16px, margin-top 1px to optically align with text
Body font	13px DM Sans, line-height 1.55
Strong text	DM Sans 600, same colour as body
Padding	12px 16px
Border radius	8px
Top margin from previous element	12px

01  Hiring Profile
Radar chart — three-layer comparison
A radar chart with up to three overlaid datasets. The number of visible layers depends on data state. Auto-generated callouts appear below the chart.

Chart layout
Element	Spec
Chart type	Radar / spider chart — 6 axes
Axis labels	Learning Velocity · Ownership · Resilience · Comm Confidence · Relational Intelligence · Motivational Fit
Chart container	Max-width 580px, chart card background #FAFAFA, 1px #E5E7EB border, 12px radius, 22px padding
Axis grid	Colour #F3F4F6
Axis label font	DM Sans 11px #6B7280

Three datasets — shown/hidden by state
Dataset	Colour
Your priorities (employer weights)	#7DBBFF
Hired average	#F59E0B
Top performers	#10B981

⛑  The chart legend sits outside the chart — three legend items with coloured dots and labels. At State 1 only the blue dot shows. At State 2 blue + amber. At State 3 all three.

Divergence callouts
Callouts are generated for any dimension where the gap between employer weights and hired average exceeds 10 points. Sorted by gap size, largest first.

Gap direction	Callout type
Weight > hired average (underperforming)	warn
Hired average > weight (implicit selection)	info
Top performer much higher than hired avg	good

State 1 behaviour
•	Radar renders with weights layer only
•	State 1 banner shown at top of section
•	No callouts — replaced with single info callout explaining what will appear

02  Performance Correlations
Grouped bar chart — intake scores by performance band
Shows which traits at intake actually correlated with top, mid, or low performance at 90-day review. Fully gated at State 1.

Gate screen — State 1
Full section replaced by gate. Snapshot count required: 5. Progress bar shows current vs 5.

Chart layout
Element	Spec
Chart type	Grouped bar chart — 3 bars per dimension
Dimensions (X axis)	LV · OW · RE · CC · RI · MF (abbreviations in DM Mono)
Y axis	0–100, step 25
Bar width	14px each
Bar radius	4px top corners only
Grid lines	Horizontal only, colour #F3F4F6
Axis border	None (display:false)

Bar	Colour
Top	#10B981
Mid	#7DBBFF
Low	#E5E7EB

⛑  Abbreviation key sits below the legend: LV = Learning Velocity, OW = Ownership, RE = Resilience, CC = Comm Confidence, RI = Relational Intelligence, MF = Motivational Fit. Font: DM Mono 10px.

Auto-generated callouts
State	Callouts generated
State 2	1× info 'Early data — treat as directional' + 1× good callout for strongest early signal (largest top-low spread)
State 3	1× good 'Strongest predictor', 1× good 'Second strongest', 1× warn 'Weakest predictor' (only if spread < 15)

Confidence line above chart: 'Based on N performance snapshots' in 11px muted text. At State 2 prefixed 'Early data —'.

03  Pipeline
Candidate table — match score and trait health
Full-width table of active candidates sorted by match score. Always visible at all states — no gate.

Table header row
•	Columns: Candidate · Match score · Trait health · Stage · (action)
•	Header font: DM Sans 600 10px #9CA3AF, uppercase, letter-spacing 0.08em
•	Header border: 1px #E5E7EB bottom

Table row
Column	Contents & spec
Candidate	40×40px circle avatar, gradient bg linear-gradient(135deg,#DBEAFE,#D1FAE5), DM Sans 700 13px initials in #374151 / Name: DM Sans 600 14px #111827 / Role type: DM Sans 400 11px #6B7280
Match score	Score number: DM Mono 700 24px #2563EB / '%' suffix: DM Sans 600 13px #93C5FD / Progress bar below: 64px wide, 3px high, bg #E5E7EB, fill gradient from #93C5FD to #2563EB
Trait health	Show only dimensions where employer weight ≥ 8, sorted by weight descending. Per dimension: label 12px #6B7280 (150px wide) + coloured dot (9px circle) + level badge. See trait health spec below.
Stage	Pill badge — see stage badge spec below
Action	'View profile →' button: DM Sans 500 11px #1a6bb5, bg #EFF6FF, 1px #BFDBFE border, 6px radius, 5px 11px padding

Trait health dots and badges
Level	Score range
High	≥ 75
Medium	50–74
Low	< 50

Stage badges
Stage	Background
Interviewing	#DCFCE7
Contacted	#DBEAFE
Discovered	#F3F4F6

Badge padding: 5px 11px, border-radius 6px, DM Sans 500 12px.

Controls above table
•	Left: row count — 'Showing N active candidates · ranked by match score' in 12px #6B7280, N bold #111827
•	Right: two select dropdowns (Sort: Match score / Date added / Stage) and (All stages / Interviewing / Contacted / Discovered)
•	Select control: 6px 11px padding, 1px #E5E7EB border, 8px radius, 12px DM Sans

04  Motivational Fit Watch
Quarterly time series — role conditions vs intake baseline
Shows whether the role is delivering what each hire needs, tracked quarterly. Manager rates role conditions on four sub-dimensions. Compared against each candidate's intake motivation profile.

Gate screen — State 1
Gate message: 'First quarterly check-in needed to activate Motivational Fit Watch'. Sub-text: 'This panel unlocks once a manager submits the first quarterly role-conditions rating for a hired candidate.'

Informational callout (always shown when unlocked)
Info callout below the intro block explaining how to read the chart. Key lines:
•	Solid line = quarterly role-conditions score (what the role is providing)
•	Dashed line = intake baseline (what the person said they need)
•	Green zone ≤15 gap = aligned · Amber 16–30 = watch · Red >30 = warrants a direct conversation

Active / Departed subtabs
Element	Spec
Tab style	Pill buttons — not the browser-tab style used at page level
Inactive	Transparent bg, 1px #E5E7EB border, DM Sans 500 12px #6B7280
Active	#EFF6FF bg, 1px #BFDBFE border, DM Sans 600 12px #2563EB
Labels	'Active hires' and 'Departed cohort'
Gap	8px between pills

Pattern alert (State 3 only, when triggered)
Shown above the hire cards when all three pattern-alert conditions are met simultaneously. Uses risk callout styling with additional structure.
Element	Spec
Container	#FEF2F2 bg, 1px #FECACA border, 3px left border #EF4444, 12px radius, 16px 18px padding
Icon	🔴 18px, flex-shrink 0
Title	DM Sans 600 13px #991B1B — 'Role-level pattern detected: [role type] · [sub-dimension]'
Body text	DM Sans 400 12px #B91C1C, line-height 1.55 — plain English description of the structural issue
Confidence line	11px #DC2626, opacity 0.8 — 'Based on N hires (N active, N departed) · pattern present at Q[N] for all N · [date range]'

⛑  Pattern alert fires only when ALL THREE conditions are true simultaneously: (1) 3+ hires in same role_type within 18 months, (2) same sub-dimension gap ≥25 points vs intake, (3) gap at 2+ consecutive quarterly snapshots.

Hire card grid
Element	Spec
Grid	2 columns, 20px gap
Card bg	#FAFAFA
Card border	1px — colour matches alignment badge (green/amber/red/grey)
Card radius	12px
Card padding	22px
Departed card	Same layout, border #E5E7EB, opacity 0.85

Card header
Element	Spec
Avatar	38px circle, background and border tinted to alignment colour — e.g. Aligned: bg #F0FDF4 border #BBF7D0 text #16A34A
Name	DM Sans 600 13px #111827
Meta line	DM Sans 400 11px #6B7280 — '[role type] · hired [quarter]'
Alignment badge	Top-right of card — pill with coloured dot + label. See alignment badge spec below.

Alignment badges
Status	Label
Aligned	Aligned
Watch	Watch
At Risk	At Risk
Departed	Departed

Overdue indicator
Small amber tag shown on the card when the quarterly check-in is >7 days past due. Replaces the source tag.
Overdue tag spec:  
bg: #FFFBEB  border: 1px #FDE68A
text: #B45309  font: DM Sans 500 10px
padding: 4px 9px  radius: 5px
prefix: ⏱  label: 'Q[N] check-in overdue'

Source tag (when not overdue)
Source tag spec:  
bg: #F3F4F6  text: #9CA3AF  font: DM Sans 400 10px
padding: 4px 9px  radius: 5px
label: 'Quarterly role-conditions · manager-rated'

Dimension legend (above chart)
Sub-dimension	Line colour
Mastery	#7DBBFF
Impact	#10B981
Recognition	#F59E0B
Autonomy	#A78BFA
Intake baseline (all dims)	Dashed, same colour family

Time series chart
Element	Spec
Chart type	Line chart — recharts LineChart
Height	140px
X axis	Quarterly labels Q1, Q2, Q3… DM Mono 10px #9CA3AF, no grid lines
Y axis	0–100, step 25, DM Sans 10px #9CA3AF, no border
Grid	Horizontal only, #F3F4F6
Solid lines	strokeWidth 2, pointRadius 3 filled circles, tension 0.3, connectNulls false (null values = gap in line)
Dashed baseline lines	strokeWidth 1, strokeDasharray '4 3', no points, opacity 0.5
Interaction	Tooltip on hover shows all four dimension values + gap from baseline for that quarter

05  Inference
Plain English findings with explicit confidence
Platform-generated findings derived entirely from the employer's own data. Cards unlock progressively as the data warrants them.

Gate screen — State 1
Gate message: 'performance snapshots needed to unlock inference'. Sub-text: 'You have N. Submit N more to begin seeing patterns emerge in your hiring data.'

Calibration nudge banner (conditional)
Shown when top performance band represents >40% of rated hires. Dismissable per session (not persisted to database).
Calibration nudge spec:  
bg: #EFF6FF  border: 1px #BFDBFE  left-border: 3px #7DBBFF  radius: 8px  padding: 14px 18px
Title: DM Sans 600 13px #1E40AF
Body: DM Sans 400 12px #3B82F6  line-height: 1.55
Link: 'Review your performance ratings →' — #1D4ED8, underline, cursor pointer
Content: 'Your top band currently includes N of N hires (N%). Inference findings are most reliable
when your top band represents the genuinely exceptional 15–25% of hires.'

Finding card types — four variants
Type	Label text
Early signal	EARLY SIGNAL
Reliable pattern	RELIABLE PATTERN
Retention risk	RETENTION RISK SIGNAL
Role-level pattern	ROLE-LEVEL PATTERN

Card anatomy
Element	Spec
Card container	1px border (colour per type), radius 12px, padding 18px 20px, bg per type, margin-bottom 12px
Label	DM Sans 600 10px, uppercase, letter-spacing 0.08em, margin-bottom 6px
Body text	DM Sans 400 13px #111827, line-height 1.65, margin-bottom 10px
Bold phrase	DM Sans 600, colour per card type — always the key finding or dimension name
Confidence line	DM Sans 400 11px #9CA3AF, separated from body by 1px rgba(0,0,0,0.06) top border, padding-top 10px

Copy patterns — inference language rules (non-negotiable)
These rules apply to every piece of copy on an inference card. Design must accommodate them — don't reduce card heights to the point where copy gets truncated.
•	Plain English before any data. The key finding is stated in a single sentence first.
•	Confidence is stated on every card without exception: 'Based on N performance snapshots'
•	State 2 prefix: 'Based on early data:' or 'Early signal:' before the key finding
•	State 3 prefix: 'Based on your data:' for reliable patterns
•	Never 'always', 'definitely', or 'predicts'. Use: 'associated with', 'tend to', 'in your data'
•	All findings from employer's own data only — never reference industry benchmarks or generic research
•	Pattern alerts must state: departure rate + cohort size + date range in the confidence line

Inference footer
A grey explanation panel sits at the bottom of the Inference section, below all finding cards. Always visible.
Inference footer spec:  
bg: #F9FAFB  border: 1px #E5E7EB  radius: 8px  padding: 14px 18px
font: DM Sans 400 12px #6B7280  line-height: 1.65
Bold prefix: DM Sans 600 #111827 — 'How inference works:'
State 2 copy: 'Findings only appear when your data supports them. At State 2, all findings
are directional — treat as hypotheses to test.'
State 3 copy: 'At State 3, findings reflect patterns repeated across multiple cohorts
and are reliable enough to act on.'

12. Figma File Structure Recommendation
Suggested page and frame organisation to keep the Figma file navigable.

Page	Contents
🎨 Design System	Colour styles, text styles, component library (callouts, badges, buttons, inputs, avatars, gate screens, state banners)
🏠 App Shell	Sidebar frame, topbar frame, layout grid — used as base for all screens
01 Hiring Profile	State 1, State 2, State 3 frames — full page width
02 Correlations	Gate screen (State 1), State 2, State 3 frames
03 Pipeline	Full table — State 1/2/3 (minimal visual difference but trait health dots may vary)
04 Motivational Fit	Gate screen, Active hires (State 2), Active + Departed (State 2), State 3 with pattern alert
05 Inference	Gate screen (State 1), State 2 (early signal cards), State 3 (full findings)
🔄 States & Interactions	Prototype flows connecting states, hover states, subtab interactions

⛑  Design all three data states for every section. Cursor will implement state-conditional rendering — the states need to exist in Figma for the handoff to work cleanly.

13. What Is Not In Scope for This Design
These items are part of the broader CMe platform but are not part of the Insight Layer Figma deliverable.

•	Employer onboarding flow (Spec 3) — separate Figma component
•	Candidate intake flow (Spec 4) — separate Figma component
•	Candidate-facing profile and dashboard — separate Figma component
•	Manager-facing quarterly check-in submission UI — separate build item, no spec yet
•	Assessment link generation UI (employer creates /assess/:token link) — separate build item
•	Mobile layouts — v1 is desktop only
•	The state switcher dev tool visible in the HTML prototype — do not include in Figma
