import { clamp } from "./math";
import type { LidarConfig, LidarHit, Obstacle, RobotState } from "./types";
import type { SeededRandom } from "./math";

const rayBoxDistance = (
  originX: number,
  originY: number,
  directionX: number,
  directionY: number,
  obstacle: Obstacle,
): number | null => {
  const inverseX = Math.abs(directionX) < 1e-9 ? Number.POSITIVE_INFINITY : 1 / directionX;
  const inverseY = Math.abs(directionY) < 1e-9 ? Number.POSITIVE_INFINITY : 1 / directionY;
  const tx1 = (obstacle.x - originX) * inverseX;
  const tx2 = (obstacle.x + obstacle.width - originX) * inverseX;
  const ty1 = (obstacle.y - originY) * inverseY;
  const ty2 = (obstacle.y + obstacle.height - originY) * inverseY;
  const near = Math.max(Math.min(tx1, tx2), Math.min(ty1, ty2));
  const far = Math.min(Math.max(tx1, tx2), Math.max(ty1, ty2));
  if (far < 0 || near > far) return null;
  return near >= 0 ? near : far;
};

const rayWallDistance = (
  x: number,
  y: number,
  directionX: number,
  directionY: number,
  width: number,
  height: number,
): number => {
  const candidates = [
    directionX > 0 ? (width - x) / directionX : Number.POSITIVE_INFINITY,
    directionX < 0 ? -x / directionX : Number.POSITIVE_INFINITY,
    directionY > 0 ? (height - y) / directionY : Number.POSITIVE_INFINITY,
    directionY < 0 ? -y / directionY : Number.POSITIVE_INFINITY,
  ];
  return Math.min(...candidates.filter((value) => value >= 0));
};

export const castLidar = (
  robot: RobotState,
  obstacles: Obstacle[],
  worldWidth: number,
  worldHeight: number,
  config: LidarConfig,
  random: SeededRandom,
): LidarHit[] => {
  const hits: LidarHit[] = [];
  for (let index = 0; index < config.rays; index += 1) {
    const angle = robot.heading + (index / config.rays) * Math.PI * 2;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    let measured = Math.min(
      config.maxRange,
      rayWallDistance(
        robot.position.x,
        robot.position.y,
        directionX,
        directionY,
        worldWidth,
        worldHeight,
      ),
    );
    for (const obstacle of obstacles) {
      const obstacleDistance = rayBoxDistance(
        robot.position.x,
        robot.position.y,
        directionX,
        directionY,
        obstacle,
      );
      if (obstacleDistance !== null) measured = Math.min(measured, obstacleDistance);
    }
    measured = clamp(measured + random.gaussian() * config.noiseStdDev, 0, config.maxRange);
    hits.push({
      angle,
      distance: measured,
      point: {
        x: robot.position.x + directionX * measured,
        y: robot.position.y + directionY * measured,
      },
    });
  }
  return hits;
};
