import { parseTerm, collideTerms, normalize, formatTerm } from './lambda';
import { ReactorEngine } from './reactor';
import { analyzeOrganization } from './organization';

console.log('🧪 Running Fontana Algorithmic Chemistry Engine Verification...\n');

let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

// 1. Test I combinator: I x -> x
{
  const termI = parseTerm('I');
  const termK = parseTerm('K');
  const res = collideTerms(termI, termK);
  assert(res.success && res.product?.canonical === 'K', 'I K normalizes to K');
}

// 2. Test K combinator: K x y -> x
{
  const termK_S = parseTerm('K S');
  const termI = parseTerm('I');
  const res = collideTerms(termK_S, termI);
  assert(res.success && res.product?.canonical === 'S', '(K S) I normalizes to S');
}

// 3. Test S combinator: S K K x -> x (Synthesizing Identity I)
{
  const termSKK = parseTerm('S K K');
  const termX = parseTerm('I');
  const res = collideTerms(termSKK, termX);
  assert(res.success && res.product?.canonical === 'I', '(S K K) I normalizes to I');
}

// 4. Test Bounded Reduction on Divergent / Infinite Loop Term: M M = (λx. x x)(λx. x x)
{
  const termM = parseTerm('M');
  const res = collideTerms(termM, termM, 40); // 40 step cap
  assert(!res.success && res.reason === 'max_steps_exceeded', 'M M correctly halts under bounded step limit');
}

// 5. Test Fontana Autopoietic Triplet Hypercycle
{
  const A = parseTerm('A');
  const B = parseTerm('B');
  const C = parseTerm('C');

  const ab = collideTerms(A, B);
  const bc = collideTerms(B, C);
  const ca = collideTerms(C, A);

  assert(ab.success && ab.product?.canonical === 'C', 'A B → C (Hypercycle edge 1)');
  assert(bc.success && bc.product?.canonical === 'A', 'B C → A (Hypercycle edge 2)');
  assert(ca.success && ca.product?.canonical === 'B', 'C A → B (Hypercycle edge 3)');
}

// 6. Test CSTR Reactor & Level 0 -> Level 1 Phase Transition
{
  const reactor = new ReactorEngine(600, 400, { capacity: 100 });
  assert(reactor.particles.length === 100, 'Reactor initialized with capacity 100');

  // Initial Level 0 state
  const m0 = analyzeOrganization(reactor.particles, {
    totalCollisions: 0,
    reactionsSucceeded: 0,
    sterileCollisions: 0,
    dilutionCount: 0
  });

  assert(m0.shannonEntropy > 0.6, `Level 0 entropy is high (H = ${m0.shannonEntropy.toFixed(3)})`);
  assert(m0.closureRatio < 0.35, `Level 0 closure ratio is low (Φ = ${m0.closureRatio.toFixed(3)})`);
  assert(m0.level === 0, 'Initial organizational state classified as Level 0');

  // Nucleate Level 1 Catalytic Triplet
  console.log('\n  ⚡ Injecting Fontana Catalytic Triplet (A, B, C)...');
  reactor.injectCatalyticTriplet(0.5);

  // Run 150 physics & collision steps to allow hypercycle amplification and dilution
  for (let s = 0; s < 150; s++) {
    reactor.step(1);
  }

  const m1 = analyzeOrganization(reactor.particles, {
    totalCollisions: reactor.totalCollisions,
    reactionsSucceeded: reactor.reactionsSucceeded,
    sterileCollisions: reactor.sterileCollisions,
    dilutionCount: reactor.dilutionCount
  });

  console.log(`  📊 After kinetics: Total collisions = ${reactor.totalCollisions}, Reactions = ${reactor.reactionsSucceeded}, Dilutions = ${reactor.dilutionCount}`);
  console.log(`  📊 Dominant species: ${m1.dominantSpecies.map(d => `${d.label} (${(d.ratio*100).toFixed(0)}%)`).join(', ')}`);
  console.log(`  📊 Entropy H = ${m1.shannonEntropy.toFixed(3)}, Closure Φ = ${m1.closureRatio.toFixed(3)}, Level = ${m1.level}`);

  assert(m1.closureRatio >= 0.5, `Phase 1 transition establishes high algebraic closure (Φ = ${m1.closureRatio.toFixed(3)})`);
  assert(m1.dominantSpecies.some(d => ['A', 'B', 'C'].includes(d.label)), 'Catalytic core dominates population pool');
  assert(reactor.reactionsSucceeded > 0, 'Reactions successfully occurred in CSTR');
}

if (failed === 0) {
  console.log('\n🎉 ALL ALCHEMIC ENGINE TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error(`\n❌ ${failed} TEST(S) FAILED.\n`);
  process.exit(1);
}
