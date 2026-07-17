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
});

test("frames are revealed only in order after an observation", () => {
  assert.equal(canRevealNextFrame(0, 0, 5), false);
  assert.equal(canRevealNextFrame(0, 1, 5), true);
  assert.equal(revealNextFrame(0, 1, 5), 1);
  assert.equal(revealNextFrame(4, 1, 5), 4);
});
