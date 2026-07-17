import { transferModeConcept, type HeatTransferMode, type ThermalScenario } from "./types.ts";

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

export function areAcceptedFrameModes(scenario: ThermalScenario, frameIndex: number, choices: Record<string, string>): boolean {
  return frameDirectionAnswers(scenario, frameIndex).every((answer) => choices[answer.id] === transferModeConcept(answer.mode));
}

export function frameComparisonStatus(
  initialDirection: string,
  finalDirection: string,
  initialPathId: string,
  finalPathId: string,
): "예측 시점과 마지막 방향이 같음" | "시간이 지나 열 이동 방향이 바뀜" | "살펴보는 열 이동 경로가 바뀜" {
  if (initialPathId !== finalPathId) return "살펴보는 열 이동 경로가 바뀜";
  return initialDirection === finalDirection ? "예측 시점과 마지막 방향이 같음" : "시간이 지나 열 이동 방향이 바뀜";
}
