export type HeatTransferMode =
  | "contact-conduction"
  | "solid-conduction"
  | "fluid-convection"
  | "radiation";

export type NetDirection = "forward" | "none";

export type ThermalBody = {
  id: string;
  label: string;
  material: string;
  initialTemperatureC: number;
};

export type TransferEdge = {
  fromId: string;
  toId: string;
  mode: HeatTransferMode;
  netDirection: NetDirection;
  textAlternative: string;
};

export type ThermalFrame = {
  timeStep: number;
  timeLabel: string;
  temperaturesC: Record<string, number>;
  edges: TransferEdge[];
  sourceState?: "켜짐" | "꺼짐" | "없음";
  fluidMotion?: string;
};

export type Evidence = {
  id: string;
  title: string;
  detail: string;
};

export type AuditStation = {
  id: string;
  title: string;
  bodyIds: [string, string];
  direction: string;
  mode: HeatTransferMode;
  requiredEvidenceIds: string[];
};

export type ThermalScenario = {
  id: string;
  title: string;
  shortTitle: string;
  systemKind: "closed-ideal-pair" | "open-with-source" | "isolated-mode-model";
  condition: string;
  controlledConditions: string[];
  changedCondition: string | null;
  bodies: ThermalBody[];
  frames: ThermalFrame[];
  primaryModes: HeatTransferMode[];
  acceptedPredictions: string[];
  acceptedFinalDirections: string[];
  requiredEvidenceIds: string[];
  evidence: Evidence[];
  limitationText: string;
  auditStations?: AuditStation[];
};

export const modeLabels: Record<HeatTransferMode, string> = {
  "contact-conduction": "맞닿아 전달됨(전도)",
  "solid-conduction": "고체를 따라 전달됨(전도)",
  "fluid-convection": "액체가 움직이며 전달됨(대류)",
  radiation: "떨어져 전달됨(복사)",
};
