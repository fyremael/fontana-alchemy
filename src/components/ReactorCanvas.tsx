import React, { useRef, useEffect, useState } from 'react';
import { Particle, CollisionEvent, OrganizationMetrics } from '../types';
import { ReactorEngine } from '../engine/reactor';

interface ReactorCanvasProps {
  reactor: ReactorEngine;
  metrics: OrganizationMetrics;
  onSelectParticle?: (particle: Particle) => void;
  selectedParticleId?: string | null;
}

export const ReactorCanvas: React.FC<ReactorCanvasProps> = ({
  reactor,
  metrics,
  onSelectParticle,
  selectedParticleId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredParticle, setHoveredParticle] = useState<Particle | null>(null);

  // Resize canvas to fill parent container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        reactor.setDimensions(width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [reactor]);

  // Main 60fps Canvas Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark background with subtle spatial grid
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle reactor coordinate grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Level 1 / Level 2 Emergent Autopoietic Boundary Hull
      if (metrics.activeCoreHulls.length > 0 && metrics.level >= 1) {
        for (const hull of metrics.activeCoreHulls) {
          if (hull.length >= 3) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(hull[0].x, hull[0].y);
            for (let i = 1; i < hull.length; i++) {
              ctx.lineTo(hull[i].x, hull[i].y);
            }
            ctx.closePath();

            // Bio-cybernetic glowing boundary
            const isLevel2 = metrics.level === 2;
            ctx.fillStyle = isLevel2 ? 'rgba(0, 240, 255, 0.08)' : 'rgba(168, 85, 247, 0.08)';
            ctx.fill();

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = isLevel2 ? 'rgba(0, 240, 255, 0.6)' : 'rgba(168, 85, 247, 0.6)';
            ctx.setLineDash([8, 6]);
            ctx.shadowColor = isLevel2 ? '#00f0ff' : '#a855f7';
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Draw active collision burst waves
      const now = Date.now();
      for (const ev of reactor.recentEvents) {
        const age = (now - ev.time) / 1000;
        if (age < 0.8) {
          const progress = age / 0.8;
          const radius = 12 + progress * 35;
          const alpha = 1 - progress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(ev.x, ev.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.8})`;
          ctx.lineWidth = 2 * (1 - progress);
          ctx.stroke();

          // Render reaction text badge
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${ev.termA} + ${ev.termB} → ${ev.productTerm || 'Ø'}`,
            ev.x,
            ev.y - radius - 4
          );
          ctx.restore();
        }
      }

      // Draw particles
      for (const p of reactor.particles) {
        ctx.save();

        const isSelected = p.id === selectedParticleId;
        const isHovered = hoveredParticle?.id === p.id;
        const isCore = p.role === 'core';

        // Draw reaction pulse halo
        if (p.haloAlpha > 0.05 || isSelected || isHovered) {
          const haloSize = p.radius + (isSelected ? 8 : isHovered ? 6 : p.haloAlpha * 12);
          ctx.beginPath();
          ctx.arc(p.x, p.y, haloSize, 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? 'rgba(255, 255, 255, 0.35)'
            : p.color.replace(')', `, ${Math.max(0.15, p.haloAlpha * 0.4)})`).replace('rgb', 'rgba');
          ctx.fill();
        }

        // Draw particle body
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isCore ? 14 : 6;
        ctx.fill();

        // White border for selected / core
        if (isSelected || isCore) {
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
          ctx.stroke();
        }

        // Velocity vector tail
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3.5, p.y - p.vy * 3.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Symbol label inside particle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(p.label.slice(0, 3), p.x, p.y);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [reactor, metrics, selectedParticleId, hoveredParticle]);

  // Handle canvas mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find closest particle within detection radius
    let found: Particle | null = null;
    let minD = 20;
    for (const p of reactor.particles) {
      const d = Math.hypot(p.x - mx, p.y - my);
      if (d < minD) {
        minD = d;
        found = p;
      }
    }
    setHoveredParticle(found);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredParticle && onSelectParticle) {
      onSelectParticle(hoveredParticle);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[480px] overflow-hidden rounded-lg border border-slate-800 bg-[#07090e]">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Viewport Overlay HUD */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur border border-slate-700/60 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">CSTR REACTOR (2D)</span>
          <span className="text-cyan-400 font-bold">N={reactor.particles.length}</span>
        </div>
        {metrics.level >= 1 && (
          <div className="px-2.5 py-1 rounded bg-purple-950/80 backdrop-blur border border-purple-500/40 text-[11px] font-mono text-purple-300">
            ✦ Emergent Autopoietic Boundary Active
          </div>
        )}
      </div>

      {/* Particle Tooltip */}
      {hoveredParticle && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded px-2.5 py-1.5 text-xs font-mono shadow-xl text-slate-200"
          style={{
            left: Math.min(canvasRef.current?.width || 0 - 160, hoveredParticle.x + 12),
            top: Math.max(10, hoveredParticle.y - 30)
          }}
        >
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: hoveredParticle.color }}
            />
            {hoveredParticle.label}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Role: <span className="uppercase text-slate-200">{hoveredParticle.role}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            AST Size: <span className="text-slate-200">{hoveredParticle.term.size}</span> | Depth: <span className="text-slate-200">{hoveredParticle.term.depth}</span>
          </div>
        </div>
      )}
    </div>
  );
};
