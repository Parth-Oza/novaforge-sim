import type { SimulationSnapshot } from "../sim";

type TelemetryPanelProps = {
  snapshot: SimulationSnapshot;
};

const format = (value: number, digits = 0): string => value.toFixed(digits);

export function TelemetryPanel({ snapshot }: TelemetryPanelProps) {
  const { metrics } = snapshot;
  return (
    <aside className="telemetry panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Mission telemetry</span>
          <h2>Fleet pulse</h2>
        </div>
        <span className="live-pill"><i /> Live</span>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span>Simulation time</span>
          <strong>{format(metrics.simTime, 1)}<small>s</small></strong>
        </div>
        <div className="metric">
          <span>Mission progress</span>
          <strong>{format(metrics.completionPercent)}<small>%</small></strong>
        </div>
        <div className="metric">
          <span>Replans</span>
          <strong>{metrics.replans}</strong>
        </div>
        <div className="metric">
          <span>Safety holds</span>
          <strong>{metrics.safetyHolds}</strong>
        </div>
      </div>

      <div className="progress-track" aria-label="Mission completion">
        <span style={{ width: `${Math.min(metrics.completionPercent, 100)}%` }} />
      </div>

      <div className="robot-list">
        {snapshot.robots.map((robot) => (
          <div className="robot-row" key={robot.id}>
            <span className="robot-swatch" style={{ background: robot.color }} />
            <div>
              <strong>{robot.id}</strong>
              <span>{robot.status}</span>
            </div>
            <code>{Math.round(robot.position.x)}, {Math.round(robot.position.y)}</code>
          </div>
        ))}
      </div>

      <div className="sensor-summary">
        <span>LiDAR frames</span>
        <strong>{metrics.sensorFrames.toLocaleString()}</strong>
      </div>
    </aside>
  );
}
