import { describe, expect, it } from "vitest";

import {
  adaptPulmuRunContext,
  COMPLETED_RUN_CONTEXT_FIXTURE,
  FAILED_RUN_CONTEXT_FIXTURE,
  getPulmuActor,
  PULMU_AGENT_ROUTING_FIXTURES,
  PULMU_AGENTS,
  PULMU_FORGE_MODES,
  PULMU_EXAMPLE_RUN_FIXTURES,
  PULMU_EXAMPLE_RUN_HISTORY,
  PULMU_PATTERN_PASS,
  PULMU_RETRY_POLICIES,
  PULMU_RUN_CONTEXT_FIXTURES,
  PULMU_STAGE_IDS,
  PULMU_STAGES,
  RETRY_RUN_CONTEXT_FIXTURE,
  RUNNING_RUN_CONTEXT_FIXTURE,
} from ".";
import type { PulmuAgentRoutingFixture, PulmuAgentRoutingGroup } from ".";

describe("Pulmu product contract", () => {
  it("keeps the canonical seven stages in exact order", () => {
    expect(PULMU_STAGE_IDS).toEqual([
      "ignite",
      "inspect",
      "shape",
      "hammer",
      "quench",
      "hone",
      "ship",
    ]);
    expect(PULMU_STAGES.map(({ step }) => step)).toEqual([
      "🔥 Ignite — Prepare",
      "🔎 Inspect — Explore",
      "📐 Shape — Design",
      "🔨 Hammer — Implement",
      "🌊 Quench — Verify",
      "🪨 Hone — Review",
      "📦 Ship — Deliver",
    ]);
  });

  it("models Pattern below Shape rather than as an eighth stage", () => {
    expect(PULMU_PATTERN_PASS).toMatchObject({ parentStageId: "shape", topLevel: false });
    expect(PULMU_STAGE_IDS).not.toContain("pattern");
  });

  it("changes Forge depth without changing the stage vocabulary", () => {
    expect(Object.values(PULMU_FORGE_MODES).map(({ depth }) => depth)).toEqual([1, 2, 3]);
    for (const mode of Object.values(PULMU_FORGE_MODES)) {
      expect(mode.stageIds).toEqual(PULMU_STAGE_IDS);
      expect(mode.stageIds).toHaveLength(7);
    }
  });

  it("has one source-and-test writer and read-only supporting agents", () => {
    expect(PULMU_AGENTS.filter(({ access }) => access === "write").map(({ name }) => name)).toEqual([
      "pulmu_smith",
    ]);
  });

  it("derives authority and roles from the canonical actor registry", () => {
    expect(getPulmuActor("orchestrator")).toMatchObject({ access: "workflow-control" });
    expect(getPulmuActor("pulmu_smith")).toMatchObject({ access: "write", stage: "hammer" });
    expect(getPulmuActor("pulmu_designer")).toMatchObject({ access: "read-only", stage: "pattern" });
  });

  it.each(Object.entries(PULMU_AGENT_ROUTING_FIXTURES))(
    "keeps the %s routing fixture to one Smith writer and read-only parallel groups",
    (_mode, fixture) => {
      expect(fixture.forge).toBe(_mode);
      expect(fixture.groups.flatMap(({ agents }) => agents).filter((name) => name === "pulmu_smith")).toHaveLength(1);
      for (const group of fixture.groups.filter(({ parallel }) => parallel)) {
        expect(group.agents.every((name) => getPulmuActor(name).access === "read-only")).toBe(true);
      }
    },
  );

  it("keeps Pattern nested in Shape and conditional reviewer routing explicit", () => {
    const patternGroups: PulmuAgentRoutingGroup[] = [];
    for (const [mode, fixture] of Object.entries(PULMU_AGENT_ROUTING_FIXTURES) as [string, PulmuAgentRoutingFixture][]) {
      const modePatternGroups = fixture.groups.filter(({ condition }) => condition === "pattern");
      expect(modePatternGroups, `${mode} Pattern assignments`).toHaveLength(1);
      patternGroups.push(...modePatternGroups);
    }
    expect(patternGroups).toHaveLength(3);
    expect(patternGroups.every(({ parentPass, stageId }) => parentPass === "pattern" && stageId === "shape")).toBe(true);
    expect(patternGroups.flatMap(({ agents }) => agents)).toEqual([
      "pulmu_designer", "pulmu_designer", "pulmu_designer",
    ]);

    const fullConditions = PULMU_AGENT_ROUTING_FIXTURES.full.groups.map(({ condition }) => condition);
    expect(fullConditions).toEqual(expect.arrayContaining(["failure", "security", "compatibility", "design"]));
    expect(PULMU_AGENT_ROUTING_FIXTURES.standard.groups.find(({ id }) => id === "standard-hone")?.agents)
      .toEqual(["pulmu_reviewer", "pulmu_test_reviewer"]);
  });

  it("defines bounded Quench and Hone retry paths", () => {
    expect(PULMU_RETRY_POLICIES.quench).toEqual({
      maxRetries: 3,
      path: ["quench", "hammer", "quench"],
    });
    expect(PULMU_RETRY_POLICIES.hone).toEqual({
      maxRetries: 2,
      path: ["hone", "hammer", "quench", "hone"],
    });
  });
});

