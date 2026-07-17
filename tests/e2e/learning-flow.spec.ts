import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function tabTo(page: Page, target: Locator, direction: "forward" | "backward" = "forward") {
  for (let attempt = 0; attempt < 48; attempt += 1) {
    if (await target.evaluate((element) => document.activeElement === element)) return;
    await page.keyboard.press(direction === "forward" ? "Tab" : "Shift+Tab");
  }
  await expect(target).toBeFocused();
}

async function activateWithKeyboard(page: Page, target: Locator, key: "Space" | "Enter") {
  await tabTo(page, target);
  await page.keyboard.press(key);
}

async function startScenarioWithKeyboard(page: Page) {
  await activateWithKeyboard(page, page.getByLabel("50°C에서 20°C로"), "Space");
  await activateWithKeyboard(page, page.getByLabel(/이 안내를 읽었어요/), "Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "첫 사건 시작하기" }), "Enter");
  await expect(page.getByRole("heading", { name: "조건 단계" })).toBeFocused();
}

async function enterTimelineWithKeyboard(page: Page) {
  await activateWithKeyboard(page, page.getByRole("button", { name: "시작 온도 확인했어요" }), "Enter");
  await activateWithKeyboard(page, page.getByLabel("가상 고체 A에서 가상 고체 B로"), "Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "예측 기록하기" }), "Enter");
}

async function revealCurrentFrameWithKeyboard(page: Page) {
  await activateWithKeyboard(page, page.getByLabel(/모든 온도 숫자와 화살표 설명/), "Space");
  const next = page.getByRole("button", { name: "다음 시점 열기" });
  if (await next.isVisible()) await activateWithKeyboard(page, next, "Enter");
  else await activateWithKeyboard(page, page.getByRole("button", { name: "자료 추적 마치기" }), "Enter");
}

async function reachFinalReviewWithKeyboard(page: Page) {
  const observation = page.getByLabel(/모든 온도 숫자와 화살표 설명/);
  for (let index = 0; index < 5 && await observation.isVisible(); index += 1) await revealCurrentFrameWithKeyboard(page);
}

test("keyboard-only learner flow reveals evidence, handles revision, and records a result", async ({ page }) => {
  await page.goto("/");
  await startScenarioWithKeyboard(page);
  await enterTimelineWithKeyboard(page);
  await expect(page.getByRole("heading", { name: /시작의 온도와 알짜 방향/ })).toBeVisible();

  await revealCurrentFrameWithKeyboard(page);
  await expect(page.getByText("새 시점: 1단계 자료가 열렸어요.")).toHaveAttribute("aria-live", "polite");
  await activateWithKeyboard(page, page.getByRole("button", { name: "이전 단계로" }), "Enter");
  await expect(page.getByRole("heading", { name: "예측 단계" })).toBeFocused();
  await activateWithKeyboard(page, page.getByRole("button", { name: "예측 기록하기" }), "Enter");
  await expect(page.getByRole("heading", { name: /1단계 자료를 읽었나요/ })).toBeVisible();

  await reachFinalReviewWithKeyboard(page);
  await tabTo(page, page.getByLabel("한쪽 방향 없음"));
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("가상 고체 B에서 가상 고체 A로")).toBeFocused();
  await page.keyboard.press("Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "방향 확인하기" }), "Enter");
  await expect(page.getByRole("status")).toContainText(/모든 경로의 방향이 자료와 맞아야/);
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByLabel("가상 고체 B에서 가상 고체 A로")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("한쪽 방향 없음")).toBeFocused();
  await page.keyboard.press("Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "방향 확인하기" }), "Enter");
  await expect(page.getByRole("heading", { name: "방식 단계" })).toBeFocused();

  await activateWithKeyboard(page, page.getByLabel(/맞닿아 전달됨/), "Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "근거 고르기" }), "Enter");
  const evidenceInputs = page.locator(".evidence-card input");
  await activateWithKeyboard(page, evidenceInputs.nth(0), "Space");
  await activateWithKeyboard(page, evidenceInputs.nth(1), "Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "추적 기록 보기" }), "Enter");
  await expect(page.getByRole("heading", { name: "열 이동 추적 기록" })).toBeVisible();
});

test("active scenario stays operable at 320px, 200 percent zoom, media modes, dialog, and axe", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const guideAxe = await new AxeBuilder({ page }).analyze();
  expect(guideAxe.violations).toEqual([]);
  await startScenarioWithKeyboard(page);
  await enterTimelineWithKeyboard(page);
  await expect(page.getByRole("heading", { name: /시작의 온도와 알짜 방향/ })).toBeVisible();
  await expect(page.locator(".temperature-table-cards")).toBeVisible();
  await expect(page.getByRole("button", { name: "사건 처음부터" })).toHaveCSS("min-height", "48px");
  await expect(page.getByRole("button", { name: "사건 처음부터" })).toHaveJSProperty("offsetHeight", 48);
  let dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("*")].map((element) => ({ className: element.className, parentClassName: element.parentElement?.className, tagName: element.tagName, text: element.textContent?.slice(0, 40), right: element.getBoundingClientRect().right })).filter((item) => item.right > document.documentElement.clientWidth + 1).slice(0, 8));
  expect(dimensions.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(dimensions.clientWidth);

  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  await expect(page.getByRole("button", { name: "사건 처음부터" })).toBeVisible();
  dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await activateWithKeyboard(page, page.getByRole("button", { name: "사건 처음부터" }), "Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "닫기" }).first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "사건 처음부터" })).toBeFocused();
  await page.keyboard.press("Enter");
  await tabTo(page, page.getByRole("button", { name: "처음부터 보기" }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "사건 처음부터" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "배달 조건표를 확인해요" })).toBeVisible();

  await enterTimelineWithKeyboard(page);
  const activeAxe = await new AxeBuilder({ page }).analyze();
  expect(activeAxe.violations).toEqual([]);
  await activateWithKeyboard(page, page.getByRole("button", { name: "사건 처음부터" }), "Enter");
  const dialogAxe = await new AxeBuilder({ page }).include("[role='dialog']").analyze();
  expect(dialogAxe.violations).toEqual([]);

  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  const mediaStyles = await page.evaluate(() => ({
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    forcedColors: matchMedia("(forced-colors: active)").matches,
    animation: getComputedStyle(document.querySelector(".completion-stamp") ?? document.body).animationName,
    seriesStroke: getComputedStyle(document.querySelector(".series") ?? document.body).stroke,
  }));
  expect(mediaStyles.reducedMotion).toBe(true);
  expect(mediaStyles.forcedColors).toBe(true);
  expect(mediaStyles.animation).toBe("none");
  expect(mediaStyles.seriesStroke).not.toBe("");
});
