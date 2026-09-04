export type Vec2 = {
  x: number;
  y: number;
};

export type DynamicMotion = {
  velocity: Vec2;
};

export type Obstacle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: "rack" | "wall" | "rock" | "dynamic";
  motion?: DynamicMotion;
};

export type RobotConfig = {
  id: string;
  start: Vec2;
  goal: Vec2;
  radius: number;
  maxSpeed: number;
  color: string;
};

export type LidarConfig = {
  rays: number;
  maxRange: number;
  noiseStdDev: number;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  seed: number;
  width: number;
  height: number;
  gridSize: number;
  durationSeconds: number;
  lidar: LidarConfig;
  robots: RobotConfig[];
  obstacles: Obstacle[];
};

export type RobotStatus = "planning" | "moving" | "waiting" | "arrived";

export type RobotState = RobotConfig & {
  position: Vec2;
  heading: number;
  status: RobotStatus;
  path: Vec2[];
  waypointIndex: number;
  distanceTravelled: number;
  replans: number;
};

export type LidarHit = {
  angle: number;
  distance: number;
  point: Vec2;
};

export type SimulationMetrics = {
  simTime: number;
  safetyHolds: number;
  replans: number;
  sensorFrames: number;
  arrived: number;
  totalRobots: number;
  completionPercent: number;
};

export type SimulationSnapshot = {
  scenario: Pick<Scenario, "id" | "name" | "description" | "width" | "height" | "seed">;
  robots: RobotState[];
  obstacles: Obstacle[];
  lidar: Record<string, LidarHit[]>;
  metrics: SimulationMetrics;
};
