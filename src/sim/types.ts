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

export type RadarConfig = {
  maxRange: number;
  fieldOfViewDegrees: number;
  rangeNoiseStdDev: number;
  bearingNoiseStdDev: number;
  velocityNoiseStdDev: number;
};

export type AcceptanceCriteria = {
  minCompletionPercent?: number;
  minArrivalPercent?: number;
  maxSafetyHolds?: number;
  maxReplans?: number;
};

export type PlannerId = "astar" | "direct-line";

export type PlannerRequest = {
  start: Vec2;
  goal: Vec2;
  width: number;
  height: number;
  gridSize: number;
  obstacles: Obstacle[];
  padding: number;
};

export type PlannerResult = {
  status: "found" | "blocked";
  path: Vec2[];
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
  planner?: PlannerId;
  lidar: LidarConfig;
  radar?: RadarConfig;
  acceptance: AcceptanceCriteria;
  robots: RobotConfig[];
  obstacles: Obstacle[];
};

export type RobotStatus = "planning" | "moving" | "waiting" | "arrived";

export type RobotState = RobotConfig & {
  position: Vec2;
  velocity: Vec2;
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

export type RadarDetection = {
  obstacleId: string;
  range: number;
  bearing: number;
  relativeVelocity: Vec2;
};

export type WaitSample = {
  robotId: string;
  position: Vec2;
  simTime: number;
  reason: "no-path" | "safety-hold";
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

export type AcceptanceCheck = {
  id: keyof AcceptanceCriteria;
  label: string;
  actual: number;
  threshold: number;
  direction: "at-least" | "at-most";
  unit: "percent" | "count";
  passed: boolean;
};

export type ScenarioEvaluation = {
  passed: boolean;
  checks: AcceptanceCheck[];
};

export type SimulationSnapshot = {
  scenario: Pick<
    Scenario,
    | "id"
    | "name"
    | "description"
    | "width"
    | "height"
    | "seed"
    | "durationSeconds"
    | "planner"
    | "acceptance"
    | "radar"
  >;
  robots: RobotState[];
  obstacles: Obstacle[];
  lidar: Record<string, LidarHit[]>;
  radar: Record<string, RadarDetection[]>;
  waitSamples: WaitSample[];
  metrics: SimulationMetrics;
  evaluation: ScenarioEvaluation;
};
