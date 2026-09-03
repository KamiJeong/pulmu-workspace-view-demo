import { adaptPulmuRunContext } from "./adapter";
import type { PulmuRunViewModel } from "./contract";
import {
  COMPLETED_RUN_CONTEXT_FIXTURE,
  FAILED_RUN_CONTEXT_FIXTURE,
  INTERRUPTED_RUN_CONTEXT_FIXTURE,
  RETRY_RUN_CONTEXT_FIXTURE,
  RUNNING_RUN_CONTEXT_FIXTURE,
} from "./fixtures";

export type PulmuExampleRunFixture = {
  readonly activity: string;
  readonly id: string;
  readonly summary: string;
  readonly title: string;
  readonly run: PulmuRunViewModel;
};

const quenchRetryContext = {
  ...RETRY_RUN_CONTEXT_FIXTURE,
  runId: "20260101T050000Z-f6a1b2c3d4e5",
  retries: { quench: 2, hone: 0 },
  startedAt: "2026-01-01T05:00:00.000000Z",
  updatedAt: "2026-01-01T05:08:00.000000Z",
} as const;

const honeFindingContext = {
  ...RETRY_RUN_CONTEXT_FIXTURE,
  runId: "20260101T060000Z-a2b3c4d5e6f7",
  retries: { quench: 0, hone: 1 },
  startedAt: "2026-01-01T06:00:00.000000Z",
  updatedAt: "2026-01-01T06:12:00.000000Z",
} as const;

const completedLocalContext = {
  ...COMPLETED_RUN_CONTEXT_FIXTURE,
  runId: "20260101T070000Z-b3c4d5e6f7a8",
  git: { ...COMPLETED_RUN_CONTEXT_FIXTURE.git, commit: "def5678" },
  startedAt: "2026-01-01T07:00:00.000000Z",
  updatedAt: "2026-01-01T07:09:00.000000Z",
  completedAt: "2026-01-01T07:09:00.000000Z",
  pr: null,
} as const;

const createFixture = (
  id: string,
  title: string,
  summary: string,
  activity: string,
  raw: unknown,
): PulmuExampleRunFixture => ({
  activity,
  id,
  run: adaptPulmuRunContext(raw),
  summary,
  title,
});

/**
 * Storybook-ready, anonymized fixtures. Every `run` has passed through the
 * Run Context adapter so example screens cannot reach prompts, branches,
 * messages, logs, environment values, commit hashes, or pull-request URLs.
 */
export const PULMU_EXAMPLE_RUN_FIXTURES = {
  active: createFixture(
    "RUN-024",
    "Active forge run",
    "A Standard forge is implementing the approved frontend slice.",
    "Implementing source and tests",
    RUNNING_RUN_CONTEXT_FIXTURE,
  ),
  quenchRetry: createFixture(
    "RUN-023",
    "Quench retry",
    "Verification returned the run to Hammer for a bounded correction.",
    "Applying the Quench diagnosis before verification runs again",
    quenchRetryContext,
  ),
  honeFinding: createFixture(
    "RUN-022",
    "Hone review finding",
    "A blocking review finding returned the run through Hammer and Quench.",
    "Resolving the consolidated Hone finding",
    honeFindingContext,
  ),
  completedLocal: createFixture(
    "RUN-021",
    "Completed local delivery",
    "The reviewed change finished as a local commit without a pull request.",
    "Local delivery completed",
    completedLocalContext,
  ),
  completedGithub: createFixture(
    "RUN-020",
    "Completed GitHub delivery",
    "The reviewed change finished with a local commit and GitHub pull request.",
    "GitHub delivery completed",
    COMPLETED_RUN_CONTEXT_FIXTURE,
  ),
  failed: createFixture(
    "RUN-019",
    "Failed run",
    "Quench exhausted safe verification attempts and blocked delivery.",
    "Verification stopped after the final allowed retry",
    FAILED_RUN_CONTEXT_FIXTURE,
  ),
  interrupted: createFixture(
    "RUN-018",
    "Interrupted run",
    "The session ended during Hammer without reporting a verification failure.",
    "Work stopped before implementation completed",
    INTERRUPTED_RUN_CONTEXT_FIXTURE,
  ),
} as const satisfies Record<string, PulmuExampleRunFixture>;

export const PULMU_EXAMPLE_RUN_HISTORY = [
  PULMU_EXAMPLE_RUN_FIXTURES.active,
  PULMU_EXAMPLE_RUN_FIXTURES.quenchRetry,
  PULMU_EXAMPLE_RUN_FIXTURES.honeFinding,
  PULMU_EXAMPLE_RUN_FIXTURES.completedLocal,
  PULMU_EXAMPLE_RUN_FIXTURES.completedGithub,
  PULMU_EXAMPLE_RUN_FIXTURES.failed,
  PULMU_EXAMPLE_RUN_FIXTURES.interrupted,
] as const satisfies readonly PulmuExampleRunFixture[];
