import React, { useRef, useEffect, useState } from 'react';
import { ReactorEngine } from '../engine/reactor';
import { OrganizationMetrics } from '../types';

interface HypergraphViewProps {
  reactor: ReactorEngine;
  metrics: OrganizationMetrics;
}

interface SimNode {
  id: string;
  label: string;
  color: string;
  count: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const HypergraphView: React.FC<HypergraphViewProps> = ({ reactor, metrics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);

  // Maintain persistent node simulation positions
  const simNodesRef = useRef<Map<string, SimNode>>(new Map());

  // Render loop with force-directed physics
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, width, height);

      // Collect top species from metrics to display in hypergraph
      const activeSpecies = metrics.dominantSpecies.slice(0, 10);
      const activeKeys = new Set(activeSpecies.map(s => s.key));

      // Synchronize sim nodes
      const simNodes = simNodesRef.current;
      for (const s of activeSpecies) {
        if (!simNodes.has(s.key)) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 80;
          simNodes.set(s.key, {
            id: s.key,
            label: s.label,
            color: s.color,
            count: s.count,
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            vx: 0,
            vy: 0
          });
        } else {
          const existing = simNodes.get(s.key)!;
          existing.count = s.count;
          existing.color = s.color;
          existing.label = s.label;
        }
      }

      // Remove obsolete nodes
      for (const key of simNodes.keys()) {
        if (!activeKeys.has(key)) {
          simNodes.delete(key);
        }
      }

      const nodeList = Array.from(simNodes.values());

      // Simple, robust force-directed physics step
      const repulsion = 1800;
      const centerGravity = 0.04;
      const damping = 0.88;

      for (let i = 0; i < nodeList.length; i++) {
        const n1 = nodeList[i];

        // Center gravity
        n1.vx += (centerX - n1.x) * centerGravity;
        n1.vy += (centerY - n1.y) * centerGravity;

        // Node repulsion
        for (let j = i + 1; j < nodeList.length; j++) {
          const n2 = nodeList[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          const force = repulsion / distSq;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }

        // Apply velocity & bounding
        n1.vx *= damping;
        n1.vy *= damping;
        n1.x += n1.vx;
        n1.y += n1.vy;

        n1.x = Math.max(30, Math.min(width - 30, n1.x));
        n1.y = Math.max(30, Math.min(height - 30, n1.y));
      }

      // Draw Directed Hypergraph Reaction Edges
      const edges = Array.from(reactor.hypergraphEdges.values()).slice(-25);
      const now = Date.now();

      for (const edge of edges) {
        const sourceNode = simNodes.get(edge.reactantA);
        const targetNode = simNodes.get(edge.product);

        if (sourceNode && targetNode && sourceNode !== targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.hypot(dx, dy) || 1;

          // Curve offset for directed arrow
          const midX = (sourceNode.x + targetNode.x) / 2 - (dy / dist) * 18;
          const midY = (sourceNode.y + targetNode.y) / 2 + (dx / dist) * 18;

          const age = (now - edge.lastActive) / 1000;
          const isFresh = age < 1.5;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.quadraticCurveTo(midX, midY, targetNode.x, targetNode.y);

          ctx.strokeStyle = isFresh ? '#00f0ff' : 'rgba(100, 116, 139, 0.35)';
          ctx.lineWidth = isFresh ? 2.2 : 1;
          if (isFresh) {
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
          }
          ctx.stroke();

          // Draw arrow head near target
          const t = 0.85;
          const ax = (1 - t) * (1 - t) * sourceNode.x + 2 * (1 - t) * t * midX + t * t * targetNode.x;
          const ay = (1 - t) * (1 - t) * sourceNode.y + 2 * (1 - t) * t * midY + t * t * targetNode.y;
          const angle = Math.atan2(targetNode.y - midY, targetNode.x - midX);

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - 7 * Math.cos(angle - Math.PI / 6), ay - 7 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ax - 7 * Math.cos(angle + Math.PI / 6), ay - 7 * Math.sin(angle + Math.PI / 6));
          ctx.fillStyle = isFresh ? '#00f0ff' : 'rgba(100, 116, 139, 0.6)';
          ctx.fill();

          ctx.restore();
        }
      }

      // Draw Nodes
      for (const node of nodeList) {
        const radius = Math.min(26, Math.max(12, 10 + Math.sqrt(node.count) * 2.5));
        const isHovered = hoveredNode?.id === node.id;

        ctx.save();

        // Node Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + (isHovered ? 4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered ? 16 : 8;
        ctx.fill();

        // Border
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(node.label.slice(0, 5), node.x, node.y);

        // Subtext: count
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`×${node.count}`, node.x, node.y + radius + 10);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [reactor, metrics, hoveredNode]);

  // Handle canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: SimNode | null = null;
    for (const node of simNodesRef.current.values()) {
      if (Math.hypot(node.x - mx, node.y - my) < 25) {
        found = node;
        break;
      }
    }
    setHoveredNode(found);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[220px] rounded-lg border border-slate-800 bg-[#0a0d16] overflow-hidden">
      <div className="absolute top-2 left-3 z-10 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        REACTION HYPERGRAPH (A + B → C)
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="w-full h-full block cursor-pointer"
      />

      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 border border-cyan-500/60 rounded px-2 py-1 text-xs font-mono text-slate-200"
          style={{ left: hoveredNode.x + 10, top: hoveredNode.y - 20 }}
        >
          <div className="font-bold text-cyan-300">{hoveredNode.label}</div>
          <div className="text-[10px] text-slate-400">Pool Abundance: {hoveredNode.count}</div>
        </div>
      )}
    </div>
  );
};
