import React from 'react';
import { PRESETS, SimulationPreset } from '../engine/presets';
import { ReactorEngine } from '../engine/reactor';
import { Sparkles, Compass, ShieldAlert, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PresetSelectorProps {
  reactor: ReactorEngine;
  activePresetId: string;
  onSelectPreset: (preset: SimulationPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  reactor,
  activePresetId,
  onSelectPreset
}) => {
  const getIcon = (target: string) => {
    switch (target) {
      case 'Level 0':
        return <Compass className="w-3.5 h-3.5 text-amber-400" />;
      case 'Level 1':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Level 2':
        return <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const handleSelect = (preset: SimulationPreset) => {
    preset.action(reactor);
    onSelectPreset(preset);

    if (preset.levelTarget !== 'Level 0') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#00f0ff', '#ff007f', '#00ff66', '#c084fc']
      });
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs font-mono">
      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap mr-1">
        Scenarios:
      </span>
      {PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => handleSelect(preset)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title={preset.description}
          >
            {getIcon(preset.levelTarget)}
            <span>{preset.name}</span>
          </button>
        );
      })}
    </div>
  );
};
