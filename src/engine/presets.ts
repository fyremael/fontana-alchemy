export interface SimulationPreset {
  id: string;
  name: string;
  levelTarget: 'Level 0' | 'Level 1' | 'Level 2';
  description: string;
  details: string;
  action: (reactor: any) => void;
}

export const PRESETS: SimulationPreset[] = [
  {
    id: 'level0-gas',
    name: 'Level 0: Entropic Gas',
    levelTarget: 'Level 0',
    description: 'Closed λ-calculus terms in random thermal drift. No self-maintaining algebraic closure exists.',
    details: 'Molecules collide and normalize, but products do not recursively regenerate reactants. High Shannon entropy (H ≈ 1.0) and near-zero algebraic closure.',
    action: (reactor) => {
      reactor.initLevel0();
    }
  },
  {
    id: 'level1-triplet',
    name: 'Level 1: Catalytic Triplet (Hypercycle)',
    levelTarget: 'Level 1',
    description: 'Fontana autopoietic hypercycle: A(B) → C, B(C) → A, C(A) → B with recursive closure.',
    details: 'Seeds a minimal mutually-generating 3-species algebra. The cycle undergoes exponential amplification, diluting ambient noise until forming an autopoietic organization.',
    action: (reactor) => {
      reactor.injectCatalyticTriplet(0.4);
    }
  },
  {
    id: 'level1-ski',
    name: 'Level 1: SKI Reconstructive Closure',
    levelTarget: 'Level 1',
    description: 'Combinatory logic closure using S, K, and I combinators to achieve self-reproduction.',
    details: 'Reconstructive algebraic family where S(K)(K) normalizes to I and K projects arguments, forming a self-sustaining combinator manifold.',
    action: (reactor) => {
      reactor.injectSKICopyClosure(0.4);
    }
  },
  {
    id: 'level2-immunity',
    name: 'Level 2: Boundary & Immunity Stress Test',
    levelTarget: 'Level 2',
    description: 'Level 1 organization challenged by continuous combinatorial noise and parasite terms (P).',
    details: 'Demonstrates functional membrane dynamics: the autopoietic core filters non-conforming ambient terms, neutralizes parasites, and preserves homeostatic closure.',
    action: (reactor) => {
      // First ensure core is present
      reactor.injectCatalyticTriplet(0.4);
      // Then inject parasite
      setTimeout(() => {
        reactor.injectParasite(25);
        reactor.perturbSystem(30);
      }, 500);
    }
  }
];
