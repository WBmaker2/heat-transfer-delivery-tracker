import type { ThermalScenario } from "../domain/types";

export function getChartDomain(scenario: ThermalScenario): { min: number; max: number } {
  const values = scenario.frames.flatMap((frame) => Object.values(frame.temperaturesC));
  return {
    min: Math.max(0, Math.floor(Math.min(...values, 20) / 10) * 10 - 10),
    max: Math.min(80, Math.ceil(Math.max(...values, 40) / 10) * 10 + 10),
  };
}
