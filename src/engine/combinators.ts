import { LambdaTerm } from '../types';
import { createAtom, createApp, createLam, createVar } from './lambda';

/**
 * Elementary standard combinators
 */
export const COMBINATORS = {
  I: createAtom('I'),
  K: createAtom('K'),
  KI: createAtom('KI'),
  S: createAtom('S'),
  B: createAtom('B'),
  C: createAtom('C'),
  W: createAtom('W'),
  M: createAtom('M'),

  // Autopoietic Hypercycle species (Fontana Level 1 Catalytic Triplet)
  A: createAtom('A'),
  B_mol: createAtom('B'),
  C_mol: createAtom('C'),

  // Parasite species
  P: createAtom('P'),
};

/**
 * Church Numerals:
 * 0 = λf. λx. x
 * 1 = λf. λx. f x
 * 2 = λf. λx. f (f x)
 */
export function churchNumeral(n: number): LambdaTerm {
  let body: LambdaTerm = createVar('x', 0);
  for (let i = 0; i < n; i++) {
    body = createApp(createVar('f', 1), body);
  }
  return createLam('f', createLam('x', body));
}

/**
 * Church Boolean:
 * TRUE  = λx. λy. x  (= K)
 * FALSE = λx. λy. y  (= KI)
 */
export const CHURCH_TRUE = createLam('x', createLam('y', createVar('x')));
export const CHURCH_FALSE = createLam('x', createLam('y', createVar('y')));

/**
 * Generate random combinator tree (for Phase 0 Entropic Noise)
 * Depth between 1 and maxDepth
 */
const ATOM_POOL = ['I', 'K', 'S', 'W', 'M'];

export function generateRandomCombinator(maxDepth = 3): LambdaTerm {
  if (maxDepth <= 1 || Math.random() < 0.35) {
    const symbol = ATOM_POOL[Math.floor(Math.random() * ATOM_POOL.length)];
    return createAtom(symbol);
  }

  // With small probability create a small lambda abstraction
  if (Math.random() < 0.25) {
    const varName = Math.random() < 0.5 ? 'x' : 'y';
    return createLam(varName, generateRandomCombinator(maxDepth - 1));
  }

  // Otherwise binary application
  const left = generateRandomCombinator(maxDepth - 1);
  const right = generateRandomCombinator(maxDepth - 1);
  return createApp(left, right);
}

/**
 * Generate a randomized noise term with distinct naming for tracking
 */
let noiseCounter = 1;
export function generateRandomNoise(): LambdaTerm {
  const base = generateRandomCombinator(3);
  // Give it an informative label
  return base;
}

/**
 * Fontana Autopoietic Triplet Hypercycle:
 * Species A, B, C such that:
 * A B -> C
 * B C -> A
 * C A -> B
 */
export function getCatalyticTriplet(): [LambdaTerm, LambdaTerm, LambdaTerm] {
  return [
    createAtom('A'),
    createAtom('B'),
    createAtom('C')
  ];
}

/**
 * SKI Reconstructive Copy-Closure:
 * A self-maintaining set of combinators that continuously reproduce each other:
 * S (K (S I)), K, S (K K)
 */
export function getSKICopyClosure(): LambdaTerm[] {
  // S (K K) collapses terms, K extracts, I preserves
  const t1 = createApp(createAtom('S'), createApp(createAtom('K'), createAtom('K')));
  const t2 = createApp(createAtom('S'), createApp(createAtom('K'), createAtom('I')));
  const t3 = createAtom('K');
  const t4 = createAtom('I');
  return [t1, t2, t3, t4];
}

/**
 * Parasite Term:
 * Consumes resources without regenerating catalysts
 */
export function getParasiteTerm(): LambdaTerm {
  return createAtom('P');
}
