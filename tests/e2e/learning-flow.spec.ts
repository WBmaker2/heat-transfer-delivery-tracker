import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function completeGuide(page: import("@playwright/test").Page) {
  await page.getByLabel("50°C에서 20°C로").check();
  await page.getByLabel(/이 안내를 읽었어요/).check();
  await page.getByRole("button", { name: "첫 사건 시작하기" }).click();
}

async function reachFinalReview(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "시작 온도 확인했어요" }).focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("가상 고체 A에서 가상 고체 B로").focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "예측 기록하기" }).focus();
  await page.keyboard.press("Enter");
  for (let index = 0; index < 5; index += 1) {
    await page.getByLabel(/모든 온도 숫자와 화살표 설명/).check();
    if (index < 4) await page.getByRole("button", { name: "다음 시점 열기" }).click();
  }
  await page.getByRole("button", { name: "자료 추적 마치기" }).click();
}

test("guide, sequential reveal, wrong final feedback, and keyboard flow work", async ({ page }) => {
  await page.goto("/");
  await completeGuide(page);
  await expect(page.getByRole("heading", { name: "조건 단계" })).toBeFocused();
  await reachFinalReview(page);
  await page.getByLabel("가상 고체 B에서 가상 고체 A로").check();
  await page.getByRole("button", { name: "방향 확인하기" }).click();
  await expect(page.getByRole("status")).toContainText(/모든 경로의 방향이 자료와 맞아야/);
  await page.getByLabel("한쪽 방향 없음").check();
  await page.getByRole("button", { name: "방향 확인하기" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "주로 살펴본 이동 방식은 무엇일까요?" })).toBeVisible();
});

test("dialog focus, compact viewport, media modes, and axe are accessible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "도움말" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "닫기" }).first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "도움말" })).toBeFocused();
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.evaluate(() => { document.body.style.zoom = "2"; });
  await expect(page.getByRole("heading", { name: "어느 쪽으로 갈까요?" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
