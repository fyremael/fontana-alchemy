import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ReactorEngine } from './engine/reactor';
import { analyzeOrganization } from './engine/organization';
import { ReactorCanvas } from './components/ReactorCanvas';
import { HypergraphView } from './components/HypergraphView';
import { InteractionMatrix } from './components/InteractionMatrix';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { ControlDeck } from './components/ControlDeck';
import { CrucibleModal } from './components/CrucibleModal';
import { PresetSelector } from './components/PresetSelector';
import { ExplainerModal } from './components/ExplainerModal';
import { Particle, OrganizationMetrics, ReactorConfig } from './types';
import { Atom, BookOpen, HelpCircle } from 'lucide-react';

export function App() {
  // Master simulation engine
  const reactorRef = useRef<ReactorEngine | null>(null);
  if (!reactorRef.current) {
    reactorRef.current = new ReactorEngine(800, 550);
  }
  const reactor = reactorRef.current;

  // React state for reactive telemetry & UI updates
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [selectedParticle, setSelectedParticle] = useState<Particle | null>(null);
  const [isCrucibleOpen, setIsCrucibleOpen] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('level0-gas');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<OrganizationMetrics>(() =>
    analyzeOrganization(reactor.particles, {
      totalCollisions: 0,
      reactionsSucceeded: 0,
      sterileCollisions: 0,
      dilutionCount: 0
    })
  );

  const [history, setHistory] = useState<Array<{ time: number; entropy: number; closureRatio: number }>>([]);
  const [config, setConfig] = useState<ReactorConfig>(reactor.config);

  // Periodic Telemetry Evaluation Loop
  useEffect(() => {
    let frameCount = 0;
    let animId: number;

    const loop = () => {
      if (isRunning) {
        reactor.step(1);
        frameCount++;

        // Update telemetry analysis every 10 frames (~6 times/sec) to optimize CPU
        if (frameCount % 10 === 0) {
          const newMetrics = analyzeOrganization(
            reactor.particles,
            {
              totalCollisions: reactor.totalCollisions,
              reactionsSucceeded: reactor.reactionsSucceeded,
              sterileCollisions: reactor.sterileCollisions,
              dilutionCount: reactor.dilutionCount
            },
            reactor.perturbationActive
          );

          setMetrics(newMetrics);

          setHistory((prev) => {
            const next = [
              ...prev,
              {
                time: Date.now(),
                entropy: newMetrics.shannonEntropy,
                closureRatio: newMetrics.closureRatio
              }
            ];
            return next.slice(-40); // Keep last 40 data points for sparkline
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, reactor]);

  const handleUpdateConfig = useCallback((newConfig: Partial<ReactorConfig>) => {
    reactor.updateConfig(newConfig);
    setConfig({ ...reactor.config });
  }, [reactor]);

  const handleStepOnce = useCallback(() => {
    reactor.step(1);
    const newMetrics = analyzeOrganization(
      reactor.particles,
      {
        totalCollisions: reactor.totalCollisions,
        reactionsSucceeded: reactor.reactionsSucceeded,
        sterileCollisions: reactor.sterileCollisions,
        dilutionCount: reactor.dilutionCount
      },
      reactor.perturbationActive
    );
    setMetrics(newMetrics);
  }, [reactor]);

  const handleReset = useCallback(() => {
    reactor.initLevel0();
    setActivePresetId('level0-gas');
    setHistory([]);
    const newMetrics = analyzeOrganization(
      reactor.particles,
      {
        totalCollisions: 0,
        reactionsSucceeded: 0,
        sterileCollisions: 0,
        dilutionCount: 0
      }
    );
    setMetrics(newMetrics);
  }, [reactor]);

  const handleSelectParticle = (p: Particle) => {
    setSelectedParticle(p);
    setIsCrucibleOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-slate-100 overflow-hidden font-mono select-none">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-[#0c101b] px-4 py-2 flex items-center justify-between z-10 flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Atom className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-wide text-white whitespace-nowrap">
                FONTANA'S ALCHEMIC REACTOR
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold whitespace-nowrap">
                λ-CALCULUS SUBSTRATE
              </span>
            </div>
            <div className="text-xs text-slate-400 hidden xl:block whitespace-nowrap">
              Constructive Dynamical Systems & Autopoietic Phase Transitions (Walter Fontana, 1991)
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <PresetSelector
            reactor={reactor}
            activePresetId={activePresetId}
            onSelectPreset={(p) => setActivePresetId(p.id)}
          />

          <button
            onClick={() => setShowInfoModal(true)}
            className="px-2.5 py-1.5 rounded bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 transition-all flex items-center gap-1.5 text-xs font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)] shrink-0"
            title="Field Guide & Theory Explainer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">HOW IT WORKS</span>
          </button>
        </div>
      </header>

      {/* Main Dual Viewport Body */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 gap-3">
        {/* Left Viewport: 2D Spatial Reactor & Control Deck */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 h-full">
          {/* Reactor Canvas */}
          <div className="flex-1 min-h-[350px] relative">
            <ReactorCanvas
              reactor={reactor}
              metrics={metrics}
              onSelectParticle={handleSelectParticle}
              selectedParticleId={selectedParticle?.id}
            />
          </div>

          {/* Control Deck */}
          <div className="flex-shrink-0">
            <ControlDeck
              reactor={reactor}
              config={config}
              onUpdateConfig={handleUpdateConfig}
              isRunning={isRunning}
              onToggleRun={() => setIsRunning((r) => !r)}
              onStepOnce={handleStepOnce}
              onReset={handleReset}
              onOpenCrucible={() => setIsCrucibleOpen(true)}
            />
          </div>
        </div>

        {/* Right Sidebar: Telemetry, Hypergraph & Closure Matrix */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col gap-3 h-full overflow-y-auto pr-0.5 flex-shrink-0">
          {/* Telemetry Dashboard */}
          <TelemetryDashboard metrics={metrics} history={history} />

          {/* Live Reaction Hypergraph */}
          <div className="h-[230px] flex-shrink-0">
            <HypergraphView reactor={reactor} metrics={metrics} />
          </div>

          {/* Stoichiometric Interaction Matrix */}
          <div className="flex-shrink-0">
            <InteractionMatrix metrics={metrics} />
          </div>
        </div>
      </main>

      {/* Crucible Modal */}
      <CrucibleModal
        isOpen={isCrucibleOpen}
        onClose={() => setIsCrucibleOpen(false)}
        initialTermA={selectedParticle?.label || 'S (K) (K)'}
        initialTermB="I"
      />

      {/* Comprehensive Scientific Field Guide & Explainer Modal */}
      <ExplainerModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        reactor={reactor}
        onSelectScenario={(presetId) => setActivePresetId(presetId)}
      />
    </div>
  );
}

export default App;
