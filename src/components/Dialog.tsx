"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

type DialogProps = { title: string; children: ReactNode; onClose: () => void };

export function Dialog({ title, children, onClose }: DialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const firstControl = dialogRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    firstControl?.focus();
  }, []);
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    if (event.key !== "Tab") return;
    const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") ?? []).filter((element) => !element.hasAttribute("disabled"));
    if (!controls.length) return;
    const first = controls[0]; const last = controls.at(-1)!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onKeyDown={onKeyDown} onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button type="button" aria-label="닫기" onClick={onClose}>×</button></div>
        {children}
        <button type="button" className="button primary" onClick={onClose}>닫기</button>
      </section>
    </div>
  );
}
