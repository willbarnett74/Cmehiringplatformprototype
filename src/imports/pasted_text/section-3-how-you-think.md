SECTION 3 — How You Think
Dimensions scored: Learning Velocity, Communication Confidence, Ownership & Follow-Through  ·  Est. time: 10–12 min

Framing shown at section start
"This section is about how you approach new situations, process information, and communicate your thinking. There are no right answers — we’re genuinely interested in how your mind works."

S3Q1  —  Format B — Anchored Behaviour Scale (shuffled on display)
"When you encounter something new that you need to get on top of — a skill, a system, a role — which most accurately describes how that typically goes?"
Option A (lv-a):  "I like to take my time with new things. I go deep before I feel confident applying something — I’d rather be thorough than move quickly and miss something important."
  Scores → learning_velocity: 1
Option B (lv-b):  "I tend to get on top of new things reasonably quickly. Once I have a solid grounding I can move independently without needing a lot of ongoing guidance."
  Scores → learning_velocity: 4
Option C (lv-c):  "New things tend to click for me fairly quickly. I connect what I’m learning to things I already know and usually feel confident applying something before I’ve had a lot of time with it."
  Scores → learning_velocity: 5
Option D (lv-d):  "I learn at a deliberate pace. I like to revisit material, let things settle, and build up a solid understanding over time before I feel genuinely confident applying something independently."
  Scores → learning_velocity: 2
Option ID	learning_velocity score
A	lv: 1
B	lv: 4
C	lv: 5
D	lv: 2
⛑ Score sequence in written order: 1, 4, 5, 2. Non-linear. Note: lv-a (score 1) is not a character flaw — thorough learning suits many precision roles.
S3Q2  —  Format B — Anchored Behaviour Scale (shuffled on display)
Opposing axis: Learning Velocity ↔ Communication Confidence
"When it comes to forming and holding views, which most accurately describes you?"
Option A (view-a):  "I form strong views and hold them firmly. I take a lot of convincing to change my position — I see consistency and conviction as a strength and I don’t shift easily under social pressure."
  Scores → learning_velocity: 1, communication_confidence: 4
Option B (view-b):  "I hold views but update them when the argument is strong enough. I try to separate my ego from my opinions — if someone makes a better point I’d rather acknowledge it than defend a weaker position."
  Scores → learning_velocity: 4, communication_confidence: 4
Option C (view-c):  "I actively seek out challenges to my thinking. I form strong views but I’m genuinely open to better ones — if someone makes a more compelling argument I’ll update my position and move on."
  Scores → learning_velocity: 5, communication_confidence: 3
Option D (view-d):  "I develop considered positions and don’t change them lightly. I’ll engage seriously with a counter-argument but I need substantial evidence before I’d update my view."
  Scores → learning_velocity: 2, communication_confidence: 3
Option ID	Scores
A	lv:1, cc:4
B	lv:4, cc:4
C	lv:5, cc:3
D	lv:2, cc:3
S3Q3 — Behavioural Task (LLM rubric, 80–150 words)
Prompt shown to candidate: "Read the following situation and tell us what you’d do. There’s no right answer — we’re interested in how you think through it."

SCENARIO: You’ve just started in a new role — two weeks in. Your manager pulls you aside before heading into back-to-back meetings and says: “Can you sort out the situation with the Henderson account before end of day? They’re not happy.” Then they’re gone. You have no handover notes on Henderson. You can find the account history in the system but it will take time to piece together. It’s 11am. Your manager is unavailable until 4pm. What do you do? Walk us through your thinking and the actions you’d take.

Word count: 80 minimum — 150 maximum. Live counter shown. Submission blocked outside this range.

LLM Scoring Rubric
System prompt to Anthropic API (claude-sonnet-4-20250514):
You are scoring a candidate response for a hiring assessment.
Score the response on four criteria, each 1–5.
Return ONLY a JSON object with these exact keys:
{ clarity_of_reasoning, handling_ambiguity,
  initiative_and_ownership, communication_intent }

