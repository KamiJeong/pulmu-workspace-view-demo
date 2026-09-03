import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  adaptPulmuRunContext,
  COMPLETED_RUN_CONTEXT_FIXTURE,
  FAILED_RUN_CONTEXT_FIXTURE,
  INTERRUPTED_RUN_CONTEXT_FIXTURE,
  RETRY_RUN_CONTEXT_FIXTURE,
  RUNNING_RUN_CONTEXT_FIXTURE,
  type PulmuRunViewModel,
} from "@pulmu/model";
import {
  ActiveStagePanel,
  DeliverySummary,
  FailureInterruptedNotice,
  ForgeRiskBadge,
  ForgeStageRail,
  RetryLoop,
  ReviewFinding,
  RunLifecycleStatus,
  TaskMetadata,
  VerificationSummary,
} from "@pulmu/ui";
import type { ReviewResult, VerificationResult } from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./ForgeComponents.css";

const meta = {
  title: "07 Forge Components/Forge Status",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const adapt = (fixture: object, override: Record<string, unknown> = {}) =>
  adaptPulmuRunContext({ ...structuredClone(fixture), ...override });

const running = adapt(RUNNING_RUN_CONTEXT_FIXTURE);
const completedGithub = adapt(COMPLETED_RUN_CONTEXT_FIXTURE);
const completedLocal = adapt(COMPLETED_RUN_CONTEXT_FIXTURE, { pr: null });
const failed = adapt(FAILED_RUN_CONTEXT_FIXTURE);
const interrupted = adapt(INTERRUPTED_RUN_CONTEXT_FIXTURE);
const patternDisabled = adapt(RUNNING_RUN_CONTEXT_FIXTURE, { areas: ["frontend"], pattern: false });
const provisional = adapt(RUNNING_RUN_CONTEXT_FIXTURE, {
  forge: null,
  risk: null,
  areas: [],
  pattern: false,
  stage: { current: "ignite", status: "in_progress" },
  agents: { active: [] },
});
const honeRetry = adapt(RETRY_RUN_CONTEXT_FIXTURE, { retries: { quench: 1, hone: 1 } });

function ForgeRunSurface({
  activity,
  children,
  findings = [],
  run,
  terminal,
  verification,
}: {
  readonly activity: string;
  readonly children?: ReactNode;
  readonly findings?: readonly ReviewResult[];
  readonly run: PulmuRunViewModel;
  readonly terminal?: boolean;
  readonly verification?: VerificationResult;
}) {
  return (
    <main className="forge-demo">
      <header className="forge-demo__header">
        <div className="forge-demo__heading"><h1>Pulmu forge run</h1><RunLifecycleStatus status={run.status} /></div>
        <div className="forge-demo__metadata">
          <ForgeRiskBadge forge={run.forge} risk={run.risk} />
          <TaskMetadata areas={run.areas} taskType={run.taskType} />
        </div>
      </header>
      <ForgeStageRail patternDetail="Hierarchy, responsive behavior, and accessibility defined" run={run} />
      <ActiveStagePanel activity={activity} run={run}>{children}</ActiveStagePanel>
      <section aria-label="Run results" className="forge-demo__results">
        {verification ? <VerificationSummary result={verification} /> : null}
        {findings.map((finding, index) => <ReviewFinding key={finding.status === "pass" ? "pass" : `${finding.title}-${index}`} result={finding} />)}
      </section>
      {terminal && (run.status === "failed" || run.status === "interrupted") ? (
        <FailureInterruptedNotice failureCode={run.failureCode} stageId={run.currentStage.id} status={run.status} />
      ) : <DeliverySummary delivery={run.delivery} />}
    </main>
  );
}

const assertCanonicalRail = async (canvasElement: HTMLElement, pattern = true) => {
  const canvas = within(canvasElement);
  const stages = [...canvasElement.querySelectorAll<HTMLElement>("[data-stage-id]")];
  await expect(stages).toHaveLength(7);
  await expect(stages.map((stage) => stage.dataset.stageId)).toEqual([
    "ignite", "inspect", "shape", "hammer", "quench", "hone", "ship",
  ]);
  await expect(canvasElement.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  await expect(canvas.getByText(/Full forge flow:/)).toBeInTheDocument();
  const patternNode = canvas.queryByText("Pattern");
  if (pattern) {
    await expect(patternNode).toBeInTheDocument();
    await expect(patternNode!.closest("[data-stage-id]")).toHaveAttribute("data-stage-id", "shape");
  } else {
    await expect(patternNode).not.toBeInTheDocument();
  }
  await expect(canvasElement.querySelectorAll("button, a, [tabindex]")).toHaveLength(0);
};

export const RunningHammer: Story = {
  render: () => <ForgeRunSurface activity="Implementing code and tests" run={running} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertCanonicalRail(canvasElement);
    await expect(canvas.getByText("Run status")).toBeInTheDocument();
    await expect(canvas.getByText("Stage status")).toBeInTheDocument();
    await expect(canvas.getByText("Running")).toBeInTheDocument();
    await expect(canvas.getAllByText("In progress")).toHaveLength(2);
  },
};

export const PatternDisabled: Story = {
  render: () => <ForgeRunSurface activity="Implementing a frontend change without a Pattern pass" run={patternDisabled} />,
  play: async ({ canvasElement }) => assertCanonicalRail(canvasElement, false),
};

export const Completed: Story = {
  render: () => <ForgeRunSurface activity="Delivery completed" run={completedGithub} verification={{ status: "pass", checks: ["Lint", "Typecheck", "Tests", "Storybook build"] }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertCanonicalRail(canvasElement);
    await expect(canvas.getByText("GitHub pull request")).toBeInTheDocument();
    await expect(canvas.getByText("Verification PASS")).toBeInTheDocument();
  },
};

export const FailedQuench: Story = {
  render: () => <ForgeRunSurface activity="Verification stopped after the bounded retry policy" run={failed} terminal verification={{ status: "failed", summary: "A focused project check did not pass.", checks: ["Typecheck failed"] }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertCanonicalRail(canvasElement);
    await expect(canvas.getByText("Run failed").closest('[role="alert"]')).toBeInTheDocument();
    await expect(canvas.getByText("Verification failed").closest('[role="alert"]')).toBeInTheDocument();
  },
};

export const InterruptedHammer: Story = {
  render: () => <ForgeRunSurface activity="Work stopped before implementation completed" run={interrupted} terminal />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertCanonicalRail(canvasElement);
    const notice = canvas.getByText("Run interrupted").closest('[role="status"]');
    await expect(notice).toBeInTheDocument();
    await expect(notice).not.toHaveAttribute("role", "alert");
  },
};

