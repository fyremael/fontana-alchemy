import React, { useRef, useEffect } from 'react';
import { OrganizationMetrics } from '../types';
import { Activity, ShieldCheck, Zap, AlertTriangle, Layers } from 'lucide-react';

interface TelemetryDashboardProps {
  metrics: OrganizationMetrics;
  history: Array<{ time: number; entropy: number; closureRatio: number }>;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ metrics, history }) => {
  const sparklineRef = useRef<HTMLCanvasElement>(null);

  // Render Entropy & Closure sparkline
  useEffect(() => {
    const canvas = sparklineRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (history.length < 2) return;

    // Draw grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // 1. Draw Entropy Line (Neon Amber / Orange)
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = (i / (history.length - 1)) * width;
      const y = height - history[i].entropy * (height - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 2. Draw Closure Line (Neon Cyan)
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = (i / (history.length - 1)) * width;
      const y = height - history[i].closureRatio * (height - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }, [history]);

  const levelColor =
    metrics.level === 2
      ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
      : metrics.level === 1
      ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300'
      : 'border-amber-500/60 bg-amber-950/40 text-amber-300';

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Level Status Banner */}
      <div className={`p-3 rounded-lg border flex items-center justify-between shadow-lg ${levelColor}`}>
        <div className="flex items-center gap-2.5">
          {metrics.level === 2 ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
          ) : metrics.level === 1 ? (
            <Layers className="w-5 h-5 text-cyan-400 animate-pulse" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Organizational State
            </div>
            <div className="text-base font-bold tracking-tight">{metrics.levelName}</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs px-2.5 py-1 rounded bg-black/40 border border-white/10 font-bold">
            PHASE {metrics.level}
          </span>
        </div>
      </div>

      {/* Primary Metrics Gauges */}
      <div className="grid grid-cols-2 gap-2">
        {/* Shannon Entropy */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 uppercase flex items-center justify-between mb-1.5">
            <span className="font-semibold">Entropy H(t)</span>
            <span className="text-amber-400 font-bold text-sm">{(metrics.shannonEntropy * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, metrics.shannonEntropy * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1.5 flex justify-between font-medium">
            <span>Crystalline</span>
            <span>Entropic Gas</span>
          </div>
        </div>

        {/* Algebraic Closure Ratio */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 uppercase flex items-center justify-between mb-1.5">
            <span className="font-semibold">Closure Ratio Φ</span>
            <span className="text-cyan-400 font-bold text-sm">{(metrics.closureRatio * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300 rounded-full shadow-[0_0_8px_#00f0ff]"
              style={{ width: `${Math.min(100, metrics.closureRatio * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1.5 flex justify-between font-medium">
            <span>Open (0%)</span>
            <span>Self-Closed</span>
          </div>
        </div>
      </div>

      {/* Historical Sparkline Chart */}
      <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Phase Trajectory (Entropy vs. Closure)
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-1.5 bg-amber-400 inline-block rounded-sm" /> H
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-1.5 bg-cyan-400 inline-block rounded-sm" /> Φ
            </span>
          </div>
        </div>
        <canvas
          ref={sparklineRef}
          width={280}
          height={60}
          className="w-full h-[60px] block rounded bg-slate-950/60"
        />
      </div>

      {/* Kinetic Throughput Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800/80">
          <div className="text-slate-400 uppercase font-medium">Collisions</div>
          <div className="text-slate-100 font-bold text-sm mt-0.5">{metrics.totalCollisions}</div>
        </div>
        <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800/80">
          <div className="text-slate-400 uppercase font-medium">Reactions</div>
          <div className="text-cyan-400 font-bold text-sm mt-0.5">{metrics.reactionsSucceeded}</div>
        </div>
        <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800/80">
          <div className="text-slate-400 uppercase font-medium">Dilutions</div>
          <div className="text-purple-400 font-bold text-sm mt-0.5">{metrics.dilutionCount}</div>
        </div>
      </div>

      {/* Dominant Species Abundance Table */}
      <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="text-xs text-slate-300 uppercase font-semibold mb-2 flex items-center justify-between">
          <span>Active Species ({metrics.uniqueSpeciesCount} unique)</span>
          <span>Abundance</span>
        </div>
        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
          {metrics.dominantSpecies.slice(0, 5).map((sp, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950/40 border border-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
                <span className="font-bold text-slate-100">{sp.label}</span>
                <span className="text-xs text-slate-400 uppercase px-1.5 py-0.5 rounded bg-slate-800 font-medium">
                  {sp.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">{sp.count} mol</span>
                <span className="text-cyan-400 font-bold w-12 text-right">
                  {(sp.ratio * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
