import { castLidar } from "./lidar";
import { circleIntersectsObstacle, distance, SeededRandom } from "./math";
import { planPath } from "./planner";
import type {
  Obstacle,
  RobotState,
  Scenario,
  SimulationMetrics,
  SimulationSnapshot,
  Vec2,
} from "./types";

const cloneScenario = (scenario: Scenario): Scenario => structuredClone(scenario);

const createRobotState = (robot: Scenario["robots"][number]): RobotState => ({
  ...robot,
  position: { ...robot.start },
  heading: Math.atan2(robot.goal.y - robot.start.y, robot.goal.x - robot.start.x),
  status: "planning",
  path: [],
  waypointIndex: 0,
  distanceTravelled: 0,
  replans: 0,
});

export class SimulationEngine {
  readonly fixedStep = 1 / 60;

  private scenario: Scenario;
  private robots: RobotState[];
  private obstacles: Obstacle[];
  private random: SeededRandom;
  private simTime = 0;
  private safetyHolds = 0;
  private sensorFrames = 0;
  private replanAccumulator = 0;
  private lidar: SimulationSnapshot["lidar"] = {};

  constructor(scenario: Scenario) {
    this.scenario = cloneScenario(scenario);
    this.robots = this.scenario.robots.map(createRobotState);
    this.obstacles = structuredClone(this.scenario.obstacles);
    this.random = new SeededRandom(this.scenario.seed);
    this.replanAll();
    this.scanAll();
  }

  reset(scenario = this.scenario): void {
    this.scenario = cloneScenario(scenario);
    this.robots = this.scenario.robots.map(createRobotState);
    this.obstacles = structuredClone(this.scenario.obstacles);
    this.random = new SeededRandom(this.scenario.seed);
    this.simTime = 0;
    this.safetyHolds = 0;
    this.sensorFrames = 0;
    this.replanAccumulator = 0;
    this.lidar = {};
    this.replanAll();
    this.scanAll();
  }

  step(delta = this.fixedStep): SimulationSnapshot {
    const dt = Math.min(Math.max(delta, 0), 0.1);
    this.simTime += dt;
    this.replanAccumulator += dt;
    this.updateDynamicObstacles(dt);

    if (this.replanAccumulator >= 0.5) {
      this.replanAccumulator = 0;
      this.replanAll();
    }

    for (const robot of this.robots) this.updateRobot(robot, dt);
    this.scanAll();
    return this.snapshot();
  }

  snapshot(): SimulationSnapshot {
    const arrived = this.robots.filter((robot) => robot.status === "arrived").length;
    const totalProgress = this.robots.reduce((sum, robot) => {
      const total = Math.max(distance(robot.start, robot.goal), 1);
      const remaining = distance(robot.position, robot.goal);
      return sum + Math.min(1, Math.max(0, 1 - remaining / total));
    }, 0);
    const metrics: SimulationMetrics = {
      simTime: this.simTime,
      safetyHolds: this.safetyHolds,
      replans: this.robots.reduce((sum, robot) => sum + robot.replans, 0),
      sensorFrames: this.sensorFrames,
      arrived,
      totalRobots: this.robots.length,
      completionPercent: (totalProgress / Math.max(this.robots.length, 1)) * 100,
    };

    return {
      scenario: {
        id: this.scenario.id,
        name: this.scenario.name,
        description: this.scenario.description,
        width: this.scenario.width,
        height: this.scenario.height,
        seed: this.scenario.seed,
      },
      robots: structuredClone(this.robots),
      obstacles: structuredClone(this.obstacles),
      lidar: structuredClone(this.lidar),
      metrics,
    };
  }

  private replanAll(): void {
    for (const robot of this.robots) {
      if (robot.status === "arrived") continue;
      const otherRobots: Obstacle[] = this.robots
        .filter((other) => other.id !== robot.id)
        .map((other) => ({
          id: `robot-${other.id}`,
          x: other.position.x - other.radius,
          y: other.position.y - other.radius,
          width: other.radius * 2,
          height: other.radius * 2,
          kind: "dynamic",
        }));
      const path = planPath(
        robot.position,
        robot.goal,
        this.scenario.width,
        this.scenario.height,
        this.scenario.gridSize,
        [...this.obstacles, ...otherRobots],
        robot.radius + 4,
      );
      robot.path = path;
      robot.waypointIndex = path.length > 1 ? 1 : 0;
      robot.status = path.length > 1 ? "moving" : "waiting";
      robot.replans += 1;
    }
  }

  private scanAll(): void {
    for (const robot of this.robots) {
      this.lidar[robot.id] = castLidar(
        robot,
        this.obstacles,
        this.scenario.width,
        this.scenario.height,
        this.scenario.lidar,
        this.random,
      );
      this.sensorFrames += 1;
    }
  }

  private updateRobot(robot: RobotState, dt: number): void {
    if (robot.status === "arrived") return;
    if (distance(robot.position, robot.goal) <= robot.radius + 5) {
      robot.position = { ...robot.goal };
      robot.status = "arrived";
      return;
    }

    const waypoint = robot.path[robot.waypointIndex];
    if (!waypoint) {
      robot.status = "waiting";
      return;
    }

    const waypointDistance = distance(robot.position, waypoint);
    if (waypointDistance <= Math.max(5, robot.maxSpeed * dt * 1.5)) {
      robot.waypointIndex += 1;
      return;
    }

    const heading = Math.atan2(
      waypoint.y - robot.position.y,
      waypoint.x - robot.position.x,
    );
    const stepDistance = Math.min(robot.maxSpeed * dt, waypointDistance);
    const candidate: Vec2 = {
      x: robot.position.x + Math.cos(heading) * stepDistance,
      y: robot.position.y + Math.sin(heading) * stepDistance,
    };
    const hitsObstacle = this.obstacles.some((obstacle) =>
      circleIntersectsObstacle(candidate, robot.radius + 2, obstacle),
    );
    const hitsRobot = this.robots.some(
      (other) =>
        other.id !== robot.id &&
        distance(candidate, other.position) <= robot.radius + other.radius + 3,
    );

    if (hitsObstacle || hitsRobot) {
      robot.status = "waiting";
      this.safetyHolds += 1;
      return;
    }

    robot.position = candidate;
    robot.heading = heading;
    robot.status = "moving";
    robot.distanceTravelled += stepDistance;
  }

  private updateDynamicObstacles(dt: number): void {
    for (const obstacle of this.obstacles) {
      if (!obstacle.motion) continue;
      obstacle.x += obstacle.motion.velocity.x * dt;
      obstacle.y += obstacle.motion.velocity.y * dt;

      if (obstacle.x <= 8 || obstacle.x + obstacle.width >= this.scenario.width - 8) {
        obstacle.motion.velocity.x *= -1;
        obstacle.x = Math.min(
          this.scenario.width - obstacle.width - 8,
          Math.max(8, obstacle.x),
        );
      }
      if (obstacle.y <= 8 || obstacle.y + obstacle.height >= this.scenario.height - 8) {
        obstacle.motion.velocity.y *= -1;
        obstacle.y = Math.min(
          this.scenario.height - obstacle.height - 8,
          Math.max(8, obstacle.y),
        );
      }
    }
  }
}
