import type { ThermalScenario } from "../domain/types";

export function TemperatureTable({ scenario, revealedFrameIndex }: { scenario: ThermalScenario; revealedFrameIndex: number }) {
  const bodies = scenario.bodies.slice(0, 2);
  const visibleFrames = scenario.frames.slice(0, revealedFrameIndex + 1);
  return <section className="table-panel" aria-labelledby="table-title"><h2 id="table-title">원자료 온도표</h2><p>그래프와 같은 자료예요. 아직 열지 않은 시점은 보이지 않아요.</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">상대 시점</th>{bodies.map((body) => <th key={body.id} scope="col">{body.label}</th>)}<th scope="col">방향 관찰</th></tr></thead>
      <tbody>{visibleFrames.map((frame) => <tr key={frame.timeStep} className={frame.timeStep === revealedFrameIndex ? "current-row" : ""}><th scope="row">{frame.timeLabel}</th>{bodies.map((body) => <td key={body.id}>{frame.temperaturesC[body.id]}°C</td>)}<td>{frame.edges[0].textAlternative}</td></tr>)}</tbody></table></div>
  </section>;
}
