/**
 * Statistical calculator for A/B testing feasibility.
 */

export interface CalculationResult {
  sampleSizePerVariation: number;
  totalSampleSize: number;
  estimatedDays: number;
  feasibilityScore: number; // 0-100
  status: 'highly-feasible' | 'feasible' | 'challenging' | 'not-feasible';
}

export function calculateSampleSize(
  baselineCR: number, // 0-1 (e.g., 0.05 for 5%)
  mde: number, // 0-1 (e.g., 0.1 for 10% lift)
  monthlyTraffic: number,
  confidenceLevel: number = 0.95,
  power: number = 0.80
): CalculationResult {
  // Z-scores for common values
  const zAlpha = 1.96; // 95% confidence
  const zBeta = 0.8416; // 80% power

  const p1 = baselineCR;
  const p2 = p1 * (1 + mde);
  
  const variance = p1 * (1 - p1) + p2 * (1 - p2);
  const effectSize = Math.pow(p1 - p2, 2);
  
  const n = Math.ceil((Math.pow(zAlpha + zBeta, 2) * variance) / effectSize);
  
  const totalN = n * 2; // Assuming 2 variations (A and B)
  const dailyTraffic = monthlyTraffic / 30;
  const days = Math.ceil(totalN / dailyTraffic);
  
  // Feasibility Score Logic
  // 1. Duration: < 14 days (100), 14-30 days (70), 30-60 days (40), > 60 days (10)
  let durationScore = 0;
  if (days <= 14) durationScore = 100;
  else if (days <= 30) durationScore = 70;
  else if (days <= 60) durationScore = 40;
  else durationScore = 10;

  // 2. Sample size vs Traffic: If totalN > monthlyTraffic * 2, it's very hard.
  let trafficScore = 100;
  if (totalN > monthlyTraffic * 2) trafficScore = 10;
  else if (totalN > monthlyTraffic) trafficScore = 40;
  else if (totalN > monthlyTraffic * 0.5) trafficScore = 70;

  const feasibilityScore = Math.round((durationScore * 0.6) + (trafficScore * 0.4));
  
  let status: CalculationResult['status'] = 'feasible';
  if (feasibilityScore > 80) status = 'highly-feasible';
  else if (feasibilityScore > 50) status = 'feasible';
  else if (feasibilityScore > 25) status = 'challenging';
  else status = 'not-feasible';

  return {
    sampleSizePerVariation: n,
    totalSampleSize: totalN,
    estimatedDays: days,
    feasibilityScore,
    status
  };
}
