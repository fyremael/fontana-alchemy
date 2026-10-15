import React, { useState } from 'react';
import { parseTerm, collideTerms, formatTerm, normalize } from '../engine/lambda';
import { X, Play, RotateCcw, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface CrucibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermA?: string;
  initialTermB?: string;
}

export const CrucibleModal: React.FC<CrucibleModalProps> = ({
  isOpen,
  onClose,
  initialTermA = 'S (K) (K)',
  initialTermB = 'I'
}) => {
  const [inputA, setInputA] = useState(initialTermA);
  const [inputB, setInputB] = useState(initialTermB);
  const [reactionResult, setReactionResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleEvaluate = () => {
    try {
      const termA = parseTerm(inputA);
      const termB = parseTerm(inputB);
      const result = collideTerms(termA, termB, 150, 40);
      setReactionResult(result);
    } catch (e: any) {
      setReactionResult({
        success: false,
        reason: e.message || 'Syntax parse error',
        trace: []
      });
    }
  };

  const loadPresetPair = (a: string, b: string) => {
    setInputA(a);
    setInputB(b);
    try {
      const termA = parseTerm(a);
      const termB = parseTerm(b);
      const result = collideTerms(termA, termB, 150, 40);
      setReactionResult(result);
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-100 text-sm tracking-wide">
              REACTION CRUCIBLE: λ-CALCULUS STEP-BY-STEP WORKBENCH
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Presets */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1.5">
              Classic Fontana Reactions:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => loadPresetPair('A', 'B')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-[11px]"
              >
                A + B → C (Hypercycle)
              </button>
              <button
                onClick={() => loadPresetPair('B', 'C')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/30 text-[11px]"
              >
                B + C → A
              </button>
              <button
                onClick={() => loadPresetPair('S (K) (K)', 'I')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-[11px]"
              >
                (S K K) I → I (Identity Synthesis)
              </button>
              <button
                onClick={() => loadPresetPair('K (S (K))', 'B')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px]"
              >
                K (S K) B → S K
              </button>
              <button
                onClick={() => loadPresetPair('P', 'A')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30 text-[11px]"
              >
                P + A → P (Parasite)
              </button>
            </div>
          </div>

          {/* Input Editors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Reactant Term A:
              </label>
              <input
                type="text"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                placeholder="e.g. S (K) (K) or λx. x"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Reactant Term B:
              </label>
              <input
                type="text"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                placeholder="e.g. I or λy. y"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-pink-300 font-mono focus:border-pink-400 focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleEvaluate}
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 text-xs shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              COLLIDE & NORMALIZE
            </button>
          </div>

          {/* Reduction Result & Trace */}
          {reactionResult && (
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  {reactionResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="font-bold text-slate-200">
                    {reactionResult.success ? 'NORMAL FORM REACHED' : 'COLLISION TERMINATED WITHOUT PRODUCT'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {reactionResult.stepsCount} β-steps | Reason:{' '}
                  <span className="text-cyan-300">{reactionResult.reason}</span>
                </div>
              </div>

              {reactionResult.product && (
                <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Product Molecule C:</div>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {formatTerm(reactionResult.product, 40)}
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <div>Canonical: {reactionResult.product.canonical}</div>
                    <div>AST Nodes: {reactionResult.product.size} | Depth: {reactionResult.product.depth}</div>
                  </div>
                </div>
              )}

              {/* Step by Step Trace */}
              <div>
                <div className="text-[11px] text-slate-400 font-semibold mb-1.5">
                  Leftmost-Outermost Reduction Trace:
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {reactionResult.trace?.map((step: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-slate-500 font-bold">#{step.step}</span>
                        <span className="text-slate-300 font-mono">{step.termStr}</span>
                      </div>
                      <span className="text-[10px] text-purple-400 px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-800/40">
                        {step.rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
