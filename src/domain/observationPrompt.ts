import type { ThermalScenario } from "./types";

export function observationPrompt(scenario: ThermalScenario, frameIndex: number): string {
  if (frameIndex > 0) return "바로 전 시간 단계와 비교해, 각 온도가 올라갔는지, 내려갔는지, 그대로인지 찾아보세요.";
  const hasDirection = scenario.frames[0]?.edges.some((edge) => edge.netDirection === "forward");
  return hasDirection
    ? "온도가 높은 곳을 찾고, 열이 한쪽으로 가는 화살표가 있는지 보세요."
    : "같은 온도를 찾고, 열이 한쪽으로 가는 화살표가 없는지 보세요.";
}

export function observationCheckLabel(frameIndex: number): string {
  return frameIndex === 0
    ? "온도 숫자를 비교하고, 화살표 방향도 확인했어요."
    : "온도 숫자가 어떻게 바뀌었는지 말하고, 화살표 방향도 확인했어요.";
}
