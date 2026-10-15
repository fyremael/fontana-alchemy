export type CombinatorSymbol = 'I' | 'K' | 'S' | 'B' | 'C' | 'W' | 'M' | 'A' | 'B_mol' | 'C_mol' | 'P';

export type TermKind = 'atom' | 'var' | 'lam' | 'app';

export interface LambdaTerm {
  kind: TermKind;
  name?: string;               // For combinator atom or variable
  index?: number;              // For de Bruijn variable (0-indexed)
  param?: string;              // For named lambda
  body?: LambdaTerm;           // For abstraction
  fn?: LambdaTerm;             // For application
  arg?: LambdaTerm;            // For application
  canonical: string;           // Memoized canonical string representation
  size: number;                // AST node count
  depth: number;               // AST tree depth
}

export type ParticleRole = 'core' | 'intermediate' | 'noise' | 'parasite';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  term: LambdaTerm;
  speciesKey: string;          // Canonical identifier
  label: string;               // Display label (e.g. "K", "S(K)(I)")
  color: string;
  role: ParticleRole;
  age: number;
  lastReactionTime: number;
  haloAlpha: number;           // Visual pulse on reaction
}

export interface CollisionEvent {
  x: number;
  y: number;
  termA: string;
  termB: string;
  productTerm?: string;
  success: boolean;
  time: number;
}

export interface ReductionStep {
  step: number;
  rule: string;
  termStr: string;
}

export interface ReactionResult {
  reactantA: LambdaTerm;
  reactantB: LambdaTerm;
  product: LambdaTerm | null;
  stepsCount: number;
  success: boolean;
  reason?: 'terminated' | 'max_steps_exceeded' | 'max_size_exceeded' | 'sterile_constant';
  trace: ReductionStep[];
}

export interface HypergraphNode {
  id: string;
  label: string;
  count: number;
  color: string;
  role: ParticleRole;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface HypergraphEdge {
  id: string;
  reactantA: string;
  reactantB: string;
  product: string;
  weight: number;
  lastActive: number;
}

export interface OrganizationMetrics {
  level: 0 | 1 | 2;
  levelName: string;
  shannonEntropy: number;       // Normalized [0, 1]
  rawEntropy: number;          // In nats or bits
  uniqueSpeciesCount: number;
  totalParticles: number;
  closureRatio: number;        // [0, 1] % of reactions among top species producing top species
  dominantSpecies: Array<{
    key: string;
    label: string;
    count: number;
    ratio: number;
    color: string;
    role: ParticleRole;
  }>;
  totalCollisions: number;
  reactionsSucceeded: number;
  sterileCollisions: number;
  dilutionCount: number;
  activeCoreHulls: Array<Array<{ x: number; y: number }>>;
}

export interface ReactorConfig {
  capacity: number;            // Default 150
  particleSpeed: number;       // Speed factor (0.2 - 3.0)
  collisionRadius: number;     // Interaction radius (8 - 25)
  dilutionRate: number;        // Washout probability (0.5 - 1.0)
  maxReductionSteps: number;   // Normalizer limit (50 - 500)
  maxTermSize: number;         // AST size limit (20 - 80)
  twoWayCollision: boolean;    // Try both A(B) and B(A)
  activePresetId: string;
}
