import type { HeatTransferMode, ThermalScenario } from "./types";

export type FrameDirectionAnswer = {
  id: string;
  fromId: string;
  toId: string;
  direction: string;
  mode: HeatTransferMode;
  textAlternative: string;
};

export function frameDirectionAnswers(scenario: ThermalScenario, frameIndex: number): FrameDirectionAnswer[] {
  return scenario.frames[frameIndex].edges.map((edge) => ({
    id: `${edge.fromId}-to-${edge.toId}`,
    fromId: edge.fromId,
    toId: edge.toId,
    direction: edge.netDirection === "none" ? "none" : `${edge.fromId}-to-${edge.toId}`,
    mode: edge.mode,
    textAlternative: edge.textAlternative,
  }));
}

export function areAcceptedFrameDirections(scenario: ThermalScenario, frameIndex: number, choices: Record<string, string>): boolean {
  return frameDirectionAnswers(scenario, frameIndex).every((answer) => choices[answer.id] === answer.direction);
}

export function isAcceptedFinalDirection(scenario: ThermalScenario, choice: string): boolean {
  return frameDirectionAnswers(scenario, scenario.frames.length - 1)[0]?.direction === choice;
}

export function revisionStatus(prediction: string, finalDirection: string): "유지함" | "수정함" {
  return prediction === finalDirection ? "유지함" : "수정함";
}
