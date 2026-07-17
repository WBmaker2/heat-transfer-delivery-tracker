import type { ThermalFrame, ThermalScenario, TransferEdge } from "../domain/types";

function Route({ scenario, frame, edge, index }: { scenario: ThermalScenario; frame: ThermalFrame; edge: TransferEdge; index: number }) {
  const from = scenario.bodies.find((body) => body.id === edge.fromId)!;
  const to = scenario.bodies.find((body) => body.id === edge.toId)!;
  return <article className="workbench-route"><h3>{frame.edges.length > 1 ? `정거장 ${"ABC"[index]}` : "열 이동 경로"}</h3><div className="body-row"><div className="thermal-body first"><span>{from.label}</span><strong>{frame.temperaturesC[from.id]}°C</strong><small>{from.material}</small></div><div className={`direction-strip ${edge.netDirection === "none" ? "none" : ""}`}><span aria-hidden="true">{edge.netDirection === "none" ? "↔" : "→"}</span><strong>{edge.textAlternative}</strong></div><div className="thermal-body second"><span>{to.label}</span><strong>{frame.temperaturesC[to.id]}°C</strong><small>{to.material}</small></div></div></article>;
}

export function ThermalWorkbench({ scenario, frameIndex }: { scenario: ThermalScenario; frameIndex: number }) {
  const frame = scenario.frames[frameIndex];
  const edgeEndpointIds = [...new Set(frame.edges.flatMap((transfer) => [transfer.fromId, transfer.toId]))];
  return <section className="workbench" aria-labelledby="workbench-title"><div className="panel-title"><div><p className="section-kicker">열 이동 작업대</p><h2 id="workbench-title">{frame.timeLabel}의 온도와 알짜 방향</h2></div>{frame.sourceState && <span className={`source-state ${frame.sourceState === "켜짐" ? "on" : "off"}`}>열원 {frame.sourceState}</span>}</div><p className="text-alternative">이 시점에는 {edgeEndpointIds.map((id) => `${scenario.bodies.find((body) => body.id === id)?.label} ${frame.temperaturesC[id]}°C`).join(", ")}를 함께 읽어요.</p>{frame.edges.map((edge, index) => <Route key={`${edge.fromId}-${edge.toId}`} scenario={scenario} frame={frame} edge={edge} index={index} />)}{frame.fluidMotion && <p className="fluid-note">흐름 관찰: {frame.fluidMotion}</p>}</section>;
}
