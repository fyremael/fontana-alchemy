import React, { useState } from 'react';
import { X, Sparkles, BookOpen, ShieldCheck, Flame, Cpu, ArrowRight, Layers, Activity } from 'lucide-react';
import { ReactorEngine } from '../engine/reactor';

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactor: ReactorEngine;
  onSelectScenario: (presetId: string) => void;
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({
  isOpen,
  onClose,
  reactor,
  onSelectScenario
}) => {
  const [activeTab, setActiveTab] = useState<'intuition' | 'phases' | 'dashboard' | 'math'>('intuition');

  if (!isOpen) return null;

  const triggerPhase = (phase: 0 | 1 | 2) => {
    if (phase === 0) {
      reactor.initLevel0();
      onSelectScenario('level0-gas');
    } else if (phase === 1) {
      reactor.injectCatalyticTriplet(0.4);
      onSelectScenario('level1-triplet');
    } else {
      reactor.injectCatalyticTriplet(0.4);
      setTimeout(() => {
        reactor.injectParasite(20);
        reactor.perturbSystem(30);
      }, 300);
      onSelectScenario('level2-immunity');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c101c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                FIELD GUIDE: UNDERSTANDING ALGORITHMIC CHEMISTRY
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold">
                  WALTER FONTANA, 1991
                </span>
              </div>
              <div className="text-xs text-slate-300">
                Constructive Dynamical Systems & The Emergence of Autopoietic Living Organizations
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('intuition')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'intuition'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. Core Intuition (Lay-Speak)
          </button>

          <button
            onClick={() => setActiveTab('phases')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'phases'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Three Phases of Matter
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            3. Dashboard Guide
          </button>

          <button
            onClick={() => setActiveTab('math')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'math'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            4. Math Substrate (λ-Calculus)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          {/* TAB 1: CORE INTUITION */}
          {activeTab === 'intuition' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/30 space-y-2">
                <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  The Thought Experiment: What if computer programs were molecules?
                </div>
                <p className="text-slate-300 leading-normal">
                  In ordinary software, there is a rigid wall between <strong>data</strong> (passive text or numbers) and <strong>code</strong> (the program that manipulates them).
                  In Alonzo Church's <strong>λ-calculus</strong>, however, that divide evaporates:
                  <span className="text-white font-semibold"> every object is both a function and data.</span>
                </p>
                <p className="text-slate-300">
                  In 1991, theoretical biologist Walter Fontana (Santa Fe Institute & Harvard) built an artificial chemistry on this premise:
                  Molecules are computer algorithms floating in a virtual beaker. When Molecule A collides with Molecule B, Molecule A treats Molecule B as its input, runs its program, and computes a newly synthesized Molecule C:
                </p>
                <div className="p-3 rounded bg-black/50 border border-cyan-500/40 text-center font-bold text-cyan-200 text-sm shadow-[0_0_10px_rgba(0,240,255,0.15)]">
                  Molecule A + Molecule B → Molecule C = eval(A · B)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="text-pink-400 font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    The Beaker & The Dilution Drain
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    The reactor holds a fixed capacity of particles (e.g. 150). Whenever a reaction synthesizes a new molecule, it is added to the beaker. To prevent overflow, a random molecule is washed out through the drain.
                  </p>
                  <p className="text-slate-100 text-xs font-semibold">
                    The Law of Survival: Any molecular species that is not continuously regenerated by active reactions will get diluted to extinction.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Life Before DNA: Constructive Self-Organization
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Standard biology assumes you need DNA, enzymes, and cell membranes to have life. Fontana demonstrated that self-maintaining, self-defending computational ecosystems emerge naturally out of pure constructive mathematics.
                  </p>
                  <p className="text-slate-100 text-xs font-semibold">
                    No genetic code is required for matter to organize, defend itself, and maintain homeostatic boundaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE THREE PHASES */}
          {activeTab === 'phases' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Fontana identified three distinct evolutionary levels that constructive dynamical systems undergo. You can trigger each phase directly into the active reactor below:
              </p>

              {/* Phase 0 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="font-bold text-amber-300 text-sm">Phase 0: Entropic Drift (The Random Gas)</span>
                  </div>
                  <button
                    onClick={() => triggerPhase(0)}
                    className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    Load Phase 0 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Molecules are randomized combinator trees. When they collide, they produce random, one-off fragments that never regenerate the parents.
                  Shannon entropy remains high (H ≈ 65%–85%), algebraic closure is low, and the population wanders aimlessly without structure.
                </p>
              </div>

              {/* Phase 1 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-bold text-cyan-300 text-sm">Phase 1: Autopoietic Closure (The Catalytic Triplet)</span>
                  </div>
                  <button
                    onClick={() => triggerPhase(1)}
                    className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-colors"
                  >
                    Trigger Phase 1 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  A cooperative hypercycle appears: A(B) → C, B(C) → A, and C(A) → B.
                  Every collision between team members produces another team member! While random noise terms dilute away, the catalytic core undergoes exponential amplification until taking over the reactor.
                </p>
                <div className="text-xs text-cyan-300 font-mono bg-black/40 p-2.5 rounded border border-cyan-900/60 leading-relaxed">
                  ✦ Result: Entropy plunges, algebraic closure surges to &gt;80%, and a glowing spatial boundary forms enclosing the self-maintaining collective.
                </div>
              </div>

              {/* Phase 2 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-bold text-emerald-300 text-sm">Phase 2: Functional Boundary & Algebraic Immunity</span>
                  </div>
                  <button
                    onClick={() => triggerPhase(2)}
                    className="px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    Test Phase 2 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  The established organization is subjected to thermal shocks and selfish parasite terms (P) that try to siphon away resources.
                  Because the internal catalytic regeneration rate exceeds the damage rate, the organization neutralizes or deflects the intruders, proving that algebraic closures act as emergent immunological membranes.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: READING THE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> 1. Spatial Reactor Canvas
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Shows particles bouncing in 2D continuous space. Glowing halos pulse during reactions, velocity tails reveal kinetic momentum, floating badges display reactions, and the dashed polygon outlines the emergent boundary membrane.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-amber-400 font-bold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> 2. Telemetry & Phase Sparkline
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Tracks Shannon Diversity Entropy H(t) (yellow) and Algebraic Closure Φ (cyan). When Phase 1 nucleates, watch the dramatic inversion: entropy drops as closure spikes upward!
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-purple-400 font-bold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> 3. Reaction Hypergraph
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    A live directed network diagram showing who is catalyzing whom (A + B → C). Node size reflects population abundance in the pool, and curved arrows represent active reaction flows.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> 4. Stoichiometric Closure Matrix
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    An N × N interaction heatmap. When the dominant species cells glow green, it is mathematical proof that the sub-algebra is closed: collisions between them produce only members of their own family!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-xs text-slate-200">
                <span className="text-cyan-300 font-bold">Tip: Click on any particle</span> or open the{' '}
                <span className="text-white font-bold">Reaction Crucible</span> to inspect the step-by-step β-reduction trace of any collision in real-time.
              </div>
            </div>
          )}

          {/* TAB 4: MATHEMATICAL SUBSTRATE */}
          {activeTab === 'math' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-cyan-300 font-bold">Standard Combinator Reduction Rules:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-200">
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-cyan-400 font-bold">I x → x</span> (Identity)
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-amber-400 font-bold">K x y → x</span> (First projection / True)
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-purple-400 font-bold">KI x y → y</span> (Second projection / False)
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-pink-400 font-bold">S x y z → (x z)(y z)</span> (Substitution)
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-emerald-400 font-bold">B x y z → x(y z)</span> (Composition)
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-blue-400 font-bold">C x y z → (x z) y</span> (Permutation)
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-purple-400 font-bold">Turing Completeness & Bounded Normalization:</div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Because the λ-calculus is Turing-complete, the Halting Problem dictates that some collisions would reduce indefinitely without terminating (e.g., Ω = (λx. x x)(λx. x x)).
                  To model a physically realistic chemistry and guarantee 60fps responsiveness, our normalizer bounds reduction depth at 150 steps and AST size at 40 nodes. Divergent collisions are treated as sterile non-reactive bounces.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0c101c] flex items-center justify-between text-xs">
          <div className="text-slate-400 text-xs">
            Fontana & Buss (1994) • SFI Working Paper 94-04-020
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all text-xs"
          >
            Back to Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
