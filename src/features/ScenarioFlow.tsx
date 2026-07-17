"use client";

import { useMemo, useState } from "react";
import { modeLabels, type HeatTransferMode, type ThermalScenario } from "../domain/types";
import { canRevealNextFrame, revealNextFrame } from "../domain/revealState";
import { isAcceptedFinalDirection, revisionStatus } from "../domain/learningRecord";
import { TemperatureChart } from "../visualization/TemperatureChart";
import { TemperatureTable } from "../visualization/TemperatureTable";
import { ThermalWorkbench } from "../visualization/ThermalWorkbench";

type Stage = "condition" | "prediction" | "timeline" | "review" | "mode" | "evidence" | "result";

const stageNames: Record<Stage, string> = { condition: "조건", prediction: "예측", timeline: "시간 자료", review: "방향 확인", mode: "방식", evidence: "근거", result: "기록" };

function choiceLabel(scenario: ThermalScenario, choice: string) {
  const initialEdge = scenario.frames[0].edges[0];
  const first = scenario.bodies.find((body) => body.id === initialEdge.fromId)?.label ?? "A";
  const second = scenario.bodies.find((body) => body.id === initialEdge.toId)?.label ?? "B";
  const choices: Record<string, string> = {
    "a-to-b": "가상 고체 A에서 가상 고체 B로", "b-to-a": "가상 고체 B에서 가상 고체 A로", none: "한쪽 방향 없음",
    "source-to-object": "열원에서 가상 물체로", "object-to-room": "가상 물체에서 주변으로",
    "left-to-right": "왼쪽에서 오른쪽으로", "right-to-left": "오른쪽에서 왼쪽으로",
    "bottom-to-top": "아래쪽에서 위쪽으로", "top-to-bottom": "위쪽에서 아래쪽으로",
    "lamp-to-target": "열 램프에서 가상 물체로", "target-to-lamp": "가상 물체에서 열 램프로",
    "solid-left-to-right": "고체 왼쪽에서 고체 오른쪽으로",
  };
  return choices[choice] ?? `${first}에서 ${second}로`;
}

function predictionChoices(scenario: ThermalScenario) {
  const accepted = scenario.acceptedPredictions[0];
  const alternatives: Record<string, string[]> = {
    "a-to-b": ["a-to-b", "b-to-a", "none"], "source-to-object": ["source-to-object", "object-to-room", "none"],
    "left-to-right": ["left-to-right", "right-to-left", "none"], "bottom-to-top": ["bottom-to-top", "top-to-bottom", "none"],
    "lamp-to-target": ["lamp-to-target", "target-to-lamp", "none"],
  };
  return alternatives[accepted] ?? [accepted, "none"];
}

export function ScenarioFlow({ scenario, number, onComplete }: { scenario: ThermalScenario; number: number; onComplete: () => void }) {
  return scenario.auditStations
    ? <AuditScenarioFlow scenario={scenario} number={number} onComplete={onComplete} />
    : <StandardScenarioFlow scenario={scenario} number={number} onComplete={onComplete} />;
}

