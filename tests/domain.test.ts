import assert from "node:assert/strict";
import test from "node:test";

import { judgeNetDirection } from "../src/domain/heatDirectionJudge.ts";
import {
  scenarios,
  validateScenarioCatalog,
} from "../src/content/scenarios.ts";
import {
  canRevealNextFrame,
  revealNextFrame,
} from "../src/domain/revealState.ts";
import {
  areAcceptedFrameDirections,
  frameDirectionAnswers,
  isAcceptedFinalDirection,
  revisionStatus,
} from "../src/domain/learningRecord.ts";
import { getChartDomain } from "../src/visualization/chartDomain.ts";

test("higher temperature points toward lower temperature and equal temperatures have no direction", () => {
  assert.equal(judgeNetDirection("a", 60, "b", 20), "a-to-b");
  assert.equal(judgeNetDirection("a", 20, "b", 60), "b-to-a");
  assert.equal(judgeNetDirection("a", 40, "b", 40), "none");
});

test("the five fixed scenarios meet the catalog contract", () => {
  assert.equal(scenarios.length, 5);
  assert.deepEqual(validateScenarioCatalog(scenarios), []);
  const contact = scenarios[0];
  assert.deepEqual(
    contact.frames.map((frame) => frame.temperaturesC.a + frame.temperaturesC.b),
    [80, 80, 80, 80, 80],
  );
  assert.equal(contact.frames.at(-1)?.edges[0].netDirection, "none");
  const solidBridge = scenarios.find((scenario) => scenario.id === "solid-bridge");
  assert.equal(solidBridge?.bodies.length, 4);
  const audit = scenarios.find((scenario) => scenario.id === "final-audit");
  assert.equal("auditStations" in audit!, false);
  assert.ok((audit?.frames.length ?? 0) >= 3);
  assert.equal(audit?.frames[0].edges.length, 3);
  assert.deepEqual(frameDirectionAnswers(audit!, 0).map((answer) => answer.mode), [
    "solid-conduction", "fluid-convection", "radiation",
  ]);
});

test("frames are revealed only in order after an observation", () => {
  assert.equal(canRevealNextFrame(0, 0, 5), false);
  assert.equal(canRevealNextFrame(0, 1, 5), true);
  assert.equal(revealNextFrame(0, 1, 5), 1);
  assert.equal(revealNextFrame(4, 1, 5), 4);
});

test("final direction accepts only the catalog direction and records whether it was revised", () => {
  const contact = scenarios[0];
  assert.equal(isAcceptedFinalDirection(contact, "a-to-b"), false);
  assert.equal(isAcceptedFinalDirection(contact, "none"), true);
  assert.equal(revisionStatus("a-to-b", "none"), "수정함");
  assert.equal(revisionStatus("left-to-right", "left-to-right"), "유지함");
});

test("chart range is fixed from every frame, not the currently revealed frame", () => {
  const source = scenarios.find((scenario) => scenario.id === "source-switch");
  assert.deepEqual(getChartDomain(source!), { min: 10, max: 70 });
});

test("final-audit directions and modes are derived from its revealed frame edges", () => {
  const audit = scenarios.find((scenario) => scenario.id === "final-audit")!;
  const firstAnswers = frameDirectionAnswers(audit, 0);
  assert.deepEqual(firstAnswers.map((answer) => answer.direction), [
    "solid-hot-to-solid-cool", "liquid-bottom-to-liquid-top", "lamp-to-target",
  ]);
  assert.equal(areAcceptedFrameDirections(audit, 0, Object.fromEntries(firstAnswers.map((answer) => [answer.id, answer.direction]))), true);
  assert.equal(areAcceptedFrameDirections(audit, 0, { [firstAnswers[0].id]: "none" }), false);
});
