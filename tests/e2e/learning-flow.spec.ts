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
  const guideCheck = page.getByLabel(/이 안내를 읽었어요/);
  await expect(guideCheck.locator("..")).toHaveClass(/gi-pulse/);
  await activateWithKeyboard(page, guideCheck, "Space");
  await expect(guideCheck.locator("..")).not.toHaveClass(/gi-pulse/);
  const startButton = page.getByRole("button", { name: "첫 사건 시작하기" });
  await expect(startButton).toHaveClass(/gi-pulse/);
  await activateWithKeyboard(page, startButton, "Enter");
  await expect(page.getByRole("heading", { name: "조건 단계" })).toBeFocused();
}

async function enterTimelineWithKeyboard(page: Page) {
  await activateWithKeyboard(page, page.getByRole("button", { name: "시작 온도 확인했어요" }), "Enter");
  await activateWithKeyboard(page, page.getByLabel("가상 고체 A에서 가상 고체 B로"), "Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "예측 기록하기" }), "Enter");
}

async function revealCurrentFrameWithKeyboard(page: Page) {
  const observationCheck = page.locator(".observation-panel input[type='checkbox']");
  await expect(observationCheck.locator("..")).toHaveClass(/gi-pulse/);
  await activateWithKeyboard(page, observationCheck, "Space");
  await expect(observationCheck.locator("..")).not.toHaveClass(/gi-pulse/);
  const next = page.getByRole("button", { name: "다음 시간 단계 열기" });
  if (await next.isVisible()) {
    await expect(next).toHaveClass(/gi-pulse/);
    await activateWithKeyboard(page, next, "Enter");
  } else {
    const finishTracking = page.getByRole("button", { name: "자료 추적 마치기" });
    await expect(finishTracking).toHaveClass(/gi-pulse/);
    await activateWithKeyboard(page, finishTracking, "Enter");
  }
}

async function reachFinalReviewWithKeyboard(page: Page) {
  const observation = page.locator(".observation-panel input[type='checkbox']");
  for (let index = 0; index < 5 && await observation.isVisible(); index += 1) await revealCurrentFrameWithKeyboard(page);
}

test("keyboard-only learner flow reveals evidence, handles revision, and records a result", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("20°C에서 50°C로").check();
  await expect(page.getByRole("status")).toHaveText("50은 20보다 높아요. 열은 온도가 높은 쪽에서 낮은 쪽으로 이동해요.");
  await page.getByLabel("50°C에서 20°C로").focus();
  await startScenarioWithKeyboard(page);
  await enterTimelineWithKeyboard(page);
  await expect(page.getByRole("heading", { name: /시작의 온도와 열이 가는 방향/ })).toBeVisible();
  await expect(page.getByText("이번에 볼 것")).toBeVisible();
  await expect(page.getByRole("heading", { name: /온도 숫자를 먼저 비교해요/ })).toBeVisible();
  await expect(page.getByLabel("온도 변화와 화살표를 확인했어요.")).toBeVisible();
  await expect(page.getByText("순서: 자료 읽기 → 이 상자 체크 → 다음 단계 열기")).toBeVisible();
  expect(await page.locator(".scenario-flow").evaluate((flow) => {
    const observation = flow.querySelector(".observation-panel");
    const workbench = flow.querySelector(".workbench");
    return Boolean(observation && workbench && (observation.compareDocumentPosition(workbench) & Node.DOCUMENT_POSITION_FOLLOWING));
  })).toBe(true);

  await revealCurrentFrameWithKeyboard(page);
  await expect(page.getByText("새 시간 단계: 1단계 자료가 열렸어요.")).toHaveAttribute("aria-live", "polite");
  await expect(page.getByRole("heading", { name: /전 단계와 온도를 비교해요/ })).toBeVisible();
  await activateWithKeyboard(page, page.getByRole("button", { name: "이전 단계로" }), "Enter");
  await expect(page.getByRole("heading", { name: "예측 단계" })).toBeFocused();
  await activateWithKeyboard(page, page.getByRole("button", { name: "예측 기록하기" }), "Enter");
  await expect(page.getByRole("heading", { name: /전 단계와 온도를 비교해요/ })).toBeVisible();

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
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByLabel(/맞닿은 곳이나 고체를 따라 열이 가요/)).toBeVisible();
  await expect(page.getByLabel(/액체나 기체가 움직이며 열을 나르는 것/)).toBeVisible();
  await expect(page.getByLabel(/떨어져 있어도 열이 가요/)).toBeVisible();
  await expect(page.getByLabel("여러 방식이 함께 일어나요")).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await activateWithKeyboard(page, page.getByLabel(/맞닿은 곳이나 고체를 따라 열이 가요/), "Space");
  await activateWithKeyboard(page, page.getByRole("button", { name: "근거 고르기" }), "Enter");
  const evidenceInputs = page.locator(".evidence-card input");
  await activateWithKeyboard(page, evidenceInputs.nth(2), "Space");
  await expect(page.getByRole("button", { name: "추적 기록 보기" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("맞지 않는 카드는 다시 눌러 빼 주세요.");
  await activateWithKeyboard(page, evidenceInputs.nth(2), "Space");
  await activateWithKeyboard(page, evidenceInputs.nth(0), "Space");
  await activateWithKeyboard(page, evidenceInputs.nth(1), "Space");
  await expect(page.getByRole("button", { name: "추적 기록 보기" })).toHaveClass(/gi-pulse/);
  await activateWithKeyboard(page, page.getByRole("button", { name: "추적 기록 보기" }), "Enter");
  await expect(page.getByRole("heading", { name: "열이 어떻게 움직였는지 정리" })).toBeVisible();
  await expect(page.getByText("내 처음 예측")).toBeVisible();
  await expect(page.getByText("예측 시점의 방향")).toBeVisible();
  await expect(page.getByText("마지막 자료의 방향")).toBeVisible();
  await expect(page.getByText("예측 시점과 마지막 비교")).toBeVisible();
  await expect(page.getByText("시간이 지나 열 이동 방향이 바뀜")).toBeVisible();
  const reason = page.locator("dt", { hasText: "까닭" }).locator("..").locator("dd");
  await expect(reason).toContainText("온도 차");
  await expect(reason).toContainText("맞닿은 곳");
  await expect(reason).not.toContainText("액체·기체");
  const resultAxe = await new AxeBuilder({ page }).analyze();
  expect(resultAxe.violations).toEqual([]);
  await page.getByRole("button", { name: "다음 사건으로" }).click();
  await page.getByRole("button", { name: "시작 온도 확인했어요" }).click();
  await expect(page.getByLabel("가상 물체에서 열원으로")).toBeVisible();
});

test("active scenario stays operable at 320px, 200 percent zoom, media modes, dialog, and axe", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const guideAxe = await new AxeBuilder({ page }).analyze();
  expect(guideAxe.violations).toEqual([]);
  await startScenarioWithKeyboard(page);
  await enterTimelineWithKeyboard(page);
  await expect(page.getByRole("heading", { name: /시작의 온도와 열이 가는 방향/ })).toBeVisible();
  await expect(page.locator(".temperature-table-cards")).toBeVisible();
  await expect(page.getByText("옆으로 밀어 다음 단계도 볼 수 있어요.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "온도 변화 그래프" })).toHaveCSS("white-space", "nowrap");
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
  await expect(page.getByRole("heading", { name: "시작 조건표를 확인해요" })).toBeVisible();

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

test("mobile workbench keeps both thermal cards and the current stage readable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const headerToolHeights = await page.locator(".header-tools button").evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
  expect(headerToolHeights.every((height) => height >= 44)).toBe(true);
  await startScenarioWithKeyboard(page);
  await expect(page.locator(".progress-step[aria-current='step']")).toHaveText(/조건/);
  await expect(page.locator(".progress-step[data-stage-status='upcoming']")).toHaveCount(6);
  await expect(page.locator(".progress-line")).toHaveCSS("list-style-type", "none");
  await expect(page.locator(".progress-line")).toHaveCSS("padding-left", "0px");

  await enterTimelineWithKeyboard(page);
  const route = page.locator(".workbench-route").first();
  const thermalCards = route.locator("[data-thermal-card]");
  const direction = route.locator("[data-direction-description]");
  await expect(thermalCards).toHaveCount(2);
  await expect(thermalCards.nth(0)).toContainText("가상 고체 A");
  await expect(thermalCards.nth(1)).toContainText("가상 고체 B");
  await expect(direction).toContainText("열이 가요");

  const layout = await route.evaluate((element) => {
    const row = element.querySelector<HTMLElement>(".body-row")!;
    const routeBounds = element.getBoundingClientRect();
    const parts = [...element.querySelectorAll<HTMLElement>("[data-thermal-card], [data-direction-description]")];
    return {
      direction: getComputedStyle(row).flexDirection,
      internalOverflow: parts.some((part) => part.scrollWidth > part.clientWidth || part.scrollHeight > part.clientHeight),
      partsFitRoute: parts.every((part) => {
        const bounds = part.getBoundingClientRect();
        return bounds.left >= routeBounds.left - 1 && bounds.right <= routeBounds.right + 1;
      }),
    };
  });
  expect(layout.direction).toBe("column");
  expect(layout.internalOverflow).toBe(false);
  expect(layout.partsFitRoute).toBe(true);
  await expect(page.locator(".progress-step[aria-current='step']")).toHaveText(/시간 자료/);
  await expect(page.locator(".progress-step[data-stage-status='complete']")).toHaveCount(2);

  await page.setViewportSize({ width: 390, height: 844 });
  const layout390 = await route.evaluate((element) => {
    const routeBounds = element.getBoundingClientRect();
    const parts = [...element.querySelectorAll<HTMLElement>("[data-thermal-card], [data-direction-description]")];
    return {
      internalOverflow: parts.some((part) => part.scrollWidth > part.clientWidth || part.scrollHeight > part.clientHeight),
      partsFitRoute: parts.every((part) => {
        const bounds = part.getBoundingClientRect();
        return bounds.left >= routeBounds.left - 1 && bounds.right <= routeBounds.right + 1;
      }),
    };
  });
  expect(layout390.internalOverflow).toBe(false);
  expect(layout390.partsFitRoute).toBe(true);
});
