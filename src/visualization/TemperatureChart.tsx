import type { ThermalScenario } from "../domain/types";
import { getChartDomain } from "./chartDomain";

function PointMark({ variant, x, y }: { variant: number; x: number; y: number }) {
  const className = `dot dot-${variant}`;
  if (variant === 2) return <rect className={className} x={x - 2.4} y={y - 2.4} width="4.8" height="4.8" />;
  if (variant === 3) return <polygon className={className} points={`${x},${y - 3} ${x + 3},${y} ${x},${y + 3} ${x - 3},${y}`} />;
  if (variant === 4) return <polygon className={className} points={`${x},${y - 3.2} ${x + 3.2},${y + 2.4} ${x - 3.2},${y + 2.4}`} />;
  if (variant === 5) return <g className={className}><line x1={x - 2.5} x2={x + 2.5} y1={y - 2.5} y2={y + 2.5} /><line x1={x + 2.5} x2={x - 2.5} y1={y - 2.5} y2={y + 2.5} /></g>;
  return <circle className={className} cx={x} cy={y} r="2.6" />;
}

export function TemperatureChart({ scenario, revealedFrameIndex }: { scenario: ThermalScenario; revealedFrameIndex: number }) {
  const frames = scenario.frames.slice(0, revealedFrameIndex + 1);
  const bodies = scenario.bodies;
  const { min, max } = getChartDomain(scenario);
  const range = Math.max(10, max - min);
  const point = (value: number, index: number) => ({ x: 18 + index * (135 / Math.max(1, frames.length - 1)), y: 62 - ((value - min) / range) * 50 });
  return <section className="chart-panel" aria-labelledby="chart-title"><div className="panel-title"><div className="chart-title"><p className="section-kicker">시간 추적판</p><h2 id="chart-title">온도 변화 그래프</h2></div><span className="chart-range">{min}–{max}°C 고정 범위</span></div>
    <svg viewBox="0 0 160 76" role="img" aria-label={`${frames.map((frame) => `${frame.timeLabel} ${bodies.map((body) => `${body.label} ${frame.temperaturesC[body.id]}도`).join(", ")}`).join("; ")}`}>
      <line x1="18" y1="6" x2="18" y2="62" className="axis" /><line x1="18" y1="62" x2="153" y2="62" className="axis" />
      {[0, 0.5, 1].map((tick) => <g key={tick}><line x1="18" x2="153" y1={62 - tick * 50} y2={62 - tick * 50} className="grid" /><text x="1" y={64 - tick * 50}>{Math.round(min + tick * range)}°</text></g>)}
      {bodies.map((body, bodyIndex) => { const points = frames.map((frame, index) => point(frame.temperaturesC[body.id], index)); return <g key={body.id}><polyline className={`series series-${bodyIndex}`} points={points.map(({ x, y }) => `${x},${y}`).join(" ")} />{points.map(({ x, y }, index) => <PointMark key={frames[index].timeStep} variant={bodyIndex} x={x} y={y} />)}</g>; })}
    </svg>
    <div className="legend">{bodies.map((body, index) => <span key={body.id} className={`legend-${index}`}>{body.label}</span>)}</div>
    <p className="sr-only">그래프 아래 숫자 온도표에서 같은 숫자를 확인할 수 있어요.</p>
  </section>;
}
