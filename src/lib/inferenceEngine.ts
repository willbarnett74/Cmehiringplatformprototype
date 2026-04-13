/**
 * Inference Engine — Pattern detection, callouts, and confidence scoring
 * 
 * All business logic for detecting patterns in hiring data:
 * - Dimension signals (which traits correlate with performance)
 * - Weighting divergence (employer weights vs. actual top performer traits)
 * - Role detection (what roles are being hired)
 * - Confidence-stained cards (how certain are we about these insights)
 * - Inference language rules (natural language generation for callouts)
 * 
 * Uses the correct 6-dimension trait framework:
 *   learning_velocity, ownership_follow_through, resilience,
 *   communication_confidence, relational_intelligence, motivational_fit
 */

import type { StatePattern } from './insightHelpers';
import {
  generateDivergenceCallout,
  detectHiringState,
  detectTrendPattern,
  standardDeviation,
  groupBy,
} from './insightHelpers';

import type {
  HiredCandidate,
  EmployerWeights,
  TimeSeriesDataPoint,
  CorrelationData,
} from './insightQueries';
import { calculateAverageTraitScores } from './insightQueries';

// ─── Type Definitions ───

export interface DimensionSignal {
  dimension: string;
  correlation: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative' | 'neutral';
  callout: string;
  confidence: number; // 0-100
}

export interface WeightingDivergence {
  dimension: string;
  employerWeight: number;
  topPerformerAverage: number;
  divergence: number;
  severity: 'high' | 'medium' | 'low';
  callout: string | null;
  confidence: number;
}

export interface RoleDetection {
  role: string;
  count: number;
  avgMatchScore: number;
  avgPerformance: number;
  insight: string;
}

export interface PatternAlert {
  type: 'overdue' | 'churn' | 'quality' | 'trend';
  severity: 'red' | 'amber' | 'green';
  message: string;
  count: number;
  confidence: number;
}

export interface InferenceResult {
  dimensionSignals: DimensionSignal[];
  weightingDivergences: WeightingDivergence[];
  roleInsights: RoleDetection[];
  patternAlerts: PatternAlert[];
  hiringState: StatePattern;
  overallConfidence: number;
}

// ─── Dimension Signal Detection ───

/**
 * Detects which dimensions correlate with high performance
 */
export function detectDimensionSignals(
  correlationData: CorrelationData[],
  minSampleSize: number = 3
): DimensionSignal[] {
  return correlationData.map(data => {
    const { dimension, topPerformers, midPerformers, lowPerformers } = data;

    const totalSamples = topPerformers.length + midPerformers.length + lowPerformers.length;
    if (totalSamples < minSampleSize) {
      return {
        dimension,
        correlation: 0,
        strength: 'none',
        direction: 'neutral',
        callout: `Insufficient data for ${dimension} (n=${totalSamples})`,
        confidence: 0,
      };
    }

    const topAvg = topPerformers.reduce((sum, s) => sum + s, 0) / Math.max(topPerformers.length, 1);
    const midAvg = midPerformers.reduce((sum, s) => sum + s, 0) / Math.max(midPerformers.length, 1);
    const lowAvg = lowPerformers.reduce((sum, s) => sum + s, 0) / Math.max(lowPerformers.length, 1);

    const correlationValue = (topAvg - lowAvg) / 100;

    let strength: 'strong' | 'moderate' | 'weak' | 'none';
    if (Math.abs(correlationValue) > 0.15) strength = 'strong';
    else if (Math.abs(correlationValue) > 0.08) strength = 'moderate';
    else if (Math.abs(correlationValue) > 0.03) strength = 'weak';
    else strength = 'none';

    const direction: 'positive' | 'negative' | 'neutral' =
      correlationValue > 0.03 ? 'positive' : correlationValue < -0.03 ? 'negative' : 'neutral';

    const callout = generateDimensionCallout(dimension, topAvg, midAvg, lowAvg, strength);

    const allScores = [...topPerformers, ...midPerformers, ...lowPerformers];
    const variance = standardDeviation(allScores);
    const confidence = Math.min(100, (totalSamples / 10) * 100 * (1 - variance / 100));

    return {
      dimension,
      correlation: correlationValue,
      strength,
      direction,
      callout,
      confidence: Math.round(confidence),
    };
  });
}

