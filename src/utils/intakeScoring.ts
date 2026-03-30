/**
 * CMe Intake Scoring Engine
 * 
 * Computes 9 trait scores from all inputs collected across Sections 2-6.
 * Triggered when intake_status is set to 'complete'.
 * Writes all nine scores to candidate_profiles.
 */

export interface IntakeResponses {
  section2?: any;
  section3?: any;
  section4?: any;
  section5?: any;
  section6?: any;
}

export interface DimensionScores {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit_mastery: number;
  motivational_fit_impact: number;
  motivational_fit_recognition: number;
  motivational_fit_autonomy: number;
}

/**
 * Normalizes raw scores (1-5) to 0-100 scale
 */
function normalizeScore(rawScore: number): number {
  return ((rawScore - 1) / 4) * 100;
}

/**
 * Averages an array of scores and returns the mean
 */
function averageScores(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}

/**
 * Extracts numeric value from scale responses (1-5)
 */
function extractScaleValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 3 : parsed; // Default to 3 (neutral) if parsing fails
  }
  return 3; // Default to neutral
}

/**
 * Score S3Q3 rubric-based behavioral task
 * Returns 1-5 based on LLM evaluation criteria
 */
function scoreS3Q3Rubric(response: any): number {
  // In production: LLM evaluates against rubric
  // For prototype: placeholder scoring
  const approach = response?.approach || '';
  const wordCount = approach.split(/\s+/).filter((w: string) => w.length > 0).length;
  
  // Basic heuristic: longer, more detailed responses score higher
  if (wordCount >= 120) return 5;
  if (wordCount >= 90) return 4;
  if (wordCount >= 60) return 3;
  if (wordCount >= 30) return 2;
  return 1;
}

/**
 * Score S5 narrative (relational intelligence)
 * Returns 1-5 based on LLM rubric evaluation
 */
function scoreS5Narrative(response: any): number {
  // In production: LLM evaluates specificity, self-awareness, defensiveness
  // For prototype: placeholder scoring based on word count and content
  const narrative = response?.conflict_narrative || '';
  const wordCount = narrative.split(/\s+/).filter((w: string) => w.length > 0).length;
  
  // Basic heuristic
  if (wordCount >= 180 && narrative.toLowerCase().includes('i')) return 5;
  if (wordCount >= 150) return 4;
  if (wordCount >= 120) return 3;
  if (wordCount >= 80) return 2;
  return 1;
}

/**
 * Score S6 narrative (motivational fit)
 * Returns 1-5 based on pattern matching
 */
function scoreS6Narrative(response: any): number {
  // In production: Pattern matching for motivational themes
  // For prototype: placeholder scoring
  const narrative = response?.proudest_work || '';
  const wordCount = narrative.split(/\s+/).filter((w: string) => w.length > 0).length;
  
  if (wordCount >= 150) return 5;
  if (wordCount >= 120) return 4;
  if (wordCount >= 90) return 3;
  if (wordCount >= 60) return 2;
  return 1;
}

/**
 * Score S4 narrative (communication confidence, resilience)
 * Returns 1-5 based on specificity and self-awareness
 */
function scoreS4Narrative(response: any): number {
  // In production: LLM evaluates specificity and self-awareness
  // For prototype: placeholder scoring
  const narrative = response?.failure_reflection || '';
  const wordCount = narrative.split(/\s+/).filter((w: string) => w.length > 0).length;
  
  if (wordCount >= 150) return 5;
  if (wordCount >= 120) return 4;
  if (wordCount >= 90) return 3;
  if (wordCount >= 60) return 2;
  return 1;
}

/**
 * Compute Learning Velocity score
 * 8 inputs: S3Q1, S3Q2, S3Q3 (rubric), S4Q1 (partial), S4Q5 (partial), S5Q4 (partial), S6 narrative
 */
