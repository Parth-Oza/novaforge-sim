import { useEffect, useRef } from "react";
import type { SimulationSnapshot } from "../sim";

type SimulatorCanvasProps = {
  snapshot: SimulationSnapshot;
  showLidar: boolean;
  showPaths: boolean;
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
};

export function SimulatorCanvas({ snapshot, showLidar, showPaths }: SimulatorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const { width, height } = snapshot.scenario;

    context.clearRect(0, 0, width, height);
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#07141b");
    background.addColorStop(0.52, "#0a1820");
    background.addColorStop(1, "#081019");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(114, 241, 255, 0.055)";
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 24) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y <= height; y += 24) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    context.strokeStyle = "rgba(114, 241, 255, 0.28)";
    context.lineWidth = 2;
    context.strokeRect(1, 1, width - 2, height - 2);

    for (const obstacle of snapshot.obstacles) {
      const dynamic = obstacle.kind === "dynamic";
      const fill = dynamic ? "rgba(255, 102, 140, 0.22)" : "rgba(39, 64, 74, 0.88)";
      const stroke = dynamic ? "rgba(255, 102, 140, 0.9)" : "rgba(126, 164, 174, 0.55)";
      context.shadowBlur = dynamic ? 18 : 0;
      context.shadowColor = dynamic ? "#ff668c" : "transparent";
      roundedRect(context, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 7);
      context.fillStyle = fill;
      context.fill();
      context.strokeStyle = stroke;
      context.lineWidth = dynamic ? 2 : 1;
      context.stroke();
      context.shadowBlur = 0;

      if (!dynamic) {
        context.strokeStyle = "rgba(114, 241, 255, 0.12)";
        for (let offset = 12; offset < obstacle.width; offset += 18) {
          context.beginPath();
          context.moveTo(obstacle.x + offset, obstacle.y + 6);
          context.lineTo(obstacle.x + offset, obstacle.y + obstacle.height - 6);
          context.stroke();
        }
      }
    }

    if (showLidar) {
      for (const robot of snapshot.robots) {
        const rays = snapshot.lidar[robot.id] ?? [];
        context.strokeStyle = `${robot.color}24`;
        context.lineWidth = 0.7;
        for (let index = 0; index < rays.length; index += 2) {
          const ray = rays[index];
          context.beginPath();
          context.moveTo(robot.position.x, robot.position.y);
          context.lineTo(ray.point.x, ray.point.y);
          context.stroke();
        }
      }
    }

    for (const robot of snapshot.robots) {
      if (showPaths && robot.path.length > 1) {
        context.beginPath();
        context.moveTo(robot.position.x, robot.position.y);
        for (let index = robot.waypointIndex; index < robot.path.length; index += 1) {
          context.lineTo(robot.path[index].x, robot.path[index].y);
        }
        context.setLineDash([6, 9]);
        context.strokeStyle = `${robot.color}b8`;
        context.lineWidth = 2;
        context.stroke();
        context.setLineDash([]);
      }

      context.beginPath();
      context.arc(robot.goal.x, robot.goal.y, robot.radius + 7, 0, Math.PI * 2);
      context.strokeStyle = `${robot.color}70`;
      context.lineWidth = 2;
      context.stroke();
      context.beginPath();
      context.arc(robot.goal.x, robot.goal.y, 3, 0, Math.PI * 2);
      context.fillStyle = robot.color;
      context.fill();

      context.save();
      context.translate(robot.position.x, robot.position.y);
      context.rotate(robot.heading);
      context.shadowBlur = 22;
      context.shadowColor = robot.color;
      context.beginPath();
      context.arc(0, 0, robot.radius + 3, 0, Math.PI * 2);
      context.fillStyle = "rgba(5, 15, 20, 0.96)";
      context.fill();
      context.strokeStyle = robot.color;
      context.lineWidth = 3;
      context.stroke();
      context.shadowBlur = 0;
      context.beginPath();
      context.moveTo(robot.radius + 8, 0);
      context.lineTo(robot.radius - 2, -6);
      context.lineTo(robot.radius - 2, 6);
      context.closePath();
      context.fillStyle = robot.color;
      context.fill();
      context.restore();

      context.font = "600 11px Inter, system-ui, sans-serif";
      context.fillStyle = "rgba(226, 244, 246, 0.86)";
      context.textAlign = "center";
      context.fillText(robot.id.toUpperCase(), robot.position.x, robot.position.y - robot.radius - 13);
    }
  }, [showLidar, showPaths, snapshot]);

  return (
    <canvas
      ref={canvasRef}
      className="simulator-canvas"
      width={snapshot.scenario.width}
      height={snapshot.scenario.height}
      aria-label={`Live simulation of ${snapshot.scenario.name}`}
    />
  );
}
