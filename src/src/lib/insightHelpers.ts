/**
 * Insight Helpers — Pure utility functions for insights
 * 
 * No business logic, no pattern detection — just math, normalization, and formatting.
 * Used by inferenceEngine.ts and insight components.
 */

// ─── Type Definitions ───

export interface NormalizedScore {
  dimension: string;
  score: number;
  normalized: number;
}

export interface GapAnalysis {
  dimension: string;
  employerWeight: number;
  hiredAverage: number;
  topPerformerAverage: number;
  gap: number;
  gapType: 'positive' | 'negative' | 'neutral';
}

export interface StatePattern {
  state: 'green' | 'amber' | 'red';
  label: string;
  description: string;
  count: number;
}

// ─── Normalization Functions ───

/**
 * Normalizes a value to 0-100 scale
 */
export function normalize(value: number, min: number = 0, max: number = 100): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Normalizes an array of scores to 0-100 scale
 */
export function normalizeScores(scores: number[]): number[] {
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  return scores.map(score => normalize(score, min, max));
}

/**
 * Calculates z-score for anomaly detection
 */
export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Calculates standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// ─── Gap Calculation ───

/**
 * Computes gap between employer weights and actual performance
 */
export function calculateGap(
  dimension: string,
  employerWeight: number,
  hiredAverage: number,
  topPerformerAverage: number
): GapAnalysis {
  const gap = topPerformerAverage - hiredAverage;
  
  let gapType: 'positive' | 'negative' | 'neutral';
  if (Math.abs(gap) < 5) gapType = 'neutral';
  else if (gap > 0) gapType = 'positive';
  else gapType = 'negative';
  
  return {
    dimension,
    employerWeight,
    hiredAverage,
    topPerformerAverage,
    gap,
    gapType,
  };
}

/**
 * Calculates gaps for all dimensions
 */
export function calculateAllGaps(
  dimensions: string[],
  employerWeights: Record<string, number>,
  hiredAverages: Record<string, number>,
  topPerformerAverages: Record<string, number>
): GapAnalysis[] {
  return dimensions.map(dimension => 
    calculateGap(
      dimension,
      employerWeights[dimension] || 0,
      hiredAverages[dimension] || 0,
      topPerformerAverages[dimension] || 0
    )
  );
}

// ─── Callout Generation ───

/**
 * Generates human-readable callout text based on gap analysis
 */
export function generateGapCallout(gap: GapAnalysis): string {
  const { dimension, gap: gapValue, gapType } = gap;
  
  if (gapType === 'neutral') {
    return `${dimension}: Aligned — top performers match hiring profile`;
  }
  
  if (gapType === 'positive' && gapValue > 10) {
    return `${dimension}: +${Math.round(gapValue)}pt gap — top performers significantly exceed hiring criteria`;
  }
  
  if (gapType === 'negative' && Math.abs(gapValue) > 10) {
    return `${dimension}: ${Math.round(gapValue)}pt gap — consider adjusting weights or screening criteria`;
  }
  
  return `${dimension}: Minor ${gapType === 'positive' ? 'positive' : 'negative'} variance (${Math.round(gapValue)}pts)`;
}

/**
 * Generates divergence callout for radar chart
 */
export function generateDivergenceCallout(
  dimension: string,
  employerWeight: number,
  topPerformerScore: number,
  threshold: number = 15
): string | null {
  const divergence = Math.abs(employerWeight - topPerformerScore);
  
  if (divergence < threshold) return null;
  
  if (topPerformerScore > employerWeight) {
    return `Top performers score ${Math.round(divergence)}pts higher in ${dimension} than your current weighting suggests — consider increasing this dimension's importance`;
  }
  
  return `Your ${dimension} weighting is ${Math.round(divergence)}pts higher than top performer averages — validate if this is strategically intentional`;
}

// ─── State Pattern Detection ───

/**
 * Categorizes candidates into performance bands
 */
export function categorizePerformanceBand(score: number): 'top' | 'mid' | 'low' {
  if (score >= 90) return 'top';
  if (score >= 75) return 'mid';
  return 'low';
}

/**
 * Detects hiring state patterns (green/amber/red)
 */
export function detectHiringState(
  hiredCount: number,
  avgMatchScore: number,
  departedCount: number,
  overdueCount: number
): StatePattern {
  // Red state: high churn or low match scores
  if (departedCount / Math.max(hiredCount, 1) > 0.3 || avgMatchScore < 70) {
    return {
      state: 'red',
      label: 'High Risk',
      description: 'Elevated churn or low match quality',
      count: overdueCount,
    };
  }
  
  // Amber state: moderate concerns
  if (departedCount / Math.max(hiredCount, 1) > 0.15 || avgMatchScore < 80 || overdueCount > 2) {
    return {
      state: 'amber',
      label: 'Monitor',
      description: 'Some hiring quality concerns detected',
      count: overdueCount,
    };
  }
  
  // Green state: healthy metrics
  return {
    state: 'green',
    label: 'Healthy',
    description: 'Strong match quality and retention',
    count: 0,
  };
}

/**
 * Detects patterns in time series data
 */
export function detectTrendPattern(
  values: number[],
  threshold: number = 0.1
): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
  if (values.length < 2) return 'stable';
  
  // Calculate linear regression slope
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  const slope = numerator / denominator;
  
  // Check volatility
  const stdDev = standardDeviation(values);
  const coefficientOfVariation = stdDev / Math.abs(yMean);
  
  if (coefficientOfVariation > 0.3) return 'volatile';
  if (Math.abs(slope) < threshold) return 'stable';
  if (slope > 0) return 'increasing';
  return 'decreasing';
}

// ─── Formatting Utilities ───

/**
 * Formats a number as percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Formats a relative change (e.g., "+12%" or "-5%")
 */
export function formatChange(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Formats a quarter (e.g., "Q1 2026")
 */
export function formatQuarter(year: number, quarter: number): string {
  return `Q${quarter} ${year}`;
}

// ─── Statistical Helpers ───

/**
 * Calculates percentile rank
 */
export function percentileRank(value: number, values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  if (index === -1) return 100;
  return (index / sorted.length) * 100;
}

/**
 * Calculates correlation coefficient between two arrays
 */
export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }
  
  if (xDenominator === 0 || yDenominator === 0) return 0;
  
  return numerator / Math.sqrt(xDenominator * yDenominator);
}

/**
 * Groups array by key function
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Calculates moving average
 */
export function movingAverage(values: number[], windowSize: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }
  
  return result;
}
