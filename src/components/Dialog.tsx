"use client";

import type { ReactNode } from "react";

type DialogProps = { title: string; children: ReactNode; onClose: () => void };

export function Dialog({ title, children, onClose }: DialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button type="button" aria-label="닫기" onClick={onClose}>×</button></div>
        {children}
        <button type="button" className="button primary" onClick={onClose}>닫기</button>
      </section>
    </div>
  );
}
