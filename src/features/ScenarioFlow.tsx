"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "../components/Dialog";
import { modeLabels, type HeatTransferMode, type ThermalScenario } from "../domain/types";
import { areAcceptedFrameDirections, frameDirectionAnswers, revisionStatus, type FrameDirectionAnswer } from "../domain/learningRecord";
import { canRevealNextFrame, revealNextFrame } from "../domain/revealState";
import { TemperatureChart } from "../visualization/TemperatureChart";
import { TemperatureTable } from "../visualization/TemperatureTable";
import { ThermalWorkbench } from "../visualization/ThermalWorkbench";

type Stage = "condition" | "prediction" | "timeline" | "review" | "mode" | "evidence" | "result";
type ChoiceMap = Record<string, string>;
const stageNames: Record<Stage, string> = { condition: "조건", prediction: "예측", timeline: "시간 자료", review: "방향 확인", mode: "방식", evidence: "근거", result: "기록" };

function bodyLabel(scenario: ThermalScenario, id: string) { return scenario.bodies.find((body) => body.id === id)?.label ?? id; }
function directionLabel(scenario: ThermalScenario, fromId: string, toId: string, direction: string) { return direction === "none" ? "한쪽 방향 없음" : `${bodyLabel(scenario, fromId)}에서 ${bodyLabel(scenario, toId)}로`; }
function directionOptions(answer: FrameDirectionAnswer) { return [{ id: answer.direction, fromId: answer.fromId, toId: answer.toId }, { id: `${answer.toId}-to-${answer.fromId}`, fromId: answer.toId, toId: answer.fromId }, { id: "none", fromId: answer.fromId, toId: answer.toId }].filter((option, index, all) => all.findIndex((item) => item.id === option.id) === index); }

