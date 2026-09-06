import { useEffect, useMemo, useRef, useState } from "react";
import { ScenarioPanel } from "./components/ScenarioPanel";
import { SimulatorCanvas } from "./components/SimulatorCanvas";
import { TelemetryPanel } from "./components/TelemetryPanel";
import { getScenario, scenarios, SimulationEngine } from "./sim";
import type { SimulationSnapshot } from "./sim";

export default function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const scenario = useMemo(() => getScenario(scenarioId), [scenarioId]);
  const engineRef = useRef(new SimulationEngine(scenario));
  const [snapshot, setSnapshot] = useState<SimulationSnapshot>(engineRef.current.snapshot());
  const [running, setRunning] = useState(true);
  const [showLidar, setShowLidar] = useState(true);
  const [showPaths, setShowPaths] = useState(true);

  useEffect(() => {
    engineRef.current = new SimulationEngine(scenario);
    setSnapshot(engineRef.current.snapshot());
    setRunning(true);
  }, [scenario]);

  useEffect(() => {
    if (!running) return;
    let animationFrame = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    let publishAccumulator = 0;

    const tick = (now: number) => {
      const frameSeconds = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      accumulator += frameSeconds;
      publishAccumulator += frameSeconds;

      while (accumulator >= engineRef.current.fixedStep) {
        engineRef.current.step();
        accumulator -= engineRef.current.fixedStep;
      }
      if (publishAccumulator >= 1 / 24) {
        setSnapshot(engineRef.current.snapshot());
        publishAccumulator = 0;
      }
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [running]);

  const reset = () => {
    engineRef.current.reset(scenario);
    setSnapshot(engineRef.current.snapshot());
    setRunning(false);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="NovaForge Sim home">
          <img src="/mark.svg" alt="" />
          <span>
            <strong>NovaForge</strong>
            <small>Autonomy simulation lab</small>
          </span>
        </a>
        <div className="topbar-status">
          <span>Deterministic core</span>
          <span>Browser native</span>
          <a href="https://github.com/Parth-Oza/novaforge-sim">GitHub ↗</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <span className="eyebrow hero-eyebrow">Open autonomy infrastructure</span>
          <h1>Simulate the edge cases<br /><em>before reality does.</em></h1>
        </div>
        <p>
          A deterministic, browser-native laboratory for multi-robot planning,
          sensor experiments, and CI-ready scenario regression.
        </p>
      </section>

      <section className="workspace" aria-label="Simulation workspace">
        <ScenarioPanel
          scenarios={scenarios}
          scenarioId={scenarioId}
          running={running}
          showLidar={showLidar}
          showPaths={showPaths}
          onScenarioChange={setScenarioId}
          onToggleRunning={() => setRunning((value) => !value)}
          onReset={reset}
          onShowLidarChange={setShowLidar}
          onShowPathsChange={setShowPaths}
        />

        <div className="viewport panel">
          <div className="viewport-heading">
            <div>
              <span className="eyebrow">Digital twin viewport</span>
              <h2>{snapshot.scenario.name}</h2>
            </div>
            <div className="viewport-legend">
              <span><i className="legend-robot" /> Autonomous unit</span>
              <span><i className="legend-dynamic" /> Dynamic object</span>
            </div>
          </div>
          <SimulatorCanvas snapshot={snapshot} showLidar={showLidar} showPaths={showPaths} />
          <div className="viewport-footer">
            <span>Fixed step 60 Hz</span>
            <span>Planner refresh 2 Hz</span>
            <span>Seeded sensor noise</span>
          </div>
        </div>

        <TelemetryPanel snapshot={snapshot} />
      </section>

      <footer>
        <p>Built for researchers, robotics engineers, and curious contributors.</p>
        <span>NovaForge Sim · MIT licensed · v0.2.0</span>
      </footer>
    </main>
  );
}
