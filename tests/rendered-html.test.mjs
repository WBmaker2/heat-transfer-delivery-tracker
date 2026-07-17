import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the Korean heat-transfer learning guide", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html lang="ko">/i);
  assert.match(html, /<title>열 이동 배달 추적소/);
  assert.match(html, /열 이동 배달 추적소/);
  assert.match(html, /어느 쪽으로 갈까요/);
  assert.match(html, /50°C에서 20°C로/);
  assert.match(html, /업데이트 내역/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("removes the starter preview and keeps the educational content wired", async () => {
  const [page, layout, packageJson, scenarios, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"), readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"), readFile(new URL("../src/content/scenarios.ts", import.meta.url), "utf8"), readFile(new URL("../app/tracker.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /TrackerApp/); assert.match(layout, /lang="ko"/); assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  for (const id of ["contact-lockers", "source-switch", "solid-bridge", "liquid-cycle", "radiation-audit"]) assert.match(scenarios, new RegExp(`id: "${id}"`));
  assert.match(styles, /@media \(max-width:700px\)/); assert.match(styles, /prefers-reduced-motion/);
  await assert.rejects(readFile(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)));
});
