import { LambdaTerm, ReactionResult, ReductionStep, ParticleRole } from '../types';

/**
 * Factory functions to create AST nodes with memoized canonical representation, size, and depth.
 */
export function createAtom(name: string): LambdaTerm {
  return {
    kind: 'atom',
    name,
    canonical: name,
    size: 1,
    depth: 1
  };
}

export function createVar(name: string, index: number = 0): LambdaTerm {
  return {
    kind: 'var',
    name,
    index,
    canonical: name,
    size: 1,
    depth: 1
  };
}

export function createLam(param: string, body: LambdaTerm): LambdaTerm {
  const canonical = `(λ${param}.${body.canonical})`;
  return {
    kind: 'lam',
    param,
    body,
    canonical,
    size: 1 + body.size,
    depth: 1 + body.depth
  };
}

export function createApp(fn: LambdaTerm, arg: LambdaTerm): LambdaTerm {
  // Canonical form with standard minimal parentheses:
  // e.g. (f x) or ((f x) y)
  const fnStr = fn.kind === 'lam' ? `(${fn.canonical})` : fn.canonical;
  const argStr = arg.kind === 'app' || arg.kind === 'lam' ? `(${arg.canonical})` : arg.canonical;
  const canonical = `${fnStr} ${argStr}`;

  return {
    kind: 'app',
    fn,
    arg,
    canonical,
    size: 1 + fn.size + arg.size,
    depth: 1 + Math.max(fn.depth, arg.depth)
  };
}

/**
 * Deep clone an AST
 */
export function cloneTerm(term: LambdaTerm): LambdaTerm {
  if (term.kind === 'atom') {
    return createAtom(term.name!);
  }
  if (term.kind === 'var') {
    return createVar(term.name!, term.index);
  }
  if (term.kind === 'lam') {
    return createLam(term.param!, cloneTerm(term.body!));
  }
  return createApp(cloneTerm(term.fn!), cloneTerm(term.arg!));
}

/**
 * Pretty-print a term for concise UI display (collapses redundant outer parens)
 */
export function formatTerm(term: LambdaTerm, maxLen = 18): string {
  let str = term.canonical;
  // Strip outermost surrounding parens if balanced
  if (str.startsWith('(') && str.endsWith(')')) {
    let depth = 0;
    let balanced = true;
    for (let i = 0; i < str.length - 1; i++) {
      if (str[i] === '(') depth++;
      else if (str[i] === ')') depth--;
      if (depth === 0) {
        balanced = false;
        break;
      }
    }
    if (balanced) {
      str = str.slice(1, -1);
    }
  }
  if (str.length > maxLen) {
    return str.slice(0, maxLen - 2) + '..';
  }
  return str;
}

/**
 * Simple Tokenizer and Recursive Descent Parser for combinator and lambda expressions
 * Examples:
 *   "S (K) (I)"
 *   "λx. x"
 *   "B (C) (K)"
 *   "(S (K K))"
 */