describe("adaptPulmuRunContext", () => {
  it.each([
    ["running", "running", "hammer", "pending"],
    ["retry", "running", "hammer", "pending"],
    ["completed", "completed", "ship", "completed"],
    ["failed", "failed", "quench", "not_delivered"],
    ["interrupted", "interrupted", "hammer", "not_delivered"],
  ] as const)(
    "adapts the anonymized %s fixture",
    (fixtureName, expectedStatus, expectedStage, expectedDeliveryStatus) => {
      const view = adaptPulmuRunContext(PULMU_RUN_CONTEXT_FIXTURES[fixtureName]);

      expect(view.status).toBe(expectedStatus);
      expect(view.currentStage.id).toBe(expectedStage);
      expect(view.delivery.status).toBe(expectedDeliveryStatus);
      expect(view.timeline).toHaveLength(7);
    },
  );

  it("keeps retry as running state and exposes its counters", () => {
    const view = adaptPulmuRunContext(RETRY_RUN_CONTEXT_FIXTURE);

    expect(view.status).toBe("running");
    expect(view.currentStage).toEqual({ id: "hammer", status: "in_progress" });
    expect(view.retries).toEqual({ quench: 1, hone: 0 });
    expect(view.delivery).toEqual({ kind: "unknown", status: "pending" });
  });

  it("keeps Hone refinement on the running lifecycle", () => {
    const raw = structuredClone(RETRY_RUN_CONTEXT_FIXTURE) as Record<string, unknown>;
    raw.retries = { quench: 1, hone: 1 };
    const view = adaptPulmuRunContext(raw);

    expect(view.status).toBe("running");
    expect(view.currentStage).toEqual({ id: "hammer", status: "in_progress" });
    expect(view.retries).toEqual({ quench: 1, hone: 1 });
  });

  it("derives GitHub and local completion without exposing a PR URL", () => {
    const github = adaptPulmuRunContext(COMPLETED_RUN_CONTEXT_FIXTURE);
    const localRaw = structuredClone(COMPLETED_RUN_CONTEXT_FIXTURE) as Record<string, unknown>;
    localRaw.pr = null;
    const local = adaptPulmuRunContext(localRaw);

    expect(github.delivery).toEqual({ kind: "github", status: "completed" });
    expect(local.delivery).toEqual({ kind: "local", status: "completed" });
    expect(JSON.stringify(github)).not.toContain("forge.example.invalid");
  });

  it("marks failed and interrupted runs as not delivered", () => {
    expect(adaptPulmuRunContext(PULMU_RUN_CONTEXT_FIXTURES.failed).delivery).toEqual({
      kind: "none",
      status: "not_delivered",
    });
    expect(adaptPulmuRunContext(PULMU_RUN_CONTEXT_FIXTURES.interrupted).delivery).toEqual({
      kind: "none",
      status: "not_delivered",
    });
  });

  it("derives the ordered stage timeline", () => {
    expect(adaptPulmuRunContext(RUNNING_RUN_CONTEXT_FIXTURE).timeline.map(({ status }) => status)).toEqual([
      "completed",
      "completed",
      "completed",
      "in_progress",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it.each([
    ["schema", { schemaVersion: 2 }],
    ["Pulmu version", { pulmuVersion: "" }],
    ["run ID", { runId: "example-run" }],
    ["task prompt", { task: { type: "feature" } }],
    ["Git base branch", { git: { branch: "example", commit: null } }],
    ["Git branch", { git: { baseBranch: "main", commit: null } }],
    ["Git commit", { git: { baseBranch: "main", branch: "example", commit: 123 } }],
    ["run status", { status: "retrying" }],
    ["stage", { stage: { current: "pattern", status: "in_progress" } }],
    ["retry count", { retries: { quench: 4, hone: 0 } }],
    ["PR", { pr: { number: 1 } }],
    ["error", { error: { code: "BROKEN" } }],
    ["terminal state", { completedAt: "2026-01-01T00:05:00.000000Z" }],
  ])("rejects invalid %s input", (_name, override) => {
    expect(() => adaptPulmuRunContext({ ...RUNNING_RUN_CONTEXT_FIXTURE, ...override })).toThrow();
  });

  it("copies only allowlisted UI fields", () => {
    const sentinel = "SENSITIVE_SENTINEL_DO_NOT_COPY";
    const raw = structuredClone(RUNNING_RUN_CONTEXT_FIXTURE) as Record<string, unknown>;
    raw.task = { prompt: sentinel, type: "feature" };
    raw.git = { baseBranch: sentinel, branch: sentinel, commit: null };
    raw.unknownSecret = sentinel;
    raw.logs = [sentinel];
    raw.environment = { TOKEN: sentinel };
    raw.modelResponse = sentinel;

    expect(JSON.stringify(adaptPulmuRunContext(raw))).not.toContain(sentinel);
  });

  it("omits valid raw error messages and PR URLs", () => {
    const sentinel = "SENSITIVE_SENTINEL_DO_NOT_COPY";
    const failedRaw = structuredClone(FAILED_RUN_CONTEXT_FIXTURE) as Record<string, unknown>;
    failedRaw.error = { code: "VERIFY_FAILED", message: sentinel };

    const completedRaw = structuredClone(COMPLETED_RUN_CONTEXT_FIXTURE) as Record<string, unknown>;
    completedRaw.pr = {
      number: 17,
      url: `https://forge.example.invalid/${sentinel}/example-repo/pull/17`,
    };

    expect(JSON.stringify(adaptPulmuRunContext(failedRaw))).not.toContain(sentinel);
    expect(JSON.stringify(adaptPulmuRunContext(completedRaw))).not.toContain(sentinel);
  });
});

describe("Pulmu example-screen fixtures", () => {
  it("publishes adapter-derived fixtures for every run screen and history state", () => {
    expect(Object.keys(PULMU_EXAMPLE_RUN_FIXTURES)).toEqual([
      "active",
      "quenchRetry",
      "honeFinding",
      "completedLocal",
      "completedGithub",
      "failed",
      "interrupted",
    ]);
    expect(PULMU_EXAMPLE_RUN_HISTORY).toHaveLength(7);
    expect(PULMU_EXAMPLE_RUN_HISTORY.every(({ run }) => run.schemaVersion === 1)).toBe(true);
  });

  it("keeps delivery, terminal state, and retry scenarios distinct", () => {
    expect(PULMU_EXAMPLE_RUN_FIXTURES.quenchRetry.run.retries).toEqual({ quench: 2, hone: 0 });
    expect(PULMU_EXAMPLE_RUN_FIXTURES.honeFinding.run.retries).toEqual({ quench: 0, hone: 1 });
    expect(PULMU_EXAMPLE_RUN_FIXTURES.completedLocal.run.delivery).toEqual({
      kind: "local",
      status: "completed",
    });
    expect(PULMU_EXAMPLE_RUN_FIXTURES.completedGithub.run.delivery).toEqual({
      kind: "github",
      status: "completed",
    });
    expect(PULMU_EXAMPLE_RUN_FIXTURES.failed.run.status).toBe("failed");
    expect(PULMU_EXAMPLE_RUN_FIXTURES.interrupted.run.status).toBe("interrupted");
  });

  it("does not expose raw Run Context fields to the screen fixtures", () => {
    const serialized = JSON.stringify(PULMU_EXAMPLE_RUN_FIXTURES);

    expect(serialized).not.toContain("Synthetic example task");
    expect(serialized).not.toContain("pulmu/feat/synthetic-example");
    expect(serialized).not.toContain("forge.example.invalid");
    expect(serialized).not.toContain("abc1234");
  });
});