export const ProvisionalMetadata: Story = {
  render: () => <ForgeRunSurface activity="Validating repository and delivery access" run={provisional} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertCanonicalRail(canvasElement, false);
    await expect(canvas.getAllByText("Provisional")).toHaveLength(2);
    await expect(canvas.getByText("Not finalized")).toBeInTheDocument();
  },
};

export const QuenchRetry: Story = {
  render: () => <ForgeRunSurface activity="Applying the diagnosed verification fix" run={adapt(RETRY_RUN_CONTEXT_FIXTURE)} verification={{ status: "failed", summary: "The previous verification attempt did not pass.", checks: ["Typecheck failed"] }}><RetryLoop count={1} kind="quench" /></ForgeRunSurface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertCanonicalRail(canvasElement);
    await expect(canvas.getByText("Quench → Hammer → Quench")).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll("[data-stage-id]")).toHaveLength(7);
  },
};

export const HoneRefinement: Story = {
  render: () => <ForgeRunSurface activity="Resolving the consolidated blocking review finding" findings={[{ status: "finding", title: "Missing state coverage", severity: "high", description: "Add the interrupted state before delivery." }]} run={honeRetry}><RetryLoop count={1} kind="hone" /></ForgeRunSurface>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertCanonicalRail(canvasElement);
    await expect(canvas.getByText("Hone → Hammer → Quench → Hone")).toBeInTheDocument();
    await expect(canvas.getByText(/high severity · Blocking/i)).toBeInTheDocument();
  },
};

export const VerificationStates: Story = {
  render: () => <div className="forge-demo__results"><VerificationSummary result={{ status: "pass", checks: ["Lint", "Tests"] }} /><VerificationSummary result={{ status: "failed", summary: "The component contract check did not pass.", checks: ["Contract test failed"] }} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Verification PASS").closest('[role="status"]')).toBeInTheDocument();
    await expect(canvas.getByText("Verification failed").closest('[role="alert"]')).toBeInTheDocument();
  },
};

export const ReviewStates: Story = {
  render: () => <div className="forge-demo__results"><ReviewFinding result={{ status: "pass" }} /><ReviewFinding result={{ status: "finding", description: "Consider a shorter supporting label.", severity: "low", title: "Copy can be tightened" }} /><ReviewFinding result={{ status: "finding", description: "The retry state needs an accessible text alternative.", severity: "medium", title: "Retry meaning is inaccessible" }} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Review PASS").closest('[role="status"]')).toBeInTheDocument();
    await expect(canvas.getByText(/low severity · Non-blocking/i)).toBeInTheDocument();
    await expect(canvas.getByText(/medium severity · Blocking/i)).toBeInTheDocument();
  },
};

export const DeliveryStates: Story = {
  render: () => <div className="forge-demo__results"><DeliverySummary delivery={completedLocal.delivery} /><DeliverySummary delivery={completedGithub.delivery} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Local commit")).toBeInTheDocument();
    await expect(canvas.getByText("GitHub pull request")).toBeInTheDocument();
    await expect(canvasElement).not.toHaveTextContent(/https?:\/\//);
  },
};

export const NarrowLongContent: Story = {
  globals: { viewport: { isRotated: false, value: "mobile" } },
  render: () => <ForgeRunSurface activity="Implementing a deliberately long localized status message that must wrap without clipping, truncation, horizontal scrolling, or reordering the forge stages" run={running} />,
  play: async ({ canvasElement }) => {
    await assertCanonicalRail(canvasElement);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  },
};

export const BoundaryWidthRail: Story = {
  globals: { viewport: { isRotated: false, value: "forge-boundary" } },
  parameters: {
    viewport: {
      options: {
        "forge-boundary": {
          name: "Forge boundary (900px)",
          styles: { height: "900px", width: "900px" },
          type: "tablet",
        },
      },
    },
  },
  render: () => <ForgeRunSurface activity="Checking legible stage labels and Pattern content near the horizontal rail boundary" run={running} />,
  play: async ({ canvasElement }) => {
    await assertCanonicalRail(canvasElement);
    const stages = [...canvasElement.querySelectorAll<HTMLElement>("[data-stage-id]")];
    const leftEdges = new Set(stages.map((stage) => Math.round(stage.getBoundingClientRect().left)));
    await expect(leftEdges.size).toBe(1);
    await expect(stages.every((stage) => stage.getBoundingClientRect().width >= 500)).toBe(true);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
