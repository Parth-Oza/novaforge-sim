import { clamp, distance } from "./math";
import type { SeededRandom } from "./math";
import type {
  Obstacle,
  RadarConfig,
  RadarDetection,
  RobotState,
  Vec2,
} from "./types";

const normalizeAngle = (angle: number): number => {
  let normalized = angle;
  while (normalized > Math.PI) normalized -= Math.PI * 2;
  while (normalized < -Math.PI) normalized += Math.PI * 2;
  return normalized;
};

const obstacleCenter = (obstacle: Obstacle): Vec2 => ({
  x: obstacle.x + obstacle.width / 2,
  y: obstacle.y + obstacle.height / 2,
});

export const scanRadar = (
  robot: RobotState,
  obstacles: Obstacle[],
  config: RadarConfig,
  random: SeededRandom,
): RadarDetection[] => {
  const halfFieldOfView = (config.fieldOfViewDegrees * Math.PI) / 360;
  return obstacles
    .filter((obstacle) => obstacle.kind === "dynamic")
    .sort((left, right) => left.id.localeCompare(right.id))
    .flatMap((obstacle) => {
      const center = obstacleCenter(obstacle);
      const trueRange = distance(robot.position, center);
      const trueBearing = normalizeAngle(
        Math.atan2(center.y - robot.position.y, center.x - robot.position.x) -
          robot.heading,
      );
      if (trueRange > config.maxRange || Math.abs(trueBearing) > halfFieldOfView) {
        return [];
      }

      const obstacleVelocity = obstacle.motion?.velocity ?? { x: 0, y: 0 };
      return [
        {
          obstacleId: obstacle.id,
          range: clamp(
            trueRange + random.gaussian() * config.rangeNoiseStdDev,
            0,
            config.maxRange,
          ),
          bearing: normalizeAngle(
            trueBearing + random.gaussian() * config.bearingNoiseStdDev,
          ),
          relativeVelocity: {
            x:
              obstacleVelocity.x -
              robot.velocity.x +
              random.gaussian() * config.velocityNoiseStdDev,
            y:
              obstacleVelocity.y -
              robot.velocity.y +
              random.gaussian() * config.velocityNoiseStdDev,
          },
        },
      ];
    });
};