export function ScenarioFlow({ scenario, number, onComplete }: { scenario: ThermalScenario; number: number; onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("condition");
  const [prediction, setPrediction] = useState<ChoiceMap>({});
  const [revealedFrameIndex, setRevealedFrameIndex] = useState(0);
  const [observed, setObserved] = useState(false);
  const [finalDirections, setFinalDirections] = useState<ChoiceMap>({});
  const [selectedModes, setSelectedModes] = useState<ChoiceMap>({});
  const [evidence, setEvidence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const predictionAnswers = frameDirectionAnswers(scenario, scenario.predictionFrameIndex);
  const finalFrameIndex = scenario.frames.length - 1;
  const finalAnswers = frameDirectionAnswers(scenario, finalFrameIndex);
  const allEvidenceSelected = scenario.requiredEvidenceIds.every((id) => evidence.includes(id));
  const choicesComplete = (answers: FrameDirectionAnswer[], selected: ChoiceMap) => answers.every((answer) => Boolean(selected[answer.id]));
  const modesCorrect = finalAnswers.every((answer) => selectedModes[answer.id] === answer.mode);
  const allModesSelected = finalAnswers.every((answer) => Boolean(selectedModes[answer.id]));
  useEffect(() => { stageHeadingRef.current?.focus(); }, [stage]);
  function setChoice(setter: (value: ChoiceMap) => void, current: ChoiceMap, id: string, value: string) { setter({ ...current, [id]: value }); }
  function recordPrediction() {
    if (!choicesComplete(predictionAnswers, prediction)) return;
    setFeedback("예측을 기록했어요. 이제 자료를 한 시점씩 열어 볼까요?");
    setStage("timeline");
  }
  function reviewDirections() {
    if (!areAcceptedFrameDirections(scenario, finalFrameIndex, finalDirections)) { setFeedback("마지막 온도와 화살표 설명을 다시 확인해 보세요. 모든 경로의 방향이 자료와 맞아야 다음으로 갈 수 있어요."); return; }
    setSelectedModes({}); setEvidence([]); setFeedback(""); setStage("mode");
  }
  function reviewModes() {
    if (!modesCorrect) { setFeedback("각 경로의 온도와 전달 모습을 다시 확인해 보세요. 주된 방식이 모두 맞아야 다음으로 갈 수 있어요."); return; }
    setFeedback(""); setStage("evidence");
  }
  function goBack() { const previous: Partial<Record<Stage, Stage>> = { prediction: "condition", timeline: "prediction", review: "timeline", mode: "review", evidence: "mode", result: "evidence" }; const next = previous[stage]; if (next) setStage(next); }
  function resetScenario() { setStage("condition"); setPrediction({}); setRevealedFrameIndex(0); setObserved(false); setFinalDirections({}); setSelectedModes({}); setEvidence([]); setFeedback(""); setConfirmReset(false); requestAnimationFrame(() => resetButtonRef.current?.focus()); }
  return <section className="scenario-flow" aria-labelledby="scenario-title">
    <div className="progress-line" aria-label={`사건 ${number}의 현재 단계: ${stageNames[stage]}`}>{(Object.keys(stageNames) as Stage[]).map((item) => <span key={item} className={item === stage ? "active" : ""}>{stageNames[item]}</span>)}<button ref={resetButtonRef} type="button" onClick={() => setConfirmReset(true)}>사건 처음부터</button></div>
    <div className="scenario-heading"><p className="section-kicker">고정 추적 사건 {number} / 5</p><h1 id="scenario-title">{scenario.title}</h1><p>{scenario.condition}</p></div>
    <h2 ref={stageHeadingRef} className="sr-only" tabIndex={-1}>{stageNames[stage]} 단계</h2>
    {stage === "condition" && <section className="condition-sheet"><h2>배달 조건표를 확인해요</h2><ul>{scenario.controlledConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>{scenario.changedCondition && <p className="changed-condition">바뀌는 조건: {scenario.changedCondition}</p>}<button type="button" className="button primary" onClick={() => setStage("prediction")}>시작 온도 확인했어요</button></section>}
    {stage === "prediction" && <section className="decision-panel"><h2>처음에는 어느 쪽으로 갈까요?</h2><p>시작 온도와 조건을 근거로 모든 경로를 골라요. 나중에 바꿔도 괜찮아요.</p>{predictionAnswers.map((answer, index) => <fieldset className="choice-group" key={answer.id}><legend>{predictionAnswers.length > 1 ? `정거장 ${"ABC"[index]}의 알짜 이동 방향` : "알짜 이동 방향 예측"}</legend>{directionOptions(answer).map((option) => <label key={option.id}><input type="radio" name={`prediction-${scenario.id}-${answer.id}`} checked={prediction[answer.id] === option.id} onChange={() => setChoice(setPrediction, prediction, answer.id, option.id)} /> {directionLabel(scenario, option.fromId, option.toId, option.id)}</label>)}</fieldset>)}<button type="button" className="button primary" disabled={!choicesComplete(predictionAnswers, prediction)} onClick={recordPrediction}>예측 기록하기</button></section>}
    {stage === "timeline" && <><ThermalWorkbench scenario={scenario} frameIndex={revealedFrameIndex} /><p aria-live="polite" className="sr-only">새 시점: {scenario.frames[revealedFrameIndex].timeLabel} 자료가 열렸어요.</p><div className="observation-panel"><h2>{scenario.frames[revealedFrameIndex].timeLabel} 자료를 읽었나요?</h2><label className="check-row"><input type="checkbox" checked={observed} onChange={(event) => setObserved(event.target.checked)} /> 모든 온도 숫자와 화살표 설명을 함께 확인했어요.</label>{revealedFrameIndex < finalFrameIndex ? <button type="button" className="button primary" disabled={!canRevealNextFrame(revealedFrameIndex, Number(observed), scenario.frames.length)} onClick={() => { setRevealedFrameIndex(revealNextFrame(revealedFrameIndex, Number(observed), scenario.frames.length)); setObserved(false); }}>다음 시점 열기</button> : <button type="button" className="button primary" disabled={!observed} onClick={() => setStage("review")}>자료 추적 마치기</button>}</div><TemperatureChart scenario={scenario} revealedFrameIndex={revealedFrameIndex} /><TemperatureTable scenario={scenario} revealedFrameIndex={revealedFrameIndex} /></>}
    {stage === "review" && <section className="decision-panel"><h2>마지막 자료를 보고 방향을 확인해요</h2>{finalAnswers.map((answer, index) => <fieldset className="choice-group" key={answer.id}><legend>{finalAnswers.length > 1 ? `정거장 ${"ABC"[index]}의 최종 방향` : "최종 방향"}</legend><p>{answer.textAlternative}</p>{directionOptions(answer).map((option) => <label key={option.id}><input type="radio" name={`final-${scenario.id}-${answer.id}`} checked={finalDirections[answer.id] === option.id} onChange={() => setChoice(setFinalDirections, finalDirections, answer.id, option.id)} /> {directionLabel(scenario, option.fromId, option.toId, option.id)}</label>)}</fieldset>)}<button type="button" className="button primary" disabled={!choicesComplete(finalAnswers, finalDirections)} onClick={reviewDirections}>방향 확인하기</button>{feedback && <p className="feedback" role="status">{feedback}</p>}</section>}
    {stage === "mode" && <section className="decision-panel"><h2>주로 살펴본 이동 방식은 무엇일까요?</h2>{finalAnswers.map((answer, index) => <fieldset className="choice-group" key={answer.id}><legend>{finalAnswers.length > 1 ? `정거장 ${"ABC"[index]}의 주된 방식` : "이동 방식 선택"}</legend>{scenario.primaryModes.map((mode) => <label key={mode}><input type="radio" name={`mode-${scenario.id}-${answer.id}`} checked={selectedModes[answer.id] === mode} onChange={() => setChoice(setSelectedModes, selectedModes, answer.id, mode)} /> {modeLabels[mode]}</label>)}</fieldset>)}<button type="button" className="button primary" disabled={!allModesSelected} onClick={reviewModes}>근거 고르기</button>{feedback && <p className="feedback" role="status">{feedback}</p>}</section>}
    {stage === "evidence" && <section className="evidence-panel"><h2>근거를 연결해요</h2><p>이 사건에 꼭 필요한 근거를 모두 골라요.</p><div className="evidence-grid">{scenario.evidence.map((item) => <label className={`evidence-card ${evidence.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={evidence.includes(item.id)} onChange={(event) => setEvidence(event.target.checked ? [...evidence, item.id] : evidence.filter((id) => id !== item.id))} /><strong>{item.title}</strong><span>{item.detail}</span></label>)}</div>{!allEvidenceSelected && <p className="hint">필요한 근거를 모두 골라야 기록을 볼 수 있어요.</p>}<button type="button" className="button primary" disabled={!allEvidenceSelected} onClick={() => setStage("result")}>추적 기록 보기</button></section>}
    {stage === "result" && <section className="result-panel"><p className="completion-stamp">추적 완료</p><h2>열 이동 추적 기록</h2><dl><div><dt>시작 온도 차</dt><dd>{scenario.bodies.map((body) => `${body.label} ${body.initialTemperatureC}°C`).join(" / ")}</dd></div><div><dt>처음 예측</dt><dd>{predictionAnswers.map((answer) => directionLabel(scenario, answer.fromId, answer.toId, prediction[answer.id])).join(" · ")}</dd></div><div><dt>예측 변화</dt><dd>{finalAnswers.map((answer, index) => { const initial = predictionAnswers[index]; return revisionStatus(prediction[initial?.id] ?? "", finalDirections[answer.id], initial?.id ?? "", answer.id); }).join(" · ")}</dd></div><div><dt>최종 알짜 방향</dt><dd>{finalAnswers.map((answer) => directionLabel(scenario, answer.fromId, answer.toId, finalDirections[answer.id])).join(" · ")}</dd></div><div><dt>선택한 방식</dt><dd>{finalAnswers.map((answer) => modeLabels[selectedModes[answer.id] as HeatTransferMode]).join(" · ")}</dd></div><div><dt>선택한 근거</dt><dd>{scenario.evidence.filter((item) => evidence.includes(item.id)).map((item) => item.title).join(" · ")}</dd></div><div><dt>모형의 한계</dt><dd>{scenario.limitationText}</dd></div></dl><p className="reality-note">현실에서는 전도·대류·복사가 함께 나타날 수 있어요. 이 사건은 한 방식을 비교하려고 단순화했어요.</p><button type="button" className="button primary" onClick={onComplete}>{number === 5 ? "전체 활동 마무리" : "다음 사건으로"}</button></section>}
    {stage !== "condition" && <button type="button" className="button secondary" onClick={goBack}>이전 단계로</button>}
    {feedback && <p className="sr-only" aria-live="polite">{feedback}</p>}
    {confirmReset && <Dialog title="이 사건을 처음부터 볼까요?" onClose={() => { setConfirmReset(false); requestAnimationFrame(() => resetButtonRef.current?.focus()); }}><p>지금까지 연 자료와 선택한 답을 지우고, 이 사건의 조건 확인으로 돌아가요.</p><button type="button" className="button primary" onClick={resetScenario}>처음부터 보기</button></Dialog>}
  </section>;
}
