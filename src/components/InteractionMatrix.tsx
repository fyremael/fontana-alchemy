import React, { useState, useMemo } from 'react';
import { OrganizationMetrics } from '../types';
import { parseTerm, collideTerms, formatTerm } from '../engine/lambda';

interface InteractionMatrixProps {
  metrics: OrganizationMetrics;
}

export const InteractionMatrix: React.FC<InteractionMatrixProps> = ({ metrics }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: string;
    col: string;
    product: string | null;
    isClosed: boolean;
  } | null>(null);

  // Take top 5 dominant species
  const topSpecies = useMemo(() => {
    return metrics.dominantSpecies.slice(0, 5);
  }, [metrics.dominantSpecies]);

  const dominantKeys = useMemo(() => new Set(topSpecies.map(s => s.key)), [topSpecies]);

  // Compute interaction matrix for the top species
  const matrixData = useMemo(() => {
    if (topSpecies.length === 0) return [];

    const rows = [];
    for (let i = 0; i < topSpecies.length; i++) {
      const rowSpecies = topSpecies[i];
      const cells = [];

      for (let j = 0; j < topSpecies.length; j++) {
        const colSpecies = topSpecies[j];
        const termA = parseTerm(rowSpecies.key);
        const termB = parseTerm(colSpecies.key);

        const reaction = collideTerms(termA, termB, 80, 30);
        const productTerm = reaction.product ? formatTerm(reaction.product) : null;
        const productCanonical = reaction.product ? reaction.product.canonical : null;
        const isClosed = productCanonical !== null && dominantKeys.has(productCanonical);

        cells.push({
          rowKey: rowSpecies.key,
          colKey: colSpecies.key,
          rowLabel: rowSpecies.label,
          colLabel: colSpecies.label,
          product: productTerm,
          isClosed,
          success: reaction.success
        });
      }
      rows.push({
        species: rowSpecies,
        cells
      });
    }
    return rows;
  }, [topSpecies, dominantKeys]);

  if (topSpecies.length === 0) {
    return (
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-500 text-center">
        No dominant species detected yet.
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg font-mono">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Closure Matrix: eval(A, B)
        </div>
        <div className="text-[10px] text-cyan-400">
          Closure: <span className="font-bold">{(metrics.closureRatio * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="p-1 text-[10px] text-slate-500 font-normal">A \ B</th>
              {topSpecies.map((s, idx) => (
                <th
                  key={idx}
                  className="p-1 text-[10px] font-bold"
                  style={{ color: s.color }}
                  title={s.label}
                >
                  {s.label.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row, rIdx) => (
              <tr key={rIdx}>
                <td
                  className="p-1 text-[10px] font-bold text-left"
                  style={{ color: row.species.color }}
                >
                  {row.species.label.slice(0, 3)}
                </td>
                {row.cells.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    onMouseEnter={() =>
                      setHoveredCell({
                        row: cell.rowLabel,
                        col: cell.colLabel,
                        product: cell.product,
                        isClosed: cell.isClosed
                      })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`p-1 text-[10px] border border-slate-800/80 cursor-pointer transition-colors ${
                      cell.isClosed
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/40 border-emerald-500/40'
                        : cell.product
                        ? 'bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/40'
                        : 'bg-slate-950/40 text-slate-600 hover:bg-slate-900'
                    }`}
                  >
                    {cell.product ? cell.product.slice(0, 3) : 'Ø'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hover Inspection Bar */}
      <div className="mt-2 text-[10px] text-slate-400 min-h-[18px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 flex items-center justify-between">
        {hoveredCell ? (
          <>
            <span>
              <span className="text-white font-bold">{hoveredCell.row}</span> ({hoveredCell.col}) →{' '}
              <span className="text-cyan-300 font-bold">{hoveredCell.product || 'sterile (Ø)'}</span>
            </span>
            <span className={hoveredCell.isClosed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {hoveredCell.isClosed ? '✓ In Closure' : '✗ External Product'}
            </span>
          </>
        ) : (
          <span className="text-slate-600">Hover cell to inspect functional reaction</span>
        )}
      </div>
    </div>
  );
};