/**
 * Generates natural language callout for dimension signal
 */
function generateDimensionCallout(
  dimension: string,
  topAvg: number,
  _midAvg: number,
  lowAvg: number,
  strength: string
): string {
  const diff = topAvg - lowAvg;

  if (strength === 'none') {
    return `${dimension} shows no clear correlation with performance`;
  }

  if (strength === 'strong' && diff > 15) {
    return `${dimension} strongly predicts success: top performers score ${Math.round(diff)}pts higher than underperformers`;
  }

  if (strength === 'moderate') {
    return `${dimension} moderately correlates with performance (${Math.round(diff)}pt spread)`;
  }

  return `${dimension} shows weak correlation with performance`;
}

// ─── Weighting Divergence Detection ───

/**
 * Detects gaps between employer weights and actual top performer traits.
 * No mapping needed — employer weights and candidate scores use the same 6-dimension keys.
 */
export function detectWeightingDivergences(
  employerWeights: EmployerWeights,
  topPerformers: HiredCandidate[],
  threshold: number = 12
): WeightingDivergence[] {
  if (topPerformers.length === 0) return [];

  const topPerformerAverages = calculateAverageTraitScores(topPerformers);

  const divergences: WeightingDivergence[] = [];

  Object.entries(employerWeights).forEach(([dim, weight]) => {
    const topPerformerAvg = topPerformerAverages[dim] || 0;
    const divergence = Math.abs(weight - topPerformerAvg);

    let severity: 'high' | 'medium' | 'low';
    if (divergence > 20) severity = 'high';
    else if (divergence > threshold) severity = 'medium';
    else severity = 'low';

    const callout = severity !== 'low'
      ? generateDivergenceCallout(dim, weight, topPerformerAvg, threshold)
      : null;

    const confidence = Math.min(100, (topPerformers.length / 5) * 100);

    divergences.push({
      dimension: dim,
      employerWeight: weight,
      topPerformerAverage: topPerformerAvg,
      divergence,
      severity,
      callout,
      confidence: Math.round(confidence),
    });
  });

  return divergences.sort((a, b) => b.divergence - a.divergence);
}

// ─── Role Detection ───

/**
 * Analyzes hiring patterns by role
 */
export function detectRolePatterns(
  hiredCandidates: HiredCandidate[]
): RoleDetection[] {
  if (hiredCandidates.length === 0) return [];

  const roleGroups = groupBy(hiredCandidates, c => c.role);

  const roleInsights: RoleDetection[] = Object.entries(roleGroups).map(([role, candidates]) => {
    const avgMatchScore = candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length;
    const avgPerformance = candidates.reduce((sum, c) => sum + (c.performance_rating || 0), 0) / candidates.length;

    let insight = '';
    if (avgPerformance >= 4.5) {
      insight = `High-performing role: consider expanding ${role} hiring`;
    } else if (avgPerformance < 3.5) {
      insight = `Below-average performance for ${role}: review hiring criteria`;
    } else if (avgMatchScore < 80) {
      insight = `Match scores for ${role} suggest screening calibration needed`;
    } else {
      insight = `${role} hiring aligned with expectations`;
    }

    return {
      role,
      count: candidates.length,
      avgMatchScore: Math.round(avgMatchScore),
      avgPerformance: Math.round(avgPerformance * 10) / 10,
      insight,
    };
  });

  return roleInsights.sort((a, b) => b.count - a.count);
}

// ─── Pattern Alerts ───

/**
 * Detects critical patterns requiring attention
 */
