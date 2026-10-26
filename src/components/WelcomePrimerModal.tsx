import React, { useState } from 'react';
import { X, Sparkles, Play, BookOpen, Compass, ShieldCheck, ArrowRight, Activity, Zap } from 'lucide-react';
import { ReactorEngine } from '../engine/reactor';

interface WelcomePrimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPhase1: () => void;
  onOpenFieldGuide: () => void;
  reactor: ReactorEngine;
}

export const WelcomePrimerModal: React.FC<WelcomePrimerModalProps> = ({
  isOpen,
  onClose,
  onLaunchPhase1,
  onOpenFieldGuide,
  reactor
}) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDismiss = (callback?: () => void) => {
    if (dontShowAgain) {
      localStorage.setItem('fontana_alchemy_primer_dismissed', 'true');
    }
    onClose();
    if (callback) callback();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.18)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Accent Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c101c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
                WELCOME TO ALGORITHMIC CHEMISTRY
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold">
                  NEW VIEWER PRIMER
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Walter Fontana's 1991 Artificial Life Model • Software as Matter
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDismiss()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          {/* Hero Explainer Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/40 space-y-2.5">
            <div className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              What is this simulation showing?
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Standard chemistry simulates physical atoms like Hydrogen and Carbon.
              In <strong>Algorithmic Chemistry (AlChemy)</strong>, theoretical biologist Walter Fontana created a universe where
              <span className="text-white font-semibold"> molecules are executable computer programs</span> written in Church's λ-calculus (combinators like <code className="text-cyan-300">I</code>, <code className="text-amber-300">K</code>, <code className="text-pink-300">S</code>, <code className="text-purple-300">W</code>).
            </p>
          </div>

          {/* Three Key Mechanics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Molecules */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-cyan-400 font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  1. The Floating Circles
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every bouncing particle in the 2D beaker is an independent algorithm. Their labels show their mathematical structure (e.g. <code className="text-slate-200">S(KK)</code>).
                </p>
              </div>
              <div className="text-[11px] text-cyan-300 bg-cyan-950/40 p-2 rounded border border-cyan-900/60 font-semibold">
                Functions are data, and data are functions.
              </div>
            </div>

            {/* 2. Collisions */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-pink-400 font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  2. Collisions Compute
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When Molecule A hits Molecule B, A consumes B as input:
                  <div className="font-mono text-pink-300 font-bold my-1 text-center bg-black/40 py-1 rounded border border-pink-500/20">
                    A + B → eval(A · B)
                  </div>
                  New synthesized outputs enter the beaker, while a random term washes down the drain.
                </p>
              </div>
              <div className="text-[11px] text-pink-300 bg-pink-950/40 p-2 rounded border border-pink-900/60 font-semibold">
                Only reproducing species survive dilution!
              </div>
            </div>

            {/* 3. Current State */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-amber-400 font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  3. What You See Now
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The simulation is currently running in <strong className="text-amber-300">Level 0: Entropic Gas</strong> at a gentle pace.
                  Collisions generate random fragments that cannot regenerate their parents. Shannon entropy is high, and closure is low.
                </p>
              </div>
              <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-900/60 font-semibold">
                Random noise without self-maintenance.
              </div>
            </div>
          </div>

          {/* The Punchline: Watch Life Emerge */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              The Emergence of Living Organizations (Phase 1)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a team of programs happens to mutually synthesize each other—such as the Fontana triplet
              <span className="text-emerald-300 font-mono font-bold"> A(B) → C, B(C) → A, C(A) → B</span>—they achieve <strong>autopoietic closure</strong>.
              Every collision between team members creates another team member! The cycle multiplies exponentially, dilutes the random noise away, and self-assembles a glowing functional boundary membrane.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0c101c] flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer w-4 h-4"
            />
            <span>Don't show this orientation on startup</span>
          </label>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleDismiss(onOpenFieldGuide)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-semibold flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Theory Field Guide
            </button>

            <button
              onClick={() => handleDismiss()}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all font-semibold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Watch Level 0 (Slow Pace)
            </button>

            <button
              onClick={() => handleDismiss(onLaunchPhase1)}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.35)]"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Launch Phase 1: Watch Life Emerge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
