SECTION 2 — How You Work
Dimensions scored: Motivational Fit (Autonomy, Mastery, Recognition, Impact), Resilience, Relational Intelligence  ·  Est. time: 7–9 min

Framing shown at section start
"There’s no right way to work. This section is about understanding what brings out the best in you — your natural style, what energises you, and the environments where you genuinely thrive."

S2Q1  —  Format A — Diametric Choice
"Two people describe their ideal work environment. Which is closer to you — and it’s fine if neither is perfect?"
Option Person A:  "I do my best work when I have clear structure and defined responsibilities. I like knowing what’s expected, having reliable processes to follow, and being able to focus deeply without constant interruption."
  Scores → motivational_fit_autonomy = 1
Option Person B:  "I do my best work when things are moving fast and changing. I like variety, figuring things out as I go, and environments where I can shape my own approach rather than following a set path."
  Scores → motivational_fit_autonomy = 5
Response	Score
Strongly A	autonomy: 1
Mostly A	autonomy: 2
Mostly B	autonomy: 4
Strongly B	autonomy: 5
⛑ Optional follow-up (20–40 words): "What specifically makes that environment work well for you?" No dimension scoring — LLM consistency check only.
S2Q2  —  Format A — Diametric Choice
Opposing axis: Mastery ↔ Impact
"Which of these sounds more like a good day at work?"
Option Option A:  "A day where I got to grips with something I hadn’t dealt with before — figured out a problem, picked up a new skill, or found a better way of doing something. I finished feeling like I’d moved forward."
  Scores → motivational_fit_mastery = 5, motivational_fit_impact = 1
Option Option B:  "A day where I got a lot done, delivered on everything I’d committed to, and left knowing I’d been genuinely useful to the people around me."
  Scores → motivational_fit_mastery = 1, motivational_fit_impact = 5
Response	Scores
Strongly A	mastery: 5, impact: 1
Mostly A	mastery: 4, impact: 2
Mostly B	mastery: 2, impact: 4
Strongly B	mastery: 1, impact: 5
⛑ Optional follow-up (20–50 words): "What does a genuinely bad day at work look or feel like for you?" LLM consistency check only.
S2Q3  —  Format B — Anchored Behaviour Scale (shuffled on display)
Opposing axis: Autonomy ↔ Relational Intelligence
"Which of these most accurately describes how you prefer to work?"
Option A (collab-a):  "I work best with regular back-and-forth — thinking through problems with others, consistent collaboration, and frequent touchpoints throughout."
  Scores → autonomy: 2, relational_intelligence: 4
Option B (collab-b):  "I work best independently. I like owning my work completely and find too much collaboration slows me down or dilutes the output."
  Scores → autonomy: 5, relational_intelligence: 2
Option C (collab-c):  "I thrive in highly collaborative environments. Working closely with others is genuinely how I do my best thinking — not just a nice to have."
  Scores → autonomy: 1, relational_intelligence: 5
Option D (collab-d):  "I work best independently with deliberate checkpoints. I want alignment at the right moments but I don’t want my day-to-day work to be shaped by constant group input."
  Scores → autonomy: 4, relational_intelligence: 3
Option ID	Scores
A	autonomy:2, rel_intel:4
B	autonomy:5, rel_intel:2
C	autonomy:1, rel_intel:5
D	autonomy:4, rel_intel:3
⛑ Written order is already scrambled (A=2, B=5, C=1, D=4 on Autonomy). Display order shuffled on mount per session. Score via ID, not position.
S2Q4  —  Format B — Anchored Behaviour Scale (shuffled on display)
Opposing axis: Mastery ↔ Recognition
"Which most accurately describes your relationship with feedback and recognition at work?"
Option A (recog-a):  "I’m mostly self-directed — I appreciate acknowledgment but I don’t seek it and I don’t need it to stay motivated."
  Scores → mastery: 4, recognition: 2
Option B (recog-b):  "I perform best in environments where good work gets regularly acknowledged — recognition from the right people is a meaningful motivator for me."
  Scores → mastery: 1, recognition: 5
Option C (recog-c):  "I rarely think about whether my work is being noticed. I have my own internal measure of whether I’ve done something well — that’s generally enough."
  Scores → mastery: 5, recognition: 1
Option D (recog-d):  "Feedback and recognition are important to how I stay engaged over time — I perform better in environments where my contribution is visible."
  Scores → mastery: 2, recognition: 4
Option ID	Scores
A	mastery:4, recognition:2
B	mastery:1, recognition:5
C	mastery:5, recognition:1
D	mastery:2, recognition:4
S2Q5  —  Format B — Anchored Behaviour Scale (shuffled on display)
Opposing axis: Resilience ↔ Autonomy
"Think about the work environment where you tend to perform at your best. Which most accurately describes you?"
Option A (press-a):  "Pressure tends to focus me. When the stakes are high I find I’m more switched on than usual — urgency brings out a level of concentration I don’t always access in lower-pressure situations."
  Scores → resilience: 5, autonomy: 1
Option B (press-b):  "Pressure affects my output somewhat. I deliver, but performance is more consistent when there is room to work at a pace that suits me."
  Scores → resilience: 2, autonomy: 4
Option C (press-c):  "I’m fairly consistent regardless of the pressure level. I feel it when the stakes are high but it doesn’t significantly change how I work — I tend to deliver either way."
  Scores → resilience: 4, autonomy: 2
Option D (press-d):  "I work best at a steady, consistent pace. I do my best thinking when I can set my own rhythm without external urgency driving me."
  Scores → resilience: 1, autonomy: 5
Option ID	Scores
A	resilience:5, autonomy:1
B	resilience:2, autonomy:4
C	resilience:4, autonomy:2
D	resilience:1, autonomy:5
⛑ Score sequence in written order: 5, 2, 4, 1. Non-linear — highest scorer appears first.
S2Q6 — Work style preferences (multi-select, no trait scoring)
Prompt: "Which of these describe how you prefer to work? Select all that apply."

Options: Remote / Hybrid / In-person / Flexible hours / Standard hours / Fast-paced / Steady and structured / Small team / Large organisation / Customer or client facing / Behind the scenes / Leading others / Contributing as an individual

⛑ No trait scoring. Stored as candidate_profiles.work_type[] (string array). Used for employer filtering only. No cap on selections.
