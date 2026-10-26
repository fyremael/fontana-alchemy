import React from 'react';
import { ReactorEngine } from '../engine/reactor';
import { ReactorConfig } from '../types';
import { Play, Pause, RotateCcw, FastForward, Sparkles, ShieldAlert, Bug, RefreshCw, Flame, FlaskConical } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ControlDeckProps {
  reactor: ReactorEngine;
  config: ReactorConfig;
  onUpdateConfig: (newConfig: Partial<ReactorConfig>) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onStepOnce: () => void;
  onReset: () => void;
  onOpenCrucible: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  reactor,
  config,
  onUpdateConfig,
  isRunning,
  onToggleRun,
  onStepOnce,
  onReset,
  onOpenCrucible
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#ff007f', '#00ff66', '#a855f7']
    });
  };

  const handleInjectTriplet = () => {
    reactor.injectCatalyticTriplet(0.4);
    triggerConfetti();
  };

  const handleInjectSKI = () => {
    reactor.injectSKICopyClosure(0.4);
    triggerConfetti();
  };

  const handleInjectParasite = () => {
    reactor.injectParasite(20);
  };

  const handlePerturb = () => {
    reactor.perturbSystem(35);
  };

  return (
    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg font-mono flex flex-col gap-3">
      {/* Simulation Playback & Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleRun}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'PAUSE' : 'RUN'}
          </button>

          <button
            onClick={onStepOnce}
            disabled={isRunning}
            className="px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 text-xs flex items-center gap-1 border border-slate-700"
            title="Step 1 frame"
          >
            <FastForward className="w-3.5 h-3.5" />
            STEP
          </button>

          <button
            onClick={onReset}
            className="px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1 border border-slate-700"
            title="Reset to random state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>

          {/* Speed Presets */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-2 text-xs">
            <span className="text-slate-400 text-xs mr-1 font-semibold">Speed:</span>
            <button
              onClick={() => onUpdateConfig({ particleSpeed: 0.4 })}
              className={`px-2 py-1 rounded text-xs transition-all ${
                config.particleSpeed <= 0.5 ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold' : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              0.4x Slow
            </button>
            <button
              onClick={() => onUpdateConfig({ particleSpeed: 0.8 })}
              className={`px-2 py-1 rounded text-xs transition-all ${
                config.particleSpeed > 0.5 && config.particleSpeed <= 1.0 ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold' : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              0.8x Normal
            </button>
            <button
              onClick={() => onUpdateConfig({ particleSpeed: 1.8 })}
              className={`px-2 py-1 rounded text-xs transition-all ${
                config.particleSpeed > 1.0 ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold' : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              1.8x Fast
            </button>
          </div>
        </div>

        <button
          onClick={onOpenCrucible}
          className="px-3 py-1.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
        >
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
          REACTION CRUCIBLE
        </button>
      </div>

      {/* Phase Transition Triggers */}
      <div className="flex flex-col gap-2">
        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Phase Transition Triggers & Injections
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => reactor.initLevel0()}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-left flex flex-col gap-0.5"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <RefreshCw className="w-3.5 h-3.5" /> Phase 0 Gas
            </span>
            <span className="text-xs text-slate-400 font-medium">Entropic Noise</span>
          </button>

          <button
            onClick={handleInjectTriplet}
            className="p-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-200 text-left flex flex-col gap-0.5 shadow-[0_0_8px_rgba(0,240,255,0.15)]"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Phase 1 Triplet
            </span>
            <span className="text-xs text-slate-400 font-medium">A·B·C Hypercycle</span>
          </button>

          <button
            onClick={handleInjectSKI}
            className="p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 text-left flex flex-col gap-0.5"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Phase 1 SKI
            </span>
            <span className="text-xs text-slate-400 font-medium">Copy Closure</span>
          </button>

          <button
            onClick={handlePerturb}
            className="p-2.5 rounded-lg bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/40 text-pink-200 text-left flex flex-col gap-0.5"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
              <Flame className="w-3.5 h-3.5 text-pink-400" /> Phase 2 Perturb
            </span>
            <span className="text-xs text-slate-400 font-medium">Thermal Noise Shock</span>
          </button>
        </div>

        {/* Secondary perturbation: Parasite */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={handleInjectParasite}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <Bug className="w-3.5 h-3.5 text-red-400" />
            Inject Parasites (P)
          </button>
          <span className="text-xs text-slate-400">Tests algebraic immunity & boundary permeability</span>
        </div>
      </div>

      {/* Kinetics & Physical Parameter Sliders */}
      <div className="border-t border-slate-800/80 pt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        {/* Population Capacity N */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Capacity (N)</span>
            <span className="text-cyan-400 font-bold">{config.capacity}</span>
          </div>
          <input
            type="range"
            min={50}
            max={250}
            step={10}
            value={config.capacity}
            onChange={(e) => onUpdateConfig({ capacity: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Speed / Temperature */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Pacing (v)</span>
            <span className="text-cyan-400 font-bold">
              {config.particleSpeed.toFixed(1)}x {config.particleSpeed <= 0.5 ? '(Slow)' : config.particleSpeed >= 1.5 ? '(Fast)' : '(Normal)'}
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={2.5}
            step={0.1}
            value={config.particleSpeed}
            onChange={(e) => onUpdateConfig({ particleSpeed: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Collision Radius */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Collision Radius</span>
            <span className="text-cyan-400 font-bold">{config.collisionRadius}px</span>
          </div>
          <input
            type="range"
            min={6}
            max={18}
            step={1}
            value={config.collisionRadius}
            onChange={(e) => onUpdateConfig({ collisionRadius: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Dilution Rate */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Dilution Rate</span>
            <span className="text-cyan-400 font-bold">{(config.dilutionRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0.3}
            max={1.0}
            step={0.05}
            value={config.dilutionRate}
            onChange={(e) => onUpdateConfig({ dilutionRate: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
