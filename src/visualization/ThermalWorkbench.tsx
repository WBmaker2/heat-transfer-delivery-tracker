import type { ThermalScenario } from "../domain/types";

export function ThermalWorkbench({ scenario, frameIndex }: { scenario: ThermalScenario; frameIndex: number }) {
  const frame = scenario.frames[frameIndex];
  const edge = frame.edges[0];
  const from = scenario.bodies.find((body) => body.id === edge.fromId);
  const to = scenario.bodies.find((body) => body.id === edge.toId);
  return (
    <section className="workbench" aria-labelledby="workbench-title">
      <div className="panel-title"><div><p className="section-kicker">열 이동 작업대</p><h2 id="workbench-title">{frame.timeLabel}의 온도와 알짜 방향</h2></div>{frame.sourceState && <span className={`source-state ${frame.sourceState === "켜짐" ? "on" : "off"}`}>열원 {frame.sourceState}</span>}</div>
      <div className="body-row">
        {scenario.bodies.slice(0, 2).map((body, index) => <div className={`thermal-body ${index === 0 ? "first" : "second"}`} key={body.id}><span>{body.label}</span><strong>{frame.temperaturesC[body.id]}°C</strong><small>{body.material}</small></div>)}
      </div>
      <div className={`direction-strip ${edge.netDirection === "none" ? "none" : ""}`}><span aria-hidden="true">{edge.netDirection === "none" ? "↔" : "→"}</span><strong>{edge.textAlternative}</strong></div>
      <p className="text-alternative">{edge.netDirection === "none" ? "두 온도가 같아 한쪽으로 향하는 알짜 이동 화살표를 표시하지 않아요." : `${from?.label} ${frame.temperaturesC[edge.fromId]}°C에서 ${to?.label} ${frame.temperaturesC[edge.toId]}°C로 열이 전체적으로 이동해요.`}</p>
      {frame.fluidMotion && <p className="fluid-note">흐름 관찰: {frame.fluidMotion}</p>}
    </section>
  );
}
