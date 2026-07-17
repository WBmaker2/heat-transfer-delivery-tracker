import type { ThermalScenario } from "../domain/types";

export function TemperatureChart({ scenario, revealedFrameIndex }: { scenario: ThermalScenario; revealedFrameIndex: number }) {
  const frames = scenario.frames.slice(0, revealedFrameIndex + 1);
  const bodies = scenario.bodies.slice(0, 2);
  const values = frames.flatMap((frame) => bodies.map((body) => frame.temperaturesC[body.id]));
  const min = Math.max(0, Math.floor(Math.min(...values, 20) / 10) * 10 - 10);
  const max = Math.min(80, Math.ceil(Math.max(...values, 40) / 10) * 10 + 10);
  const range = Math.max(10, max - min);
  const point = (value: number, index: number) => `${8 + index * (84 / Math.max(1, frames.length - 1))},${88 - ((value - min) / range) * 72}`;
  return <section className="chart-panel" aria-labelledby="chart-title"><div className="panel-title"><div><p className="section-kicker">시간 추적판</p><h2 id="chart-title">온도 변화 그래프</h2></div><span>{min}–{max}°C 고정 범위</span></div>
    <svg viewBox="0 0 100 100" role="img" aria-label={`${frames.map((frame) => `${frame.timeLabel} ${bodies.map((body) => `${body.label} ${frame.temperaturesC[body.id]}도`).join(", ")}`).join("; ")}`}>
      <line x1="8" y1="8" x2="8" y2="88" className="axis" /><line x1="8" y1="88" x2="94" y2="88" className="axis" />
      {[0, 0.5, 1].map((tick) => <g key={tick}><line x1="8" x2="94" y1={88 - tick * 72} y2={88 - tick * 72} className="grid" /><text x="1" y={90 - tick * 72}>{Math.round(min + tick * range)}°</text></g>)}
      {bodies.map((body, bodyIndex) => <g key={body.id}><polyline className={bodyIndex === 0 ? "series first-series" : "series second-series"} points={frames.map((frame, index) => point(frame.temperaturesC[body.id], index)).join(" ")} />{frames.map((frame, index) => <circle key={frame.timeStep} className={bodyIndex === 0 ? "dot first-dot" : "dot second-dot"} cx={point(frame.temperaturesC[body.id], index).split(",")[0]} cy={point(frame.temperaturesC[body.id], index).split(",")[1]} r="2.6" />)}</g>)}
    </svg>
    <div className="legend">{bodies.map((body, index) => <span key={body.id} className={index === 0 ? "legend-first" : "legend-second"}>{body.label}</span>)}</div>
    <p className="sr-only">그래프 아래 원자료 표에서 같은 숫자를 확인할 수 있어요.</p>
  </section>;
}
