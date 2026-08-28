const baseFixture = {
  schemaVersion: 1,
  workflow: "pulmu",
  pulmuVersion: "0.2.0",
  task: { prompt: "Synthetic example task", type: "feature" },
  forge: "standard",
  risk: "medium",
  areas: ["frontend", "design"],
  pattern: true,
  git: {
    baseBranch: "main",
    branch: "pulmu/feat/synthetic-example",
    commit: null,
  },
  agents: { active: [] as string[] },
  retries: { quench: 0, hone: 0 },
  startedAt: "2026-01-01T00:00:00.000000Z",
  updatedAt: "2026-01-01T00:05:00.000000Z",
  completedAt: null,
  interruptedAt: null,
  pr: null,
  error: null,
} as const;

export const RUNNING_RUN_CONTEXT_FIXTURE = {
  ...baseFixture,
  runId: "20260101T000000Z-a1b2c3d4e5f6",
  status: "running",
  stage: { current: "hammer", status: "in_progress" },
  agents: { active: ["pulmu_smith"] },
} as const;

export const RETRY_RUN_CONTEXT_FIXTURE = {
  ...baseFixture,
  runId: "20260101T010000Z-b2c3d4e5f6a1",
  status: "running",
  stage: { current: "hammer", status: "in_progress" },
  retries: { quench: 1, hone: 0 },
  agents: { active: ["pulmu_smith"] },
} as const;

export const COMPLETED_RUN_CONTEXT_FIXTURE = {
  ...baseFixture,
  runId: "20260101T020000Z-c3d4e5f6a1b2",
  status: "completed",
  stage: { current: "ship", status: "completed" },
  git: { ...baseFixture.git, commit: "abc1234" },
  updatedAt: "2026-01-01T02:10:00.000000Z",
  completedAt: "2026-01-01T02:10:00.000000Z",
  pr: {
    number: 17,
    url: "https://forge.example.invalid/example-org/example-repo/pull/17",
  },
} as const;

export const FAILED_RUN_CONTEXT_FIXTURE = {
  ...baseFixture,
  runId: "20260101T030000Z-d4e5f6a1b2c3",
  status: "failed",
  stage: { current: "quench", status: "failed" },
  updatedAt: "2026-01-01T03:10:00.000000Z",
  error: { code: "VERIFY_FAILED", message: "Synthetic verification failure" },
} as const;

export const INTERRUPTED_RUN_CONTEXT_FIXTURE = {
  ...baseFixture,
  runId: "20260101T040000Z-e5f6a1b2c3d4",
  status: "interrupted",
  stage: { current: "hammer", status: "interrupted" },
  updatedAt: "2026-01-01T04:10:00.000000Z",
  interruptedAt: "2026-01-01T04:10:00.000000Z",
  error: { code: "INTERRUPTED", message: "Synthetic interruption" },
} as const;

export const PULMU_RUN_CONTEXT_FIXTURES = {
  running: RUNNING_RUN_CONTEXT_FIXTURE,
  retry: RETRY_RUN_CONTEXT_FIXTURE,
  completed: COMPLETED_RUN_CONTEXT_FIXTURE,
  failed: FAILED_RUN_CONTEXT_FIXTURE,
  interrupted: INTERRUPTED_RUN_CONTEXT_FIXTURE,
} as const;