export function detectPatternAlerts(
  hiredCandidates: HiredCandidate[],
  timeSeriesData: TimeSeriesDataPoint[]
): PatternAlert[] {
  const alerts: PatternAlert[] = [];

  const latestQuarter = timeSeriesData[timeSeriesData.length - 1];
  if (latestQuarter && latestQuarter.overdue && latestQuarter.overdue > 2) {
    alerts.push({
      type: 'overdue',
      severity: 'amber',
      message: `${latestQuarter.overdue} candidates overdue in pipeline — follow up to maintain momentum`,
      count: latestQuarter.overdue,
      confidence: 95,
    });
  }

  const departedCount = hiredCandidates.filter(c => c.departed).length;
  const churnRate = departedCount / Math.max(hiredCandidates.length, 1);
  if (churnRate > 0.25) {
    alerts.push({
      type: 'churn',
      severity: 'red',
      message: `High churn detected: ${Math.round(churnRate * 100)}% of hires have departed — review match quality and onboarding`,
      count: departedCount,
      confidence: 90,
    });
  } else if (churnRate > 0.15) {
    alerts.push({
      type: 'churn',
      severity: 'amber',
      message: `Elevated churn: ${Math.round(churnRate * 100)}% departure rate — monitor closely`,
      count: departedCount,
      confidence: 85,
    });
  }

  const avgMatchScore = hiredCandidates.reduce((sum, c) => sum + c.match_score, 0) / Math.max(hiredCandidates.length, 1);
  if (avgMatchScore < 75) {
    alerts.push({
      type: 'quality',
      severity: 'red',
      message: `Low average match score (${Math.round(avgMatchScore)}%) — tighten screening or adjust trait weights`,
      count: hiredCandidates.filter(c => c.match_score < 75).length,
      confidence: 88,
    });
  }

  const hireCounts = timeSeriesData.map(d => d.hires);
  const trendPattern = detectTrendPattern(hireCounts);
  if (trendPattern === 'decreasing') {
    alerts.push({
      type: 'trend',
      severity: 'amber',
      message: `Hiring velocity declining over past ${timeSeriesData.length} quarters — pipeline health check recommended`,
      count: 0,
      confidence: 75,
    });
  }

  return alerts;
}

// ─── Hiring State Detection ───

export function detectOverallHiringState(
  hiredCandidates: HiredCandidate[],
  timeSeriesData: TimeSeriesDataPoint[]
): StatePattern {
  const avgMatchScore = hiredCandidates.reduce((sum, c) => sum + c.match_score, 0) / Math.max(hiredCandidates.length, 1);
  const departedCount = hiredCandidates.filter(c => c.departed).length;
  const latestQuarter = timeSeriesData[timeSeriesData.length - 1];
  const overdueCount = latestQuarter?.overdue || 0;

  return detectHiringState(hiredCandidates.length, avgMatchScore, departedCount, overdueCount);
}

// ─── Main Inference Function ───

export function runInferenceEngine(
  employerWeights: EmployerWeights,
  hiredCandidates: HiredCandidate[],
  topPerformers: HiredCandidate[],
  correlationData: CorrelationData[],
  timeSeriesData: TimeSeriesDataPoint[]
): InferenceResult {
  const dimensionSignals = detectDimensionSignals(correlationData);
  const weightingDivergences = detectWeightingDivergences(employerWeights, topPerformers);
  const roleInsights = detectRolePatterns(hiredCandidates);
  const patternAlerts = detectPatternAlerts(hiredCandidates, timeSeriesData);
  const hiringState = detectOverallHiringState(hiredCandidates, timeSeriesData);

  const allConfidences = [
    ...dimensionSignals.map(s => s.confidence),
    ...weightingDivergences.map(d => d.confidence),
    ...patternAlerts.map(a => a.confidence),
  ];
  const overallConfidence = allConfidences.length > 0
    ? Math.round(allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length)
    : 0;

  return {
    dimensionSignals,
    weightingDivergences,
    roleInsights,
    patternAlerts,
    hiringState,
    overallConfidence,
  };
}

// ─── Confidence Visualization ───

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return 'text-[#10B981]';
  if (confidence >= 60) return 'text-[#F59E0B]';
  return 'text-[#EF4444]';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 85) return 'High';
  if (confidence >= 60) return 'Medium';
  return 'Low';
}

export function getConfidenceTooltip(confidence: number, sampleSize: number): string {
  const label = getConfidenceLabel(confidence);
  return `${label} confidence (${confidence}%) based on ${sampleSize} data points`;
}
