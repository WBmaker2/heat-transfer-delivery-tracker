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

export function revisionStatus(
  prediction: string,
  finalDirection: string,
  predictionPathId: string,
  finalPathId: string,
): "유지함" | "수정함" | "조건이 바뀌어 새 경로를 확인함" {
  if (predictionPathId !== finalPathId) return "조건이 바뀌어 새 경로를 확인함";
  return prediction === finalDirection ? "유지함" : "수정함";
}