clarity_of_reasoning → maps to learning_velocity
  5 = explains logic clearly and explicitly
  3 = lists actions without explaining reasoning
  1 = vague or no reasoning given

handling_ambiguity → maps to learning_velocity
  5 = acknowledges unknowns AND adapts approach accordingly
  3 = acts without acknowledging the ambiguity
  2 = acknowledges ambiguity but does not adapt
  1 = ignores ambiguity entirely

initiative_and_ownership → maps to ownership_follow_through
  5 = takes clear ownership of the outcome, not just the tasks
  3 = describes tasks only, no ownership of the outcome
  1 = waits for more information before acting

communication_intent → maps to communication_confidence
  5 = proactively communicates to both client AND manager
  3 = communicates to one party only
  1 = no communication intent mentioned

⛑ LLM rubric scoring is the only place the LLM produces primary dimension scores. All other free text in the intake is used for consistency checking only. The four rubric scores are fed into their respective dimension score pools as a single weighted input each.

S3Q4  —  Format B — Anchored Behaviour Scale (shuffled on display)
Opposing axis: Communication Confidence ↔ Ownership
"You genuinely disagree with a decision that someone more senior than you has just made. Which most accurately describes your typical approach?"
Option A (dis-a):  "I’d find the right moment to raise my concern directly with the person involved, framing it as a question or alternative perspective rather than a direct challenge."
  Scores → communication_confidence: 4, ownership_follow_through: 4
Option B (dis-b):  "I’d accept the decision and direct my energy toward executing it as well as possible. In my experience, debating decisions that have already been made rarely changes the outcome — I’d rather demonstrate value through the quality of my work."
  Scores → communication_confidence: 2, ownership_follow_through: 3
Option C (dis-c):  "I’d raise my disagreement clearly and directly at the earliest appropriate moment. I’d be respectful but I wouldn’t dilute my view — I think honest challenge is part of doing a good job."
  Scores → communication_confidence: 5, ownership_follow_through: 5
Option D (dis-d):  "I’d note my disagreement privately and look for ways to demonstrate through my work that a different approach might be better. I’d rather let results make the argument than create friction directly."
  Scores → communication_confidence: 3, ownership_follow_through: 4
Option ID	Scores
A	cc:4, own:4
B	cc:2, own:3
C	cc:5, own:5
D	cc:3, own:4
⛑ Design note: staying silent on a disagreement can reflect strategic maturity, not low confidence. Option B must not read as a character flaw.
S3Q5  —  Format B — Anchored Behaviour Scale (shuffled on display)
"You need to explain something genuinely complex to someone without your level of knowledge on it. Which most accurately describes your approach?"
Option A (comm-a):  "I actively adjust to my audience. I’ll find an analogy, cut the jargon, and test whether it’s landing as I go — I’d rather explain something twice in different ways than lose someone once."
  Scores → communication_confidence: 4
Option B (comm-b):  "I give people the context I think they need and follow up afterwards to check it landed. I’d rather confirm understanding after the fact than interrupt the flow of an explanation to keep checking in."
  Scores → communication_confidence: 3
Option C (comm-c):  "I tend to strip explanations right back to the core of what the other person needs. I’m probably guilty of oversimplifying sometimes but I’d rather re-add detail than lose someone in complexity."
  Scores → communication_confidence: 4
Option D (comm-d):  "I prioritise completeness. It’s important to me that the person has the full picture, even if that means a longer explanation. Oversimplifying feels like doing them a disservice."
  Scores → communication_confidence: 3
Option ID	Scores
A	cc:4
B	cc:3
C	cc:4
D	cc:3
⛑ All four options are legitimate communication styles. Options A and C both score 4 because adaptive brevity and audience-adjusting are equivalent signals. No option scores 5 here — S3Q3 and S3Q4 carry the high Communication Confidence signal.
