"use client";

import { useRef, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { Dialog } from "../components/Dialog";
import { modeExplanations, updateHistory } from "../content/explanations";
import { scenarios } from "../content/scenarios";
import { ModelGuide } from "../features/ModelGuide";
import { ScenarioFlow } from "../features/ScenarioFlow";

type DialogName = "help" | "teacher" | "updates" | null;

function DialogContent({ dialog }: { dialog: Exclude<DialogName, null> }) {
  if (dialog === "updates") return <><p><strong>{updateHistory.date} · {updateHistory.version}</strong></p><ul>{updateHistory.items.map((item) => <li key={item}>{item}</li>)}</ul></>;
  if (dialog === "teacher") return <><p>이 앱은 실제 온도 측정을 대신하지 않고, 고정 시간 자료를 읽고 원인을 추리하는 연습이에요.</p><ul><li>사건 1의 40°C는 같은 재료·같은 양·닫힌 모형의 결과예요.</li><li>차가움이 이동한다고 말하기보다, 따뜻한 쪽의 열이 이동한다고 안내해 주세요.</li><li>실제 실험은 교사가 안전 온도와 보호 절차를 확인한 뒤 진행해 주세요.</li></ul></>;
  return <><p>활동 순서: 조건 확인 → 방향 예측 → 시간별 온도 읽기 → 방향 확인 → 방식과 근거 연결 → 기록 확인</p><p><strong>기억할 규칙:</strong> 열은 온도가 높은 쪽에서 낮은 쪽으로 이동해요.</p><ul>{modeExplanations.map(([name, detail]) => <li key={name}><strong>{name}:</strong> {detail}</li>)}</ul><p>화살표는 열이 든 물건이 아니라, 열이 전체적으로 이동하는 방향을 뜻해요.</p></>;
}

export function TrackerApp() {
  const [started, setStarted] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [finished, setFinished] = useState(false);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);
  const scenario = scenarios[scenarioIndex];
  const scenarioLabel = started ? `사건 ${scenarioIndex + 1} / 5` : "안내 활동";
  function completeScenario() {
    if (scenarioIndex === scenarios.length - 1) setFinished(true);
    else setScenarioIndex((index) => index + 1);
  }
  function openDialog(nextDialog: Exclude<DialogName, null>) { dialogTriggerRef.current = document.activeElement as HTMLElement; setDialog(nextDialog); }
  function closeDialog() { setDialog(null); requestAnimationFrame(() => dialogTriggerRef.current?.focus()); }
  return <div className="app-shell"><AppHeader scenarioLabel={scenarioLabel} onOpenHelp={() => openDialog("help")} onOpenTeacher={() => openDialog("teacher")} onOpenUpdates={() => openDialog("updates")} />
    <main id="main-content" tabIndex={-1}>{!started ? <ModelGuide onComplete={() => setStarted(true)} /> : finished ? <section className="finish-panel"><p className="completion-stamp">전체 추적 완료</p><h1>다섯 사건을 모두 살펴봤어요.</h1><p>온도 숫자, 시간 변화, 열이 가는 방향, 이동 방식을 함께 읽었어요.</p><button type="button" className="button primary gi-pulse" onClick={() => { setStarted(false); setScenarioIndex(0); setFinished(false); }}>처음부터 다시 보기</button></section> : <ScenarioFlow key={scenario.id} scenario={scenario} number={scenarioIndex + 1} onComplete={completeScenario} />}</main>
    <footer>연습용 고정 자료 · 개인정보를 수집하거나 저장하지 않아요.</footer>
    {dialog && <Dialog title={dialog === "help" ? "도움말" : dialog === "teacher" ? "교사용 안내" : "업데이트 내역"} onClose={closeDialog}><DialogContent dialog={dialog} /></Dialog>}
  </div>;
}
