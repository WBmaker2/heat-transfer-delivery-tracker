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
  areAcceptedFrameModes,
  areExactlyRequiredEvidenceSelected,
  frameComparisonStatus,
  frameDirectionAnswers,
} from "../src/domain/learningRecord.ts";
import { observationCheckLabel, observationPrompt } from "../src/domain/observationPrompt.ts";
import { directionParticle } from "../src/domain/koreanParticles.ts";
import { transferModeConcept } from "../src/domain/types.ts";
import { getChartDomain } from "../src/visualization/chartDomain.ts";

test("higher temperature points toward lower temperature and equal temperatures have no direction", () => {
  assert.equal(judgeNetDirection("a", 60, "b", 20), "a-to-b");
  assert.equal(judgeNetDirection("a", 20, "b", 60), "b-to-a");
  assert.equal(judgeNetDirection("a", 40, "b", 40), "none");
});

test("direction particles use 로 after a vowel, ㄹ, and non-Korean labels", () => {
  assert.equal(directionParticle("열원"), "으로");
  assert.equal(directionParticle("주변"), "으로");
  assert.equal(directionParticle("끝"), "으로");
  assert.equal(directionParticle("물체"), "로");
  assert.equal(directionParticle("길"), "로");
  assert.equal(directionParticle("A"), "로");
  assert.equal(directionParticle("B"), "로");
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

test("frame comparison uses catalog directions and describes changed routes without guessing a cause", () => {
  const contact = scenarios[0];
  assert.equal(areAcceptedFrameDirections(contact, contact.frames.length - 1, { "a-to-b": "a-to-b" }), false);
  assert.equal(areAcceptedFrameDirections(contact, contact.frames.length - 1, { "a-to-b": "none" }), true);
  assert.equal(frameComparisonStatus("a-to-b", "none", "a-to-b", "a-to-b"), "시간이 지나 열 이동 방향이 바뀜");
  assert.equal(frameComparisonStatus("left-to-right", "left-to-right", "path", "path"), "예측 시점과 마지막 방향이 같음");
  const source = scenarios.find((scenario) => scenario.id === "source-switch")!;
  const solid = scenarios.find((scenario) => scenario.id === "solid-bridge")!;
  assert.equal(frameComparisonStatus(frameDirectionAnswers(source, 1)[0].direction, frameDirectionAnswers(source, 5)[0].direction, frameDirectionAnswers(source, 1)[0].id, frameDirectionAnswers(source, 5)[0].id), "살펴보는 열 이동 경로가 바뀜");
  assert.equal(frameComparisonStatus(frameDirectionAnswers(solid, 1)[0].direction, frameDirectionAnswers(solid, 3)[0].direction, frameDirectionAnswers(solid, 1)[0].id, frameDirectionAnswers(solid, 3)[0].id), "살펴보는 열 이동 경로가 바뀜");
});

test("starting observation prompts match each scenario's first-frame arrows", () => {
  const expectedPrompts = {
    "contact-lockers": "온도 숫자를 먼저 비교해요. 그다음 화살표를 찾아요.",
    "source-switch": "같은 온도를 찾아요. 한쪽 화살표가 없는지 확인해요.",
    "solid-bridge": "같은 온도를 찾아요. 한쪽 화살표가 없는지 확인해요.",
    "liquid-cycle": "같은 온도를 찾아요. 한쪽 화살표가 없는지 확인해요.",
    "final-audit": "온도 숫자를 먼저 비교해요. 그다음 화살표를 찾아요.",
  } as const;
  for (const scenario of scenarios) assert.equal(observationPrompt(scenario, 0), expectedPrompts[scenario.id as keyof typeof expectedPrompts]);
  assert.equal(observationPrompt(scenarios[0], 1), "전 단계와 온도를 비교해요. 올라감·내려감·그대로 중 하나를 찾아요.");
  assert.equal(observationCheckLabel(0), "온도 변화와 화살표를 확인했어요.");
});

test("evidence selection accepts only the exact required cards", () => {
  const contact = scenarios[0];
  assert.equal(areExactlyRequiredEvidenceSelected(contact, ["temperature-gap"]), false);
  assert.equal(areExactlyRequiredEvidenceSelected(contact, ["temperature-gap", "fluid"]), false);
  assert.equal(areExactlyRequiredEvidenceSelected(contact, ["temperature-gap", "contact"]), true);
});

test("both contact and solid conduction use one student-facing conduction choice", () => {
  const contact = scenarios.find((scenario) => scenario.id === "contact-lockers")!;
  const solid = scenarios.find((scenario) => scenario.id === "solid-bridge")!;
  assert.equal(transferModeConcept("contact-conduction"), "conduction");
  assert.equal(transferModeConcept("solid-conduction"), "conduction");
  for (const scenario of [contact, solid]) {
    const finalIndex = scenario.frames.length - 1;
    const answer = frameDirectionAnswers(scenario, finalIndex)[0];
    assert.equal(areAcceptedFrameModes(scenario, finalIndex, { [answer.id]: "conduction" }), true);
    assert.equal(areAcceptedFrameModes(scenario, finalIndex, { [answer.id]: answer.mode }), false);
  }
});

test("content validation catches endpoints, temperature bounds, source completeness, evidence, modes, and closed-model invariants", () => {
  const broken = structuredClone(scenarios);
  broken[0].frames[0].temperaturesC.a = 81;
  broken[0].frames[0].edges[0].toId = "missing";
  broken[0].requiredEvidenceIds = ["missing-evidence"];
  broken[0].primaryModes = [];
  broken[0].limitationText = "";
  const source = broken.find((scenario) => scenario.id === "source-switch")!;
  delete source.frames[0].sourceState;
  assert.match(validateScenarioCatalog(broken).join("\n"), /온도 범위|연결한 물체|열원 상태|근거|방식|제한 문구/);
  const closed = structuredClone(scenarios);
  closed[0].frames[1].temperaturesC.a = 51;
  assert.match(validateScenarioCatalog(closed).join("\n"), /온도 합/);
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