function computeLearningVelocity(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S3Q1 - Structured vs Exploratory (scale)
  if (responses.section3?.S3Q1) {
    scores.push(extractScaleValue(responses.section3.S3Q1.position));
  }
  
  // S3Q2 - Problem solving approach (diametric choice maps to 1-5)
  if (responses.section3?.S3Q2) {
    const choice = responses.section3.S3Q2.choice;
    if (choice === 'A') scores.push(5); // Dive in immediately
    else if (choice === 'B') scores.push(1); // Map it out first
  }
  
  // S3Q3 - Behavioral task (rubric scored 1-5)
  if (responses.section3?.S3Q3) {
    scores.push(scoreS3Q3Rubric(responses.section3.S3Q3));
  }
  
  // S4Q1 - Response to ambiguity (partial weight)
  if (responses.section4?.S4Q1) {
    const choice = responses.section4.S4Q1.choice;
    if (choice === 'A') scores.push(4); // Energized
    else if (choice === 'B') scores.push(2); // Uncomfortable
  }
  
  // S4Q5 - Growth from difficulty (partial weight - anchored scale)
  if (responses.section4?.S4Q5) {
    scores.push(extractScaleValue(responses.section4.S4Q5.position));
  }
  
  // S5Q4 - Feedback reception (partial weight - anchored scale)
  if (responses.section5?.S5Q4) {
    scores.push(extractScaleValue(responses.section5.S5Q4.position));
  }
  
  // S6 narrative - Learning signals in proudest work
  if (responses.section6?.S6Q6) {
    scores.push(scoreS6Narrative(responses.section6.S6Q6));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Ownership & Follow-Through score
 * 11 inputs: S3Q3 (rubric), S3Q4, S4Q1, S4Q2, S4Q4, S4Q5 (partial), S6 narrative
 */
function computeOwnershipFollowThrough(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S3Q3 - Behavioral task rubric (execution quality)
  if (responses.section3?.S3Q3) {
    scores.push(scoreS3Q3Rubric(responses.section3.S3Q3));
  }
  
  // S3Q4 - Following through on decisions (anchored scale)
  if (responses.section3?.S3Q4) {
    scores.push(extractScaleValue(responses.section3.S3Q4.position));
  }
  
  // S4Q1 - Response to ambiguity
  if (responses.section4?.S4Q1) {
    const choice = responses.section4.S4Q1.choice;
    if (choice === 'A') scores.push(5);
    else if (choice === 'B') scores.push(2);
  }
  
  // S4Q2 - Dropped project responsibility (diametric)
  if (responses.section4?.S4Q2) {
    const choice = responses.section4.S4Q2.choice;
    if (choice === 'A') scores.push(5); // Find a way to deliver
    else if (choice === 'B') scores.push(2); // Cut scope or renegotiate
  }
  
  // S4Q4 - Accountability for outcomes (anchored scale)
  if (responses.section4?.S4Q4) {
    scores.push(extractScaleValue(responses.section4.S4Q4.position));
  }
  
  // S4Q5 - Growth from difficulty (partial)
  if (responses.section4?.S4Q5) {
    scores.push(extractScaleValue(responses.section4.S4Q5.position));
  }
  
  // S6 narrative - Ownership signals
  if (responses.section6?.S6Q6) {
    scores.push(scoreS6Narrative(responses.section6.S6Q6));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Resilience score
 * 8 inputs: S2Q6, S4Q1, S4Q2, S4Q3, S4Q4 (partial), S4Q5, S3Q3 (rubric partial)
 */
function computeResilience(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S2Q6 - Stress response (anchored scale)
  if (responses.section2?.S2Q6) {
    scores.push(extractScaleValue(responses.section2.S2Q6.position));
  }
  
  // S4Q1 - Response to ambiguity
  if (responses.section4?.S4Q1) {
    const choice = responses.section4.S4Q1.choice;
    if (choice === 'A') scores.push(5);
    else if (choice === 'B') scores.push(2);
  }
  
  // S4Q2 - Dropped project
  if (responses.section4?.S4Q2) {
    const choice = responses.section4.S4Q2.choice;
    if (choice === 'A') scores.push(5);
    else if (choice === 'B') scores.push(3);
  }
  
  // S4Q3 - Response to criticism (diametric)
  if (responses.section4?.S4Q3) {
    const choice = responses.section4.S4Q3.choice;
    if (choice === 'A') scores.push(5); // Useful data
    else if (choice === 'B') scores.push(2); // Depends on tone
  }
  
  // S4Q4 - Accountability (partial)
  if (responses.section4?.S4Q4) {
    scores.push(extractScaleValue(responses.section4.S4Q4.position));
  }
  
  // S4Q5 - Growth from difficulty
  if (responses.section4?.S4Q5) {
    scores.push(extractScaleValue(responses.section4.S4Q5.position));
  }
  
  // S3Q3 - Behavioral task rubric (partial)
  if (responses.section3?.S3Q3) {
    scores.push(scoreS3Q3Rubric(responses.section3.S3Q3));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Communication Confidence score
 * 11 inputs: S2 (partial via S2Q1 indirect), S3Q2, S3Q3 (rubric), S3Q4, S3Q5, S5Q4 (partial), S5Q5 narrative, S4 narrative
 */
function computeCommunicationConfidence(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S2Q1 - Working independently (indirect signal)
  if (responses.section2?.S2Q1) {
    const choice = responses.section2.S2Q1.choice;
    if (choice === 'A') scores.push(4); // Independently
    else if (choice === 'B') scores.push(5); // Collaboratively (higher communication)
  }
  
  // S3Q2 - Problem solving approach
  if (responses.section3?.S3Q2) {
    const choice = responses.section3.S3Q2.choice;
    if (choice === 'A') scores.push(4);
    else if (choice === 'B') scores.push(5); // Planning indicates communication
  }
  
  // S3Q3 - Behavioral task rubric
  if (responses.section3?.S3Q3) {
    scores.push(scoreS3Q3Rubric(responses.section3.S3Q3));
  }
  
  // S3Q4 - Following through (communication in execution)
  if (responses.section3?.S3Q4) {
    scores.push(extractScaleValue(responses.section3.S3Q4.position));
  }
  
  // S3Q5 - Explaining complex ideas (anchored scale)
  if (responses.section3?.S3Q5) {
    scores.push(extractScaleValue(responses.section3.S3Q5.position));
  }
  
  // S5Q4 - Feedback reception (partial)
  if (responses.section5?.S5Q4) {
    scores.push(extractScaleValue(responses.section5.S5Q4.position));
  }
  
  // S5Q5 - Relational conflict narrative (communication quality)
  if (responses.section5?.S5Q5) {
    scores.push(scoreS5Narrative(responses.section5.S5Q5));
  }
  
  // S4 narrative - Failure reflection (communication confidence)
  if (responses.section4?.S4Q6) {
    scores.push(scoreS4Narrative(responses.section4.S4Q6));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Relational Intelligence score
 * 7 inputs: S2Q3, S5Q1, S5Q2, S5Q3, S5Q4, S5Q5, S5 narrative
 */
function computeRelationalIntelligence(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S2Q3 - Work mode (alone vs collaboration)
  if (responses.section2?.S2Q3) {
    const choice = responses.section2.S2Q3.choice;
    if (choice === 'A') scores.push(2); // Alone, focused
    else if (choice === 'B') scores.push(5); // Back-and-forth with people
  }
  
  // S5Q1 - Relational navigation (diametric)
  if (responses.section5?.S5Q1) {
    const choice = responses.section5.S5Q1.choice;
    if (choice === 'A') scores.push(5); // Notice dynamics, adjust
    else if (choice === 'B') scores.push(2); // Focus on task
  }
  
  // S5Q2 - Conflict approach (diametric)
  if (responses.section5?.S5Q2) {
    const choice = responses.section5.S5Q2.choice;
    if (choice === 'A') scores.push(5); // Address directly
    else if (choice === 'B') scores.push(3); // Let settle first
  }
  
  // S5Q3 - Building trust (anchored scale)
  if (responses.section5?.S5Q3) {
    scores.push(extractScaleValue(responses.section5.S5Q3.position));
  }
  
  // S5Q4 - Feedback reception (anchored scale)
  if (responses.section5?.S5Q4) {
    scores.push(extractScaleValue(responses.section5.S5Q4.position));
  }
  
  // S5Q5 - Relational conflict narrative (LLM rubric)
  if (responses.section5?.S5Q5) {
    scores.push(scoreS5Narrative(responses.section5.S5Q5));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Motivational Fit — Mastery score
 * 9 inputs: S2Q2, S2Q4, S4Q5, S6Q1, S6Q2, S6Q3, S6Q4, S6Q5 (partial), S6 narrative, S2Q5 cross-dimension
 */
function computeMotivationalFitMastery(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S2Q2 - Work energizes you (diametric)
  if (responses.section2?.S2Q2) {
    const choice = responses.section2.S2Q2.choice;
    if (choice === 'A') scores.push(5); // Build/create
    else if (choice === 'B') scores.push(3); // Solve/fix
  }
  
  // S2Q4 - Success metric (diametric)
  if (responses.section2?.S2Q4) {
    const choice = responses.section2.S2Q4.choice;
    if (choice === 'A') scores.push(5); // Quality/rigor
    else if (choice === 'B') scores.push(3); // Tangible progress
  }
  
  // S4Q5 - Growth from difficulty
  if (responses.section4?.S4Q5) {
    scores.push(extractScaleValue(responses.section4.S4Q5.position));
  }
  
  // S6Q1 - Proudest work ranking (drag-to-rank - check for mastery keywords)
  if (responses.section6?.S6Q1) {
    const ranked = responses.section6.S6Q1.ranked_items || [];
    // High mastery if "Deep expertise" or "Rigorous execution" ranked high
    const masteryItems = ['Deep expertise', 'Rigorous execution'];
    const topRanked = ranked.slice(0, 2);
    const masteryScore = topRanked.filter((item: string) => masteryItems.includes(item)).length;
    scores.push(1 + masteryScore * 2); // 1-5 scale
  }
  
  // S6Q2 - Work situation energizes (multi-select - check for mastery)
  if (responses.section6?.S6Q2) {
    const selected = responses.section6.S6Q2.selected_situations || [];
    const masteryKeywords = ['depth', 'expertise', 'refine', 'mastery'];
    const masteryCount = selected.filter((s: string) => 
      masteryKeywords.some(k => s.toLowerCase().includes(k))
    ).length;
    scores.push(Math.min(5, 1 + masteryCount * 1.5));
  }
  
  // S6Q3 - Motivation words (multi-select check for mastery)
  if (responses.section6?.S6Q3) {
    const words = responses.section6.S6Q3.selected_words || [];
    const masteryWords = ['Excellence', 'Growth', 'Expertise'];
    const count = words.filter((w: string) => masteryWords.includes(w)).length;
    scores.push(1 + count * 1.3);
  }
  
  // S6Q4 - Tedious but valuable work (anchored scale)
  if (responses.section6?.S6Q4) {
    scores.push(extractScaleValue(responses.section6.S6Q4.position));
  }
  
  // S6Q5 - Recognition importance (partial - inverse for mastery)
  if (responses.section6?.S6Q5) {
    const value = extractScaleValue(responses.section6.S6Q5.position);
    scores.push(6 - value); // Invert: low recognition need = high mastery
  }
  
  // S6 narrative - Mastery signals in proudest work
  if (responses.section6?.S6Q6) {
    scores.push(scoreS6Narrative(responses.section6.S6Q6));
  }
  
  // S2Q5 - Routine vs variety (cross-dimension)
  if (responses.section2?.S2Q5) {
    const choice = responses.section2.S2Q5.choice;
    if (choice === 'A') scores.push(5); // Routine/depth
    else if (choice === 'B') scores.push(3); // Variety
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Motivational Fit — Impact score
 * 6 inputs: S2Q2, S6Q1, S6Q2 (partial), S6Q3, S6Q5, S6 narrative
 */
function computeMotivationalFitImpact(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S2Q2 - Work energizes (building = impact)
  if (responses.section2?.S2Q2) {
    const choice = responses.section2.S2Q2.choice;
    if (choice === 'A') scores.push(5); // Build/create
    else if (choice === 'B') scores.push(3);
  }
  
  // S6Q1 - Proudest work ranking (check for impact keywords)
  if (responses.section6?.S6Q1) {
    const ranked = responses.section6.S6Q1.ranked_items || [];
    const impactItems = ['Visible impact', 'Tangible results'];
    const topRanked = ranked.slice(0, 2);
    const impactScore = topRanked.filter((item: string) => impactItems.includes(item)).length;
    scores.push(1 + impactScore * 2);
  }
  
  // S6Q2 - Work situations (partial - impact situations)
  if (responses.section6?.S6Q2) {
    const selected = responses.section6.S6Q2.selected_situations || [];
    const impactKeywords = ['impact', 'see results', 'direct effect'];
    const count = selected.filter((s: string) => 
      impactKeywords.some(k => s.toLowerCase().includes(k))
    ).length;
    scores.push(Math.min(5, 1 + count * 1.5));
  }
  
  // S6Q3 - Motivation words
  if (responses.section6?.S6Q3) {
    const words = responses.section6.S6Q3.selected_words || [];
    const impactWords = ['Impact', 'Purpose', 'Contribution'];
    const count = words.filter((w: string) => impactWords.includes(w)).length;
    scores.push(1 + count * 1.3);
  }
  
  // S6Q5 - Recognition importance (related to impact visibility)
  if (responses.section6?.S6Q5) {
    scores.push(extractScaleValue(responses.section6.S6Q5.position));
  }
  
  // S6 narrative
  if (responses.section6?.S6Q6) {
    scores.push(scoreS6Narrative(responses.section6.S6Q6));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Motivational Fit — Recognition score
 * 6 inputs: S2Q4, S6Q2, S6Q3, S6Q4, S6Q5, S6 narrative
 */
function computeMotivationalFitRecognition(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S2Q4 - Success metric
  if (responses.section2?.S2Q4) {
    const choice = responses.section2.S2Q4.choice;
    if (choice === 'A') scores.push(3);
    else if (choice === 'B') scores.push(5); // Tangible progress (visible)
  }
  
  // S6Q2 - Work situations
  if (responses.section6?.S6Q2) {
    const selected = responses.section6.S6Q2.selected_situations || [];
    const recognitionKeywords = ['recognized', 'appreciated', 'visible'];
    const count = selected.filter((s: string) => 
      recognitionKeywords.some(k => s.toLowerCase().includes(k))
    ).length;
    scores.push(Math.min(5, 1 + count * 1.5));
  }
  
  // S6Q3 - Motivation words
  if (responses.section6?.S6Q3) {
    const words = responses.section6.S6Q3.selected_words || [];
    const recognitionWords = ['Recognition', 'Achievement', 'Status'];
    const count = words.filter((w: string) => recognitionWords.includes(w)).length;
    scores.push(1 + count * 1.3);
  }
  
  // S6Q4 - Tedious work (inverse - recognition seekers less willing)
  if (responses.section6?.S6Q4) {
    const value = extractScaleValue(responses.section6.S6Q4.position);
    scores.push(6 - value); // Invert
  }
  
  // S6Q5 - Recognition importance (direct measure)
  if (responses.section6?.S6Q5) {
    scores.push(extractScaleValue(responses.section6.S6Q5.position));
  }
  
  // S6 narrative
  if (responses.section6?.S6Q6) {
    scores.push(scoreS6Narrative(responses.section6.S6Q6));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Compute Motivational Fit — Autonomy score
 * 8 inputs: S2Q1, S2Q3, S2Q5, S4Q3, S6Q3, S6Q5, S6 narrative, S2Q5 cross-dimension
 */
function computeMotivationalFitAutonomy(responses: IntakeResponses): number {
  const scores: number[] = [];
  
  // S2Q1 - Working independently
  if (responses.section2?.S2Q1) {
    const choice = responses.section2.S2Q1.choice;
    if (choice === 'A') scores.push(5); // Independently
    else if (choice === 'B') scores.push(2); // Collaboratively
  }
  
  // S2Q3 - Work mode
  if (responses.section2?.S2Q3) {
    const choice = responses.section2.S2Q3.choice;
    if (choice === 'A') scores.push(5); // Alone, focused
    else if (choice === 'B') scores.push(2); // With people
  }
  
  // S2Q5 - Routine vs variety
  if (responses.section2?.S2Q5) {
    const choice = responses.section2.S2Q5.choice;
    if (choice === 'A') scores.push(4); // Routine (self-directed)
    else if (choice === 'B') scores.push(5); // Variety (autonomy to explore)
  }
  
  // S4Q3 - Response to criticism (autonomy = independent judgment)
  if (responses.section4?.S4Q3) {
    const choice = responses.section4.S4Q3.choice;
    if (choice === 'A') scores.push(5); // Useful data
    else if (choice === 'B') scores.push(3);
  }
  
  // S6Q3 - Motivation words
  if (responses.section6?.S6Q3) {
    const words = responses.section6.S6Q3.selected_words || [];
    const autonomyWords = ['Autonomy', 'Independence', 'Freedom'];
    const count = words.filter((w: string) => autonomyWords.includes(w)).length;
    scores.push(1 + count * 1.3);
  }
  
  // S6Q5 - Recognition importance (inverse - autonomy seekers less recognition-driven)
  if (responses.section6?.S6Q5) {
    const value = extractScaleValue(responses.section6.S6Q5.position);
    scores.push(6 - value); // Invert
  }
  
  // S6 narrative
  if (responses.section6?.S6Q6) {
    scores.push(scoreS6Narrative(responses.section6.S6Q6));
  }
  
  const rawScore = averageScores(scores);
  return normalizeScore(rawScore);
}

/**
 * Main scoring function - computes all 9 dimensions
 */
export function computeIntakeScores(responses: IntakeResponses): DimensionScores {
  return {
    learning_velocity: computeLearningVelocity(responses),
    ownership_follow_through: computeOwnershipFollowThrough(responses),
    resilience: computeResilience(responses),
    communication_confidence: computeCommunicationConfidence(responses),
    relational_intelligence: computeRelationalIntelligence(responses),
    motivational_fit_mastery: computeMotivationalFitMastery(responses),
    motivational_fit_impact: computeMotivationalFitImpact(responses),
    motivational_fit_recognition: computeMotivationalFitRecognition(responses),
    motivational_fit_autonomy: computeMotivationalFitAutonomy(responses),
  };
}

/**
 * Format scores for display (rounded to 1 decimal place)
 */
export function formatScoreForDisplay(score: number): string {
  return score.toFixed(1);
}

/**
 * Get score category (Low, Medium, High)
 */
export function getScoreCategory(score: number): 'Low' | 'Medium' | 'High' {
  if (score < 33.3) return 'Low';
  if (score < 66.7) return 'Medium';
  return 'High';
}