function StandardScenarioFlow({ scenario, number, onComplete }: { scenario: ThermalScenario; number: number; onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("condition");
  const [prediction, setPrediction] = useState("");
  const [revealedFrameIndex, setRevealedFrameIndex] = useState(0);
  const [observed, setObserved] = useState(false);
  const [finalDirection, setFinalDirection] = useState("");
  const [selectedMode, setSelectedMode] = useState<HeatTransferMode | "">("");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const finalEdge = scenario.frames.at(-1)?.edges[0];
  const allEvidenceSelected = scenario.requiredEvidenceIds.every((id) => evidence.includes(id));
  const finalChoices = useMemo(() => finalEdge?.netDirection === "none" ? ["none", scenario.acceptedPredictions[0]] : predictionChoices(scenario), [finalEdge, scenario]);

  function resetFromDirection() { setSelectedMode(""); setEvidence([]); }
  function submitPrediction() {
    if (!prediction) return;
    setFeedback(scenario.acceptedPredictions.includes(prediction) ? "예측을 기록했어요. 이제 자료를 한 시점씩 열어 볼까요?" : "괜찮아요. 다음 자료를 보며 처음 생각을 다시 확인할 수 있어요.");
    setStage("timeline");
  }
  return <section className="scenario-flow" aria-labelledby="scenario-title">
    <div className="progress-line" aria-label={`사건 ${number}의 현재 단계: ${stageNames[stage]}`}>{(Object.keys(stageNames) as Stage[]).map((item) => <span key={item} className={item === stage ? "active" : ""}>{stageNames[item]}</span>)}</div>
    <div className="scenario-heading"><p className="section-kicker">고정 추적 사건 {number} / 5</p><h1 id="scenario-title">{scenario.title}</h1><p>{scenario.condition}</p></div>
    {stage === "condition" && <section className="condition-sheet"><h2>배달 조건표를 확인해요</h2><ul>{scenario.controlledConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>{scenario.changedCondition && <p className="changed-condition">바뀌는 조건: {scenario.changedCondition}</p>}<button type="button" className="button primary" onClick={() => setStage("prediction")}>시작 온도 확인했어요</button></section>}
    {stage === "prediction" && <section className="decision-panel"><h2>처음에는 어느 쪽으로 갈까요?</h2><p>시작 온도와 조건을 근거로 골라요. 나중에 바꿔도 괜찮아요.</p><fieldset className="choice-group"><legend>알짜 이동 방향 예측</legend>{predictionChoices(scenario).map((choice) => <label key={choice}><input type="radio" name={`prediction-${scenario.id}`} value={choice} checked={prediction === choice} onChange={(event) => setPrediction(event.target.value)} /> {choiceLabel(scenario, choice)}</label>)}</fieldset><button type="button" className="button primary" disabled={!prediction} onClick={submitPrediction}>예측 기록하기</button></section>}
    {stage === "timeline" && <><ThermalWorkbench scenario={scenario} frameIndex={revealedFrameIndex} /><div className="observation-panel"><h2>{scenario.frames[revealedFrameIndex].timeLabel} 자료를 읽었나요?</h2><label className="check-row"><input type="checkbox" checked={observed} onChange={(event) => setObserved(event.target.checked)} /> 두 온도 숫자와 화살표 설명을 함께 확인했어요.</label>{revealedFrameIndex < scenario.frames.length - 1 ? <button type="button" className="button primary" disabled={!canRevealNextFrame(revealedFrameIndex, Number(observed), scenario.frames.length)} onClick={() => { setRevealedFrameIndex(revealNextFrame(revealedFrameIndex, Number(observed), scenario.frames.length)); setObserved(false); }}>다음 시점 열기</button> : <button type="button" className="button primary" disabled={!observed} onClick={() => setStage("review")}>자료 추적 마치기</button>}</div><TemperatureChart scenario={scenario} revealedFrameIndex={revealedFrameIndex} /><TemperatureTable scenario={scenario} revealedFrameIndex={revealedFrameIndex} /></>}
    {stage === "review" && <section className="decision-panel"><h2>마지막 자료를 보고 방향을 확인해요</h2><p>{finalEdge?.textAlternative}</p><fieldset className="choice-group"><legend>최종 방향</legend>{finalChoices.map((choice) => <label key={choice}><input type="radio" name={`final-${scenario.id}`} value={choice} checked={finalDirection === choice} onChange={(event) => { setFinalDirection(event.target.value); resetFromDirection(); }} /> {choiceLabel(scenario, choice)}</label>)}</fieldset><button type="button" className="button primary" disabled={!finalDirection} onClick={() => { if (isAcceptedFinalDirection(scenario, finalDirection)) setStage("mode"); else setFeedback("마지막 온도와 화살표 설명을 다시 확인해 보세요. 자료와 맞는 방향을 골라야 다음으로 갈 수 있어요."); }}>방향 확인하기</button>{feedback && <p className="feedback" role="status">{feedback}</p>}</section>}
    {stage === "mode" && <section className="decision-panel"><h2>주로 살펴본 이동 방식은 무엇일까요?</h2><fieldset className="choice-group"><legend>이동 방식 선택</legend>{scenario.primaryModes.map((mode) => <label key={mode}><input type="radio" name={`mode-${scenario.id}`} checked={selectedMode === mode} onChange={() => setSelectedMode(mode)} /> {modeLabels[mode]}</label>)}</fieldset><button type="button" className="button primary" disabled={!selectedMode} onClick={() => setStage("evidence")}>근거 고르기</button></section>}
    {stage === "evidence" && <section className="evidence-panel"><h2>근거를 연결해요</h2><p>이 사건에 꼭 필요한 근거를 모두 골라요.</p><div className="evidence-grid">{scenario.evidence.map((item) => <label className={`evidence-card ${evidence.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={evidence.includes(item.id)} onChange={(event) => setEvidence(event.target.checked ? [...evidence, item.id] : evidence.filter((id) => id !== item.id))} /><strong>{item.title}</strong><span>{item.detail}</span></label>)}</div>{!allEvidenceSelected && <p className="hint">필요한 근거를 모두 골라야 기록을 볼 수 있어요.</p>}<button type="button" className="button primary" disabled={!allEvidenceSelected} onClick={() => setStage("result")}>추적 기록 보기</button></section>}
    {stage === "result" && <section className="result-panel"><p className="completion-stamp">추적 완료</p><h2>열 이동 추적 기록</h2><dl><div><dt>시작 온도 차</dt><dd>{scenario.bodies.map((body) => `${body.label} ${body.initialTemperatureC}°C`).join(" / ")}</dd></div><div><dt>처음 예측</dt><dd>{choiceLabel(scenario, prediction)}</dd></div><div><dt>예측 변화</dt><dd>{revisionStatus(prediction, finalDirection)}</dd></div><div><dt>최종 알짜 방향</dt><dd>{choiceLabel(scenario, finalDirection)}</dd></div><div><dt>주된 방식</dt><dd>{selectedMode ? modeLabels[selectedMode] : ""}</dd></div><div><dt>선택한 근거</dt><dd>{scenario.evidence.filter((item) => evidence.includes(item.id)).map((item) => item.title).join(" · ")}</dd></div><div><dt>모형의 한계</dt><dd>{scenario.limitationText}</dd></div></dl><p className="reality-note">현실에서는 전도·대류·복사가 함께 나타날 수 있어요. 이 사건은 한 방식을 비교하려고 단순화했어요.</p><button type="button" className="button primary" onClick={onComplete}>{number === 5 ? "전체 활동 마무리" : "다음 사건으로"}</button></section>}
    {feedback && <p className="sr-only" aria-live="polite">{feedback}</p>}
  </section>;
}

function AuditScenarioFlow({ scenario, number, onComplete }: { scenario: ThermalScenario; number: number; onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<string, { direction: string; mode: string; evidence: boolean }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const stations = scenario.auditStations ?? [];
  const frame = scenario.frames[0];
  function update(id: string, change: Partial<{ direction: string; mode: string; evidence: boolean }>) { setAnswers((current) => ({ ...current, [id]: { direction: "", mode: "", evidence: false, ...current[id], ...change } })); }
  function showRecord() {
    const invalid = stations.find((station) => { const answer = answers[station.id]; return !answer || answer.direction !== station.direction || answer.mode !== station.mode || !answer.evidence; });
    if (invalid) { setFeedback(`${invalid.title}의 온도, 주된 방식, 근거를 다시 확인해 보세요.`); return; }
    setSubmitted(true);
  }
  if (submitted) return <section className="result-panel"><p className="completion-stamp">세 경로 감사 완료</p><h1>{scenario.title}</h1><dl>{stations.map((station) => <div key={station.id}><dt>{station.title}</dt><dd>{choiceLabel(scenario, station.direction)} · {modeLabels[station.mode]} · {scenario.evidence.filter((item) => station.requiredEvidenceIds.includes(item.id)).map((item) => item.title).join(" · ")}</dd></div>)}<div><dt>모형의 한계</dt><dd>{scenario.limitationText}</dd></div></dl><p className="reality-note">세 방식은 현실에서 함께 나타날 수 있어요. 여기서는 비교를 위해 주된 방식만 살폈어요.</p><button type="button" className="button primary" onClick={onComplete}>전체 활동 마무리</button></section>;
  return <section className="scenario-flow" aria-labelledby="scenario-title"><div className="progress-line"><span className="active">세 경로 감사</span><span>기록</span></div><div className="scenario-heading"><p className="section-kicker">고정 추적 사건 {number} / 5</p><h1 id="scenario-title">{scenario.title}</h1><p>{scenario.condition}</p></div><section className="evidence-panel"><h2>세 정거장을 모두 연결해요</h2><div className="audit-grid">{stations.map((station) => { const pair = station.bodyIds.map((id) => scenario.bodies.find((body) => body.id === id)!); const answer = answers[station.id] ?? { direction: "", mode: "", evidence: false }; return <article className="audit-card" key={station.id}><h3>{station.title}</h3><p>{pair[0].label} {frame.temperaturesC[pair[0].id]}°C → {pair[1].label} {frame.temperaturesC[pair[1].id]}°C</p><fieldset className="choice-group"><legend>알짜 방향</legend><label><input type="radio" name={`${station.id}-direction`} checked={answer.direction === station.direction} onChange={() => update(station.id, { direction: station.direction })} /> {choiceLabel(scenario, station.direction)}</label><label><input type="radio" name={`${station.id}-direction`} checked={answer.direction === "none"} onChange={() => update(station.id, { direction: "none" })} /> 한쪽 방향 없음</label></fieldset><fieldset className="choice-group"><legend>주된 방식</legend>{scenario.primaryModes.map((mode) => <label key={mode}><input type="radio" name={`${station.id}-mode`} checked={answer.mode === mode} onChange={() => update(station.id, { mode })} /> {modeLabels[mode]}</label>)}</fieldset><label className="check-row"><input type="checkbox" checked={answer.evidence} onChange={(event) => update(station.id, { evidence: event.target.checked })} /> {scenario.evidence.find((item) => station.requiredEvidenceIds.includes(item.id))?.detail}</label></article>; })}</div><button type="button" className="button primary" onClick={showRecord}>세 경로 추적 기록 보기</button>{feedback && <p className="feedback" role="status">{feedback}</p>}</section></section>;
}
