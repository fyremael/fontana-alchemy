import { Particle, OrganizationMetrics, ParticleRole, HypergraphNode, HypergraphEdge } from '../types';
import { collideTerms, parseTerm } from './lambda';

/**
 * 2D Point for Convex Hull
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Monotone chain 2D Convex Hull algorithm
 */
export function computeConvexHull(points: Point2D[]): Point2D[] {
  if (points.length < 3) return points;

  // Sort points lexicographically by x, then y
  const sorted = points.slice().sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

  // 2D cross product of OA and OB vectors:
  // Returns > 0 if O, A, B turn counterclockwise, < 0 if clockwise, 0 if collinear
  function cross(o: Point2D, a: Point2D, b: Point2D): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  // Build lower hull
  const lower: Point2D[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Build upper hull
  const upper: Point2D[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove the last point of each list because it's repeated
  lower.pop();
  upper.pop();

  return lower.concat(upper);
}

/**
 * Calculate Shannon diversity entropy of the population
 * H = - Σ p_i ln(p_i)
 * Normalized against ln(N)
 */
export function computeShannonEntropy(speciesCounts: Map<string, number>, totalCount: number): { raw: number; normalized: number } {
  if (totalCount <= 1) return { raw: 0, normalized: 0 };

  let raw = 0;
  for (const count of speciesCounts.values()) {
    if (count > 0) {
      const p = count / totalCount;
      raw -= p * Math.log(p);
    }
  }

  const maxEntropy = Math.log(totalCount);
  const normalized = maxEntropy > 0 ? Math.min(1, Math.max(0, raw / maxEntropy)) : 0;

  return { raw, normalized };
}

/**
 * Evaluate the Algebraic Closure of the dominant species
 * Checks if applying any pair of dominant species produces an element within the dominant set.
 */
export function computeAlgebraicClosure(
  dominantSpecies: Array<{ key: string; label: string; count: number }>,
  maxSteps = 100
): { closureRatio: number; matrix: Map<string, string | null> } {
  if (dominantSpecies.length === 0) {
    return { closureRatio: 0, matrix: new Map() };
  }

  const keys = dominantSpecies.map(s => s.key);
  const keySet = new Set(keys);
  let closedCount = 0;
  let totalEvaluated = 0;
  const matrix = new Map<string, string | null>();

  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < keys.length; j++) {
      const keyA = keys[i];
      const keyB = keys[j];
      const termA = parseTerm(keyA);
      const termB = parseTerm(keyB);

      const reaction = collideTerms(termA, termB, maxSteps, 30);
      const cellKey = `${keyA}|${keyB}`;

      if (reaction.success && reaction.product) {
        const productKey = reaction.product.canonical;
        matrix.set(cellKey, productKey);
        if (keySet.has(productKey)) {
          closedCount++;
        }
      } else {
        matrix.set(cellKey, null);
      }
      totalEvaluated++;
    }
  }

  const closureRatio = totalEvaluated > 0 ? closedCount / totalEvaluated : 0;
  return { closureRatio, matrix };
}

/**
 * Compute full organizational metrics and classify system level
 */
export function analyzeOrganization(
  particles: Particle[],
  stats: { totalCollisions: number; reactionsSucceeded: number; sterileCollisions: number; dilutionCount: number },
  perturbationActive: boolean = false
): OrganizationMetrics {
  const total = particles.length;
  if (total === 0) {
    return {
      level: 0,
      levelName: 'Level 0 (Vacuum)',
      shannonEntropy: 0,
      rawEntropy: 0,
      uniqueSpeciesCount: 0,
      totalParticles: 0,
      closureRatio: 0,
      dominantSpecies: [],
      totalCollisions: stats.totalCollisions,
      reactionsSucceeded: stats.reactionsSucceeded,
      sterileCollisions: stats.sterileCollisions,
      dilutionCount: stats.dilutionCount,
      activeCoreHulls: []
    };
  }

  // 1. Group by species
  const counts = new Map<string, { count: number; label: string; role: ParticleRole; color: string }>();
  for (const p of particles) {
    const existing = counts.get(p.speciesKey);
    if (existing) {
      existing.count++;
    } else {
      counts.set(p.speciesKey, {
        count: 1,
        label: p.label,
        role: p.role,
        color: p.color
      });
    }
  }

  // 2. Compute Shannon Entropy
  const speciesCountsOnly = new Map<string, number>();
  counts.forEach((v, k) => speciesCountsOnly.set(k, v.count));
  const entropy = computeShannonEntropy(speciesCountsOnly, total);

  // 3. Sort dominant species
  const sortedSpecies = Array.from(counts.entries())
    .map(([key, data]) => ({
      key,
      label: data.label,
      count: data.count,
      ratio: data.count / total,
      color: data.color,
      role: data.role
    }))
    .sort((a, b) => b.count - a.count);

  // Consider top species representing at least 3% of the population
  const significantSpecies = sortedSpecies.filter(s => s.count >= 2 || s.ratio >= 0.03).slice(0, 6);
  const { closureRatio: rawClosure } = computeAlgebraicClosure(significantSpecies);
  const coverage = significantSpecies.reduce((sum, s) => sum + s.ratio, 0);
  // Fontana self-maintaining closure: algebraic closure scaled by population abundance
  const closureRatio = rawClosure * Math.min(1.0, coverage * 1.3);

  // 4. Calculate convex hulls for core particles
  const corePoints = particles
    .filter(p => p.role === 'core')
    .map(p => ({ x: p.x, y: p.y }));

  const activeCoreHulls: Point2D[][] = [];
  if (corePoints.length >= 3) {
    activeCoreHulls.push(computeConvexHull(corePoints));
  }

  // 5. Determine Organizational Level:
  // Level 0: Entropic Gas (High entropy H > 0.65, no dominant catalytic core)
  // Level 1: Autopoietic Closure (Closure ratio >= 0.60, coreRatio >= 0.25, low entropy)
  // Level 2: Immune Closure & Boundary (Established closure maintaining resilience against parasites/noise)
  let level: 0 | 1 | 2 = 0;
  let levelName = 'Level 0: Entropic Drift';

  const coreCount = particles.filter(p => p.role === 'core').length;
  const coreRatio = coreCount / total;
  const top3Ratio = sortedSpecies.slice(0, 3).reduce((acc, s) => acc + s.ratio, 0);
  const hasCoreOrganization = coreRatio >= 0.20 || (top3Ratio >= 0.45 && closureRatio >= 0.65);

  if (hasCoreOrganization && closureRatio >= 0.55 && entropy.normalized < 0.75) {
    const hasParasite = particles.some(p => p.role === 'parasite');
    const hasAmbientNoise = particles.some(p => p.role === 'noise');

    if (perturbationActive || hasParasite || (hasAmbientNoise && coreRatio >= 0.40)) {
      level = 2;
      levelName = 'Level 2: Immune Closure & Boundary';
    } else {
      level = 1;
      levelName = 'Level 1: Autopoietic Closure';
    }
  } else if (coreRatio > 0.1 || closureRatio > 0.5) {
    level = 0;
    levelName = 'Level 0: Proto-Cluster Drift';
  }

  return {
    level,
    levelName,
    shannonEntropy: entropy.normalized,
    rawEntropy: entropy.raw,
    uniqueSpeciesCount: counts.size,
    totalParticles: total,
    closureRatio,
    dominantSpecies: sortedSpecies.slice(0, 8),
    totalCollisions: stats.totalCollisions,
    reactionsSucceeded: stats.reactionsSucceeded,
    sterileCollisions: stats.sterileCollisions,
    dilutionCount: stats.dilutionCount,
    activeCoreHulls
  };
}