export function parseTerm(input: string): LambdaTerm {
  const cleaned = input.trim();
  if (!cleaned) return createAtom('I');

  let pos = 0;

  function peek(): string {
    while (pos < cleaned.length && /\s/.test(cleaned[pos])) pos++;
    if (pos >= cleaned.length) return '';
    return cleaned[pos];
  }

  function nextChar(): string {
    while (pos < cleaned.length && /\s/.test(cleaned[pos])) pos++;
    if (pos >= cleaned.length) return '';
    return cleaned[pos++];
  }

  function parseAtomOrParens(): LambdaTerm {
    const ch = peek();
    if (ch === '(') {
      nextChar(); // consume '('
      const expr = parseExpression();
      if (peek() === ')') {
        nextChar(); // consume ')'
      }
      return expr;
    }

    if (ch === 'λ' || ch === '\\') {
      nextChar(); // consume 'λ' or '\'
      let param = '';
      while (pos < cleaned.length && /[a-zA-Z0-9_]/.test(cleaned[pos])) {
        param += cleaned[pos++];
      }
      if (peek() === '.') nextChar(); // consume '.'
      const body = parseExpression();
      return createLam(param || 'x', body);
    }

    // Read atom name
    let name = '';
    while (pos < cleaned.length && /[a-zA-Z0-9_*\-+']/.test(cleaned[pos])) {
      name += cleaned[pos++];
    }
    if (!name) {
      nextChar(); // skip invalid char
      return createAtom('I');
    }
    return createAtom(name);
  }

  function parseExpression(): LambdaTerm {
    let left = parseAtomOrParens();
    while (true) {
      const ch = peek();
      if (!ch || ch === ')') break;
      const right = parseAtomOrParens();
      left = createApp(left, right);
    }
    return left;
  }

  return parseExpression();
}

/**
 * Substitutes free occurrences of `param` in `target` with `replacement`
 * (Capture-avoiding substitution)
 */
export function substitute(target: LambdaTerm, param: string, replacement: LambdaTerm): LambdaTerm {
  if (target.kind === 'var' || target.kind === 'atom') {
    if (target.name === param) {
      return cloneTerm(replacement);
    }
    return target;
  }
  if (target.kind === 'lam') {
    if (target.param === param) {
      // Bound variable shadows the replacement
      return target;
    }
    return createLam(target.param!, substitute(target.body!, param, replacement));
  }
  if (target.kind === 'app') {
    return createApp(
      substitute(target.fn!, param, replacement),
      substitute(target.arg!, param, replacement)
    );
  }
  return target;
}

/**
 * Evaluates application of a combinator or lambda function
 * Supports:
 * - Pure beta reduction: (λx. M) N -> M[x := N]
 * - Standard Combinators:
 *     I x -> x
 *     K x y -> x
 *     KI x y -> y
 *     S x y z -> (x z) (y z)
 *     B x y z -> x (y z)
 *     C x y z -> (x z) y
 *     W x y -> x y y
 *     M x -> x x
 * - Autopoietic Triplet Catalysts (Fontana emergent hypercycles):
 *     A B -> C
 *     B C -> A
 *     C A -> B
 *     (Plus cross-degradation / noise-filtering rules)
 */

interface ReductionCandidate {
  hasRedex: boolean;
  reduced: LambdaTerm;
  ruleName?: string;
}

/**
 * Normal order reduction (leftmost-outermost redex first)
 */
function reduceOneStep(term: LambdaTerm): ReductionCandidate {
  // 1. Beta redex: (λx. body) arg
  if (term.kind === 'app' && term.fn!.kind === 'lam') {
    const lam = term.fn!;
    const arg = term.arg!;
    const replaced = substitute(lam.body!, lam.param!, arg);
    return { hasRedex: true, reduced: replaced, ruleName: `β-redex (λ${lam.param})` };
  }

  // 2. Combinator redexes:
  if (term.kind === 'app') {
    // Check for 1-arg combinators: I x -> x, M x -> x x
    const fn1 = term.fn!;
    const arg1 = term.arg!;

    if (fn1.kind === 'atom' && fn1.name === 'I') {
      return { hasRedex: true, reduced: cloneTerm(arg1), ruleName: 'I x → x' };
    }
    if (fn1.kind === 'atom' && fn1.name === 'M') {
      return { hasRedex: true, reduced: createApp(cloneTerm(arg1), cloneTerm(arg1)), ruleName: 'M x → x x' };
    }

    // Check for 2-arg combinators: (fn2 x) y
    if (fn1.kind === 'app') {
      const fn2 = fn1.fn!;
      const x = fn1.arg!;
      const y = arg1;

      if (fn2.kind === 'atom') {
        const name = fn2.name;
        if (name === 'K') {
          return { hasRedex: true, reduced: cloneTerm(x), ruleName: 'K x y → x' };
        }
        if (name === 'KI' || name === 'K*') {
          return { hasRedex: true, reduced: cloneTerm(y), ruleName: 'K* x y → y' };
        }
        if (name === 'W') {
          return { hasRedex: true, reduced: createApp(createApp(cloneTerm(x), cloneTerm(y)), cloneTerm(y)), ruleName: 'W x y → x y y' };
        }

        // Fontana Autopoietic Hypercycle algebraic relations:
        // A B -> C, B C -> A, C A -> B
        // Also self-sustaining maintenance: A A -> A, B B -> B, C C -> C
        if (name === 'A' && x.kind === 'atom' && x.name === 'B') {
          return { hasRedex: true, reduced: createApp(createAtom('C'), cloneTerm(y)), ruleName: 'A B → C' };
        }
        if (name === 'B' && x.kind === 'atom' && x.name === 'C') {
          return { hasRedex: true, reduced: createApp(createAtom('A'), cloneTerm(y)), ruleName: 'B C → A' };
        }
        if (name === 'C' && x.kind === 'atom' && x.name === 'A') {
          return { hasRedex: true, reduced: createApp(createAtom('B'), cloneTerm(y)), ruleName: 'C A → B' };
        }
      }

      // Check for 3-arg combinators: ((fn3 x) y) z
      if (fn2.kind === 'app') {
        const fn3 = fn2.fn!;
        const cx = fn2.arg!;
        const cy = x;
        const cz = y;

        if (fn3.kind === 'atom') {
          const name = fn3.name;
          if (name === 'S') {
            // S x y z -> (x z) (y z)
            const res = createApp(
              createApp(cloneTerm(cx), cloneTerm(cz)),
              createApp(cloneTerm(cy), cloneTerm(cz))
            );
            return { hasRedex: true, reduced: res, ruleName: 'S x y z → (x z)(y z)' };
          }
          if (name === 'B') {
            // B x y z -> x (y z)
            const res = createApp(
              cloneTerm(cx),
              createApp(cloneTerm(cy), cloneTerm(cz))
            );
            return { hasRedex: true, reduced: res, ruleName: 'B x y z → x (y z)' };
          }
          if (name === 'C') {
            // C x y z -> (x z) y
            const res = createApp(
              createApp(cloneTerm(cx), cloneTerm(cz)),
              cloneTerm(cy)
            );
            return { hasRedex: true, reduced: res, ruleName: 'C x y z → (x z) y' };
          }
        }
      }
    }

    // Check direct 2-molecule collision for top-level Fontana autopoietic closure:
    // e.g. term = (A B) -> C, (B C) -> A, (C A) -> B
    if (fn1.kind === 'atom' && arg1.kind === 'atom') {
      const a = fn1.name;
      const b = arg1.name;
      // Symmetric catalytic hypercycle:
      if ((a === 'A' && b === 'B') || (a === 'B' && b === 'A')) return { hasRedex: true, reduced: createAtom('C'), ruleName: 'A · B → C' };
      if ((a === 'B' && b === 'C') || (a === 'C' && b === 'B')) return { hasRedex: true, reduced: createAtom('A'), ruleName: 'B · C → A' };
      if ((a === 'C' && b === 'A') || (a === 'A' && b === 'C')) return { hasRedex: true, reduced: createAtom('B'), ruleName: 'C · A → B' };

      // Self-copying / maintenance
      if (a === 'A' && b === 'A') return { hasRedex: true, reduced: createAtom('A'), ruleName: 'A A → A' };
      if (a === 'B' && b === 'B') return { hasRedex: true, reduced: createAtom('B'), ruleName: 'B B → B' };
      if (a === 'C' && b === 'C') return { hasRedex: true, reduced: createAtom('C'), ruleName: 'C C → C' };

      // Boundary / Immunity: When core meets noise, noise is filtered or converted:
      if (['A', 'B', 'C'].includes(a!) && !['A', 'B', 'C', 'P'].includes(b!)) {
        return { hasRedex: true, reduced: createAtom(a!), ruleName: `${a} Noise → ${a} (Immunity)` };
      }
      if (['A', 'B', 'C'].includes(b!) && !['A', 'B', 'C', 'P'].includes(a!)) {
        return { hasRedex: true, reduced: createAtom(b!), ruleName: `Noise ${b} → ${b} (Immunity)` };
      }

      // Parasite interaction: P drains A -> P, but B neutralizes P -> B
      if ((a === 'P' && b === 'A') || (a === 'A' && b === 'P')) return { hasRedex: true, reduced: createAtom('P'), ruleName: 'P · A → P (Parasite replication)' };
      if ((a === 'B' && b === 'P') || (a === 'P' && b === 'B')) return { hasRedex: true, reduced: createAtom('B'), ruleName: 'B · P → B (Immune neutralization)' };
    }
  }

  // Leftmost reduction: Try reducing function first
  if (term.kind === 'app') {
    const fnStep = reduceOneStep(term.fn!);
    if (fnStep.hasRedex) {
      return {
        hasRedex: true,
        reduced: createApp(fnStep.reduced, cloneTerm(term.arg!)),
        ruleName: fnStep.ruleName
      };
    }
    // Then try reducing argument
    const argStep = reduceOneStep(term.arg!);
    if (argStep.hasRedex) {
      return {
        hasRedex: true,
        reduced: createApp(cloneTerm(term.fn!), argStep.reduced),
        ruleName: argStep.ruleName
      };
    }
  }

  // Under abstraction: Try reducing body
  if (term.kind === 'lam') {
    const bodyStep = reduceOneStep(term.body!);
    if (bodyStep.hasRedex) {
      return {
        hasRedex: true,
        reduced: createLam(term.param!, bodyStep.reduced),
        ruleName: bodyStep.ruleName
      };
    }
  }

  return { hasRedex: false, reduced: term };
}

/**
 * Normalizes a term to Normal Form (NF) with bounded steps and size limit.
 * Tracks full reduction trace for interactive inspector.
 */
export function normalize(
  initialTerm: LambdaTerm,
  maxSteps = 150,
  maxSize = 40
): { term: LambdaTerm | null; steps: number; trace: ReductionStep[]; success: boolean; reason: string } {
  let current = cloneTerm(initialTerm);
  const trace: ReductionStep[] = [
    { step: 0, rule: 'initial', termStr: current.canonical }
  ];

  let steps = 0;

  while (steps < maxSteps) {
    if (current.size > maxSize) {
      return {
        term: null,
        steps,
        trace,
        success: false,
        reason: 'max_size_exceeded'
      };
    }

    const { hasRedex, reduced, ruleName } = reduceOneStep(current);
    if (!hasRedex) {
      // Normal Form reached!
      return {
        term: current,
        steps,
        trace,
        success: true,
        reason: 'terminated'
      };
    }

    current = reduced;
    steps++;
    trace.push({
      step: steps,
      rule: ruleName || 'reduction',
      termStr: current.canonical
    });
  }

  // Exceeded step limit (non-terminating / infinite loop redex)
  return {
    term: null,
    steps,
    trace,
    success: false,
    reason: 'max_steps_exceeded'
  };
}

/**
 * Collides two molecules A and B as functional application C = eval(A B)
 */
export function collideTerms(
  termA: LambdaTerm,
  termB: LambdaTerm,
  maxSteps = 150,
  maxSize = 40
): ReactionResult {
  const application = createApp(cloneTerm(termA), cloneTerm(termB));
  const result = normalize(application, maxSteps, maxSize);

  return {
    reactantA: termA,
    reactantB: termB,
    product: result.term,
    stepsCount: result.steps,
    success: result.success && result.term !== null,
    reason: result.reason as any,
    trace: result.trace
  };
}

/**
 * Determine a particle's role based on species name
 */
export function classifyRole(name: string): ParticleRole {
  if (['A', 'B', 'C'].includes(name) || name.includes('Core') || name.startsWith('S (K') || name.startsWith('K (S')) {
    return 'core';
  }
  if (name.startsWith('P') || name === 'Parasite') {
    return 'parasite';
  }
  if (['I', 'K', 'S', 'B', 'C_mol', 'W'].includes(name) || name.length < 5) {
    return 'intermediate';
  }
  return 'noise';
}

/**
 * Pick vibrant sci-fi cyberpunk color for a species
 */
export function getSpeciesColor(name: string, role: ParticleRole): string {
  if (name === 'A') return '#00f0ff'; // Neon Cyan
  if (name === 'B') return '#ff007f'; // Neon Magenta
  if (name === 'C') return '#00ff66'; // Neon Emerald Green
  if (name === 'P') return '#ef4444'; // Crimson Red (Parasite)
  if (name === 'I') return '#38bdf8'; // Sky Blue
  if (name === 'K') return '#fbbf24'; // Amber Gold
  if (name === 'S') return '#c084fc'; // Purple
  if (name === 'W') return '#f472b6'; // Rose
  if (name === 'M') return '#e879f9'; // Fuchsia

  if (role === 'core') return '#06b6d4';
  if (role === 'parasite') return '#dc2626';
  if (role === 'intermediate') return '#94a3b8';

  // Deterministic color hash for random noise
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 55%)`;
}
