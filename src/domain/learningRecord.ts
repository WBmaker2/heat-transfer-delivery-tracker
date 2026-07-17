import type { ThermalScenario } from "./types";

export function isAcceptedFinalDirection(scenario: ThermalScenario, choice: string): boolean {
  return scenario.acceptedFinalDirections.includes(choice);
}

export function revisionStatus(prediction: string, finalDirection: string): "유지함" | "수정함" {
  return prediction === finalDirection ? "유지함" : "수정함";
}
