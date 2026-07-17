export type DirectionChoice = "a-to-b" | "b-to-a" | "none";

export function judgeNetDirection(
  firstId: string,
  firstTemperature: number,
  secondId: string,
  secondTemperature: number,
): DirectionChoice {
  if (firstTemperature === secondTemperature) return "none";
  return firstTemperature > secondTemperature
    ? `${firstId}-to-${secondId}` as DirectionChoice
    : `${secondId}-to-${firstId}` as DirectionChoice;
}

export function directionText(
  fromLabel: string,
  toLabel: string,
  netDirection: "forward" | "none",
): string {
  return netDirection === "none"
    ? "두 온도가 같아 한쪽으로 향하는 알짜 이동은 없어요."
    : `${fromLabel}에서 ${toLabel}로 열이 전체적으로 이동해요.`;
}
