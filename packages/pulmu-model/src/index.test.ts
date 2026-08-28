import { describe, expect, it } from "vitest";

import {
  adaptPulmuRunContext,
  COMPLETED_RUN_CONTEXT_FIXTURE,
  FAILED_RUN_CONTEXT_FIXTURE,
  PULMU_AGENTS,
  PULMU_FORGE_MODES,
  PULMU_PATTERN_PASS,
  PULMU_RETRY_POLICIES,
  PULMU_RUN_CONTEXT_FIXTURES,
  PULMU_STAGE_IDS,
  PULMU_STAGES,
  RETRY_RUN_CONTEXT_FIXTURE,
  RUNNING_RUN_CONTEXT_FIXTURE,
} from ".";

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
