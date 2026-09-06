# NovaForge Sim Roadmap

The roadmap favors a trustworthy simulation core before high-fidelity presentation.

## 0.1 Foundation

- [x] Deterministic fixed-step engine
- [x] Multi-robot simulation
- [x] A* planning and path simplification
- [x] LiDAR ray casting and seeded noise
- [x] Dynamic obstacles and replanning
- [x] Browser interface and telemetry
- [x] Headless batch runner
- [x] Scenario schema and contributor documentation

## 0.2 Scenario laboratory

- [ ] Import and export scenario JSON
- [x] Acceptance thresholds and pass/fail reports
- [ ] Replay timeline with pause, seek, and single-step controls
- [ ] Collision, wait-time, and near-miss heatmaps
- [ ] Property-based world generation
- [ ] Automatic failure minimization

## 0.3 Plugin surface

- [ ] Planner interface
- [ ] Sensor interface
- [ ] Controller interface
- [ ] Metrics interface
- [ ] Versioned scenario format
- [ ] Worker-safe plugin runtime

## 0.4 Robotics bridge

- [ ] ROS2 bridge reference package
- [ ] MCAP import and export
- [ ] Twist, odometry, scan, and transform adapters
- [ ] Hardware-in-the-loop timing hooks
- [ ] Example Nav2 integration

## 0.5 Scale and fidelity

- [ ] Web Worker execution pool
- [ ] WebGPU occupancy and ray-casting kernels
- [ ] Camera, depth, radar, and semantic sensors
- [ ] Differential, Ackermann, and holonomic dynamics
- [ ] Three-dimensional renderer adapter
- [ ] Distributed scenario orchestration

## Non-goals for the current release

- Certified safety validation
- Replacement of physical robot testing
- High-fidelity rigid-body or deformable-body physics
- Compatibility promises before the plugin interfaces stabilize
