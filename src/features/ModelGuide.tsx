"use client";

import { useState } from "react";
import { modelNotes } from "../content/explanations";

export function ModelGuide({ onComplete }: { onComplete: () => void }) {
  const [direction, setDirection] = useState("");
  const [notesChecked, setNotesChecked] = useState(false);
  const isCorrect = direction === "warm-to-cool";
  const ready = isCorrect && notesChecked;

  return (
    <section className="guide-panel" aria-labelledby="guide-title">
      <div className="guide-copy"><p className="section-kicker">안내 활동</p><h1 id="guide-title">어느 쪽으로 갈까요?</h1><p>50°C 물체와 20°C 물체가 맞닿아 있어요. 색보다 두 온도 숫자를 먼저 비교해 봐요.</p></div>
      <div className="guide-demo">
        <div className="mini-body warm"><span>가상 물체 A</span><strong>50°C</strong></div><div className="net-arrow" aria-hidden="true">→</div><div className="mini-body cool"><span>가상 물체 B</span><strong>20°C</strong></div>
      </div>
      <fieldset className="choice-group"><legend>열이 전체적으로 어느 쪽으로 갈까요?</legend>
        <label><input type="radio" name="guide-direction" value="warm-to-cool" checked={isCorrect} onChange={(event) => setDirection(event.target.value)} /> 50°C에서 20°C로</label>
        <label><input type="radio" name="guide-direction" value="cool-to-warm" checked={direction === "cool-to-warm"} onChange={(event) => setDirection(event.target.value)} /> 20°C에서 50°C로</label>
      </fieldset>
      {direction && !isCorrect && <p className="feedback" role="status">50은 20보다 높아요. 열은 온도가 높은 쪽에서 낮은 쪽으로 이동해요.</p>}
      {isCorrect && <p className="feedback success" role="status">맞아요. 온도가 높은 곳에서 낮은 곳으로 열이 이동해요.</p>}
      <div className="model-notes model-notes-essential">
        {modelNotes.slice(0, 2).map((note) => <p key={note}>• {note}</p>)}
      </div>
      <details className="model-notes-more">
        <summary>자료와 안전 안내 더 보기</summary>
        <div className="model-notes">{modelNotes.slice(2).map((note) => <p key={note}>• {note}</p>)}</div>
      </details>
      <label className="check-row"><input type="checkbox" checked={notesChecked} onChange={(event) => setNotesChecked(event.target.checked)} /> 이 안내를 읽었어요. 화살표는 열이 전체적으로 가는 방향이에요.</label>
      <button type="button" className="button primary" disabled={!ready} onClick={onComplete}>첫 사건 시작하기</button>
      {!ready && <p className="hint">방향과 안내 확인을 마치면 시작할 수 있어요.</p>}
    </section>
  );
}
