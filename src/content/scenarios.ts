import type { HeatTransferMode, ThermalScenario } from "../domain/types";

const edge = (
  fromId: string,
  toId: string,
  mode: HeatTransferMode,
  netDirection: "forward" | "none",
  textAlternative: string,
) => ({ fromId, toId, mode, netDirection, textAlternative });

export const scenarios: ThermalScenario[] = [
  {
    id: "contact-lockers",
    title: "사건 1. 두 보관함의 접촉 배송",
    shortTitle: "두 보관함 접촉",
    systemKind: "closed-ideal-pair",
    condition: "같은 재료·같은 양의 가상 고체 A와 B가 맞닿아 있어요.",
    controlledConditions: ["A 60°C", "B 20°C", "주변과 열 교환 없음"],
    changedCondition: null,
    bodies: [
      { id: "a", label: "가상 고체 A", material: "같은 재료·같은 양", initialTemperatureC: 60 },
      { id: "b", label: "가상 고체 B", material: "같은 재료·같은 양", initialTemperatureC: 20 },
    ],
    frames: [
      { timeStep: 0, timeLabel: "시작", temperaturesC: { a: 60, b: 20 }, edges: [edge("a", "b", "contact-conduction", "forward", "A에서 B로 알짜 이동")] },
      { timeStep: 1, timeLabel: "1단계", temperaturesC: { a: 52, b: 28 }, edges: [edge("a", "b", "contact-conduction", "forward", "A에서 B로 알짜 이동")] },
      { timeStep: 2, timeLabel: "2단계", temperaturesC: { a: 46, b: 34 }, edges: [edge("a", "b", "contact-conduction", "forward", "A에서 B로 알짜 이동")] },
      { timeStep: 3, timeLabel: "3단계", temperaturesC: { a: 42, b: 38 }, edges: [edge("a", "b", "contact-conduction", "forward", "A에서 B로 알짜 이동")] },
      { timeStep: 4, timeLabel: "끝", temperaturesC: { a: 40, b: 40 }, edges: [edge("a", "b", "contact-conduction", "none", "두 온도가 같아 한쪽 방향 없음")] },
    ],
    primaryModes: ["contact-conduction"],
    predictionFrameIndex: 0,
    requiredEvidenceIds: ["temperature-gap", "contact"],
    evidence: [
      { id: "temperature-gap", title: "온도 차", detail: "A의 온도는 내려가고 B의 온도는 올라가요." },
      { id: "contact", title: "맞닿은 곳", detail: "두 가상 고체가 직접 맞닿아 있어요." },
      { id: "fluid", title: "유체 움직임", detail: "이 사건에는 액체나 기체의 순환이 없어요." },
    ],
    limitationText: "40°C는 같은 재료·같은 양·닫힌 모형에서만 나온 결과예요. 언제나 평균이 되는 것은 아니에요.",
  },
  {
    id: "source-switch",
    title: "사건 2. 열원 스위치가 바뀐 배송",
    shortTitle: "열원 스위치",
    systemKind: "open-with-source",
    condition: "가상 물체와 주변은 22°C에서 시작하고, 열원을 켰다가 꺼요.",
    controlledConditions: ["물체 22°C", "주변 22°C", "열원 상태를 바꿈"],
    changedCondition: "열원: 켜짐 → 꺼짐",
    bodies: [
      { id: "source", label: "열원", material: "에너지를 공급하는 장치", initialTemperatureC: 22 },
      { id: "object", label: "가상 물체", material: "고정 모형", initialTemperatureC: 22 },
      { id: "room", label: "주변", material: "고정 모형", initialTemperatureC: 22 },
    ],
    frames: [
      { timeStep: 0, timeLabel: "시작", temperaturesC: { source: 22, object: 22, room: 22 }, sourceState: "꺼짐", edges: [edge("object", "room", "contact-conduction", "none", "두 온도가 같아 한쪽 방향 없음")] },
      { timeStep: 1, timeLabel: "1단계", temperaturesC: { source: 60, object: 30, room: 22 }, sourceState: "켜짐", edges: [edge("source", "object", "radiation", "forward", "열원에서 물체로 알짜 이동")] },
      { timeStep: 2, timeLabel: "2단계", temperaturesC: { source: 60, object: 38, room: 22 }, sourceState: "켜짐", edges: [edge("source", "object", "radiation", "forward", "열원에서 물체로 알짜 이동")] },
      { timeStep: 3, timeLabel: "3단계", temperaturesC: { source: 60, object: 44, room: 22 }, sourceState: "켜짐", edges: [edge("source", "object", "radiation", "forward", "열원에서 물체로 알짜 이동")] },
      { timeStep: 4, timeLabel: "4단계", temperaturesC: { source: 22, object: 41, room: 22 }, sourceState: "꺼짐", edges: [edge("object", "room", "contact-conduction", "forward", "물체에서 주변으로 알짜 이동")] },
      { timeStep: 5, timeLabel: "끝", temperaturesC: { source: 22, object: 37, room: 22 }, sourceState: "꺼짐", edges: [edge("object", "room", "contact-conduction", "forward", "물체에서 주변으로 알짜 이동")] },
    ],
    primaryModes: ["radiation", "contact-conduction"],
    predictionFrameIndex: 1,
    requiredEvidenceIds: ["source-state", "temperature-gap"],
    evidence: [
      { id: "source-state", title: "열원 상태", detail: "열원이 켜진 동안 물체 온도가 올라가고, 끈 뒤에는 내려가요." },
      { id: "temperature-gap", title: "온도 차", detail: "꺼진 뒤 물체가 주변보다 더 따뜻해요." },
      { id: "contact", title: "접촉", detail: "이 사건은 열원 상태가 바뀌는 열린 계 모형이에요." },
    ],
    limitationText: "켜진 동안에도 주변으로 전달이 있을 수 있어요. 화살표는 물체 온도를 올린 알짜 효과예요.",
  },
  {
    id: "solid-bridge",
    title: "사건 3. 고체 다리 전도 추적",
    shortTitle: "고체 다리 전도",
    systemKind: "isolated-mode-model",
    condition: "가상 고체 다리의 왼쪽 끝만 열원과 닿아 있고, 네 위치를 비교해요.",
    controlledConditions: ["왼쪽 끝 열원", "고체 다리", "네 위치 센서"],
    changedCondition: "왼쪽에서 오른쪽으로 온도 변화가 이어짐",
    bodies: [
      { id: "left", label: "왼쪽 끝", material: "고체 다리", initialTemperatureC: 24 },
      { id: "middle-left", label: "왼쪽 가운데", material: "고체 다리", initialTemperatureC: 24 },
      { id: "middle-right", label: "오른쪽 가운데", material: "고체 다리", initialTemperatureC: 24 },
      { id: "right", label: "오른쪽 끝", material: "고체 다리", initialTemperatureC: 24 },
    ],
    frames: [
      { timeStep: 0, timeLabel: "시작", temperaturesC: { left: 24, "middle-left": 24, "middle-right": 24, right: 24 }, edges: [edge("left", "middle-left", "solid-conduction", "none", "두 위치 온도가 같아 한쪽 방향 없음")] },
      { timeStep: 1, timeLabel: "1단계", temperaturesC: { left: 52, "middle-left": 24, "middle-right": 24, right: 24 }, edges: [edge("left", "middle-left", "solid-conduction", "forward", "왼쪽 끝에서 왼쪽 가운데로 알짜 이동")] },
      { timeStep: 2, timeLabel: "2단계", temperaturesC: { left: 58, "middle-left": 39, "middle-right": 28, right: 24 }, edges: [edge("middle-left", "middle-right", "solid-conduction", "forward", "왼쪽 가운데에서 오른쪽 가운데로 알짜 이동")] },
      { timeStep: 3, timeLabel: "끝", temperaturesC: { left: 60, "middle-left": 47, "middle-right": 36, right: 29 }, edges: [edge("middle-right", "right", "solid-conduction", "forward", "오른쪽 가운데에서 오른쪽 끝으로 알짜 이동")] },
    ],
    primaryModes: ["solid-conduction"],
    predictionFrameIndex: 1,
    requiredEvidenceIds: ["solid", "temperature-gap"],
    evidence: [
      { id: "solid", title: "고체 연결", detail: "고체 다리의 이웃한 부분을 따라 변화가 이어져요." },
      { id: "temperature-gap", title: "온도 차", detail: "왼쪽이 먼저 높아지고 오른쪽이 나중에 높아져요." },
      { id: "fluid", title: "유체 움직임", detail: "고체 자체가 옮겨 가는 모습은 아니에요." },
    ],
    limitationText: "이 자료는 고체 안 전도를 잘 보기 위해 다른 영향을 단순화한 모형이에요.",
  },
  {
    id: "liquid-cycle",
    title: "사건 4. 액체 순환 배송 추적",
    shortTitle: "액체 순환",
    systemKind: "isolated-mode-model",
    condition: "가상 용기 아래쪽의 열원 때문에 액체가 움직이며 순환해요.",
    controlledConditions: ["아래쪽 열원", "가상 액체", "상태 변화 없음"],
    changedCondition: "따뜻한 액체는 올라가고 차가운 액체는 내려감",
    bodies: [
      { id: "bottom", label: "아래쪽 액체", material: "가상 액체", initialTemperatureC: 24 },
      { id: "top", label: "위쪽 액체", material: "가상 액체", initialTemperatureC: 24 },
    ],
    frames: [
      { timeStep: 0, timeLabel: "시작", temperaturesC: { bottom: 24, top: 24 }, edges: [edge("bottom", "top", "fluid-convection", "none", "두 위치 온도가 같아 한쪽 방향 없음")], fluidMotion: "아직 뚜렷한 순환이 없어요." },
      { timeStep: 1, timeLabel: "1단계", temperaturesC: { bottom: 42, top: 25 }, edges: [edge("bottom", "top", "fluid-convection", "forward", "아래쪽에서 위쪽으로 알짜 이동")], fluidMotion: "데워진 아래쪽 액체가 위로 움직이기 시작해요." },
      { timeStep: 2, timeLabel: "2단계", temperaturesC: { bottom: 49, top: 32 }, edges: [edge("bottom", "top", "fluid-convection", "forward", "아래쪽에서 위쪽으로 알짜 이동")], fluidMotion: "따뜻한 액체는 올라가고 차가운 액체는 내려와요." },
      { timeStep: 3, timeLabel: "끝", temperaturesC: { bottom: 51, top: 39 }, edges: [edge("bottom", "top", "fluid-convection", "forward", "아래쪽에서 위쪽으로 알짜 이동")], fluidMotion: "순환하며 에너지를 나르는 모습이에요." },
    ],
    primaryModes: ["fluid-convection"],
    predictionFrameIndex: 1,
    requiredEvidenceIds: ["fluid", "temperature-gap"],
    evidence: [
      { id: "fluid", title: "유체 움직임", detail: "따뜻한 액체가 위로 움직이고 차가운 액체가 내려와요." },
      { id: "temperature-gap", title: "온도 차", detail: "아래쪽이 먼저 따뜻해지고 위쪽도 뒤따라 변해요." },
      { id: "space", title: "빈 공간", detail: "이 사건은 떨어진 열원을 보는 사건이 아니에요." },
    ],
    limitationText: "열이 언제나 위로 가는 것이 아니에요. 이 조건에서 액체가 움직이는 모습을 나타낸 모형이에요.",
  },
  {
    id: "final-audit",
    title: "사건 5. 세 경로 최종 감사",
    shortTitle: "세 경로 최종 감사",
    systemKind: "isolated-mode-model",
    condition: "세 정거장에서 전도·대류·복사를 각각 비교해요.",
    controlledConditions: ["맞닿은 고체", "움직이는 액체", "떨어진 열 램프"],
    changedCondition: "각 경로의 방향·방식·근거를 연결함",
    bodies: [
      { id: "solid-hot", label: "고체 왼쪽", material: "맞닿은 고체", initialTemperatureC: 55 },
      { id: "solid-cool", label: "고체 오른쪽", material: "맞닿은 고체", initialTemperatureC: 25 },
      { id: "liquid-bottom", label: "액체 아래", material: "가상 액체", initialTemperatureC: 48 },
      { id: "liquid-top", label: "액체 위", material: "가상 액체", initialTemperatureC: 30 },
      { id: "lamp", label: "열 램프", material: "열원", initialTemperatureC: 70 },
      { id: "target", label: "가상 물체", material: "고정 모형", initialTemperatureC: 30 },
    ],
    frames: [
      { timeStep: 0, timeLabel: "시작", temperaturesC: { "solid-hot": 55, "solid-cool": 25, "liquid-bottom": 48, "liquid-top": 30, lamp: 70, target: 30 }, edges: [edge("solid-hot", "solid-cool", "solid-conduction", "forward", "고체 왼쪽에서 오른쪽으로 알짜 이동"), edge("liquid-bottom", "liquid-top", "fluid-convection", "forward", "액체 아래에서 위로 알짜 이동"), edge("lamp", "target", "radiation", "forward", "열 램프에서 물체로 알짜 이동")] },
      { timeStep: 1, timeLabel: "1단계", temperaturesC: { "solid-hot": 49, "solid-cool": 31, "liquid-bottom": 45, "liquid-top": 35, lamp: 70, target: 36 }, edges: [edge("solid-hot", "solid-cool", "solid-conduction", "forward", "고체 왼쪽에서 오른쪽으로 알짜 이동"), edge("liquid-bottom", "liquid-top", "fluid-convection", "forward", "액체 아래에서 위로 알짜 이동"), edge("lamp", "target", "radiation", "forward", "열 램프에서 물체로 알짜 이동")] },
      { timeStep: 2, timeLabel: "끝", temperaturesC: { "solid-hot": 44, "solid-cool": 36, "liquid-bottom": 42, "liquid-top": 38, lamp: 70, target: 41 }, edges: [edge("solid-hot", "solid-cool", "solid-conduction", "forward", "고체 왼쪽에서 오른쪽으로 알짜 이동"), edge("liquid-bottom", "liquid-top", "fluid-convection", "forward", "액체 아래에서 위로 알짜 이동"), edge("lamp", "target", "radiation", "forward", "열 램프에서 물체로 알짜 이동")] },
    ],
    primaryModes: ["solid-conduction", "fluid-convection", "radiation"],
    predictionFrameIndex: 0,
    requiredEvidenceIds: ["contact", "fluid", "space"],
    evidence: [
      { id: "contact", title: "맞닿은 고체", detail: "고체 양 끝이 맞닿아 온도 차가 있어요." },
      { id: "fluid", title: "움직이는 액체", detail: "따뜻한 액체가 올라가고 차가운 액체가 내려와요." },
      { id: "space", title: "떨어진 공간", detail: "열 램프와 물체 사이에는 닿은 다리가 없어요." },
    ],
    limitationText: "현실에서는 전도·대류·복사가 함께 나타날 수 있어요. 세 정거장은 비교를 위해 주된 방식만 강조해요.",
  },
];

export function validateScenarioCatalog(catalog: ThermalScenario[]): string[] {
  const errors: string[] = [];
  for (const scenario of catalog) {
    if (!scenario.frames.length || !scenario.primaryModes.length || !scenario.limitationText) errors.push(`${scenario.id}: 기본 정보가 없어요.`);
    scenario.frames.forEach((frame, index) => {
      if (frame.timeStep !== index) errors.push(`${scenario.id}: 시점 순서가 이어지지 않아요.`);
      for (const body of scenario.bodies) if (!(body.id in frame.temperaturesC)) errors.push(`${scenario.id}: ${body.id} 온도가 없어요.`);
      for (const transfer of frame.edges) {
        if (transfer.netDirection === "forward" && frame.temperaturesC[transfer.fromId] <= frame.temperaturesC[transfer.toId]) errors.push(`${scenario.id}: 화살표가 온도와 맞지 않아요.`);
        if (transfer.netDirection === "none" && frame.temperaturesC[transfer.fromId] !== frame.temperaturesC[transfer.toId]) errors.push(`${scenario.id}: 같은 온도일 때만 방향이 없어야 해요.`);
      }
    });
  }
  return errors;
}
