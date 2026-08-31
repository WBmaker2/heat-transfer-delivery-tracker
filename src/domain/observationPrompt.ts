import type { ThermalScenario } from "./types";

export function observationPrompt(scenario: ThermalScenario, frameIndex: number): string {
  if (frameIndex > 0) return "전 단계와 온도를 비교해요. 올라감·내려감·그대로 중 하나를 찾아요.";
  const hasDirection = scenario.frames[0]?.edges.some((edge) => edge.netDirection === "forward");
  return hasDirection
    ? "온도 숫자를 먼저 비교해요. 그다음 화살표를 찾아요."
    : "같은 온도를 찾아요. 한쪽 화살표가 없는지 확인해요.";
}

export function observationCheckLabel(frameIndex: number): string {
  void frameIndex;
  return "온도 변화와 화살표를 확인했어요.";
}
