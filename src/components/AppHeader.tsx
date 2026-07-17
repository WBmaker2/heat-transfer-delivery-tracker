"use client";

type AppHeaderProps = {
  scenarioLabel: string;
  onOpenHelp: () => void;
  onOpenTeacher: () => void;
  onOpenUpdates: () => void;
};

export function AppHeader({ scenarioLabel, onOpenHelp, onOpenTeacher, onOpenUpdates }: AppHeaderProps) {
  return (
    <header className="app-header">
      <a className="brand" href="#main-content" aria-label="본문으로 이동">
        <span className="brand-mark" aria-hidden="true">↝</span>
        <span><strong>열 이동 배달 추적소</strong><small>온도표를 따라 열이 간 방향을 찾아요</small></span>
      </a>
      <div className="header-tools">
        <span className="scenario-chip">{scenarioLabel}</span>
        <button type="button" onClick={onOpenHelp}>도움말</button>
        <button type="button" onClick={onOpenTeacher}>교사용 안내</button>
        <button type="button" onClick={onOpenUpdates}>업데이트 내역</button>
      </div>
    </header>
  );
}
