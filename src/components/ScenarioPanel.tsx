import type { Scenario } from "../sim";

type ScenarioPanelProps = {
  scenarios: Scenario[];
  scenarioId: string;
  running: boolean;
  showLidar: boolean;
  showPaths: boolean;
  onScenarioChange: (scenarioId: string) => void;
  onToggleRunning: () => void;
  onReset: () => void;
  onShowLidarChange: (value: boolean) => void;
  onShowPathsChange: (value: boolean) => void;
};

export function ScenarioPanel({
  scenarios,
  scenarioId,
  running,
  showLidar,
  showPaths,
  onScenarioChange,
  onToggleRunning,
  onReset,
  onShowLidarChange,
  onShowPathsChange,
}: ScenarioPanelProps) {
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  return (
    <section className="scenario panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Scenario control</span>
          <h2>Mission lab</h2>
        </div>
        <span className="seed">Seed {scenario.seed}</span>
      </div>

      <label className="field-label" htmlFor="scenario-select">World</label>
      <select
        id="scenario-select"
        value={scenarioId}
        onChange={(event) => onScenarioChange(event.target.value)}
      >
        {scenarios.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
      <p className="scenario-description">{scenario.description}</p>

      <div className="control-row">
        <button className="primary-button" type="button" onClick={onToggleRunning}>
          <span>{running ? "Pause" : "Launch"}</span>
          <kbd>{running ? "Ⅱ" : "▶"}</kbd>
        </button>
        <button className="secondary-button" type="button" onClick={onReset}>Reset</button>
      </div>

      <div className="toggle-list">
        <label>
          <span>
            <strong>LiDAR field</strong>
            <small>Visualize sampled range rays</small>
          </span>
          <input
            type="checkbox"
            checked={showLidar}
            onChange={(event) => onShowLidarChange(event.target.checked)}
          />
        </label>
        <label>
          <span>
            <strong>Planner traces</strong>
            <small>Show live A* waypoint paths</small>
          </span>
          <input
            type="checkbox"
            checked={showPaths}
            onChange={(event) => onShowPathsChange(event.target.checked)}
          />
        </label>
      </div>

      <div className="scenario-stats">
        <span><strong>{scenario.robots.length}</strong> robots</span>
        <span><strong>{scenario.obstacles.length}</strong> obstacles</span>
        <span><strong>{scenario.lidar.rays}</strong> rays</span>
      </div>
    </section>
  );
}
