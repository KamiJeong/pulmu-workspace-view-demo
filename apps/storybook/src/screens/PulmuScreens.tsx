import { type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import {
  PULMU_EXAMPLE_RUN_HISTORY,
  type PulmuExampleRunFixture,
  type PulmuRunStatus,
} from "@pulmu/model";
import {
  ActiveStagePanel,
  AgentCard,
  AgentGroup,
  AppShell,
  Badge,
  Button,
  CollapsibleSidebar,
  ContentWithRail,
  DataState,
  DataTable,
  DeliverySummary,
  FailureInterruptedNotice,
  ForgeRiskBadge,
  ForgeStageRail,
  PageHeader,
  RetryLoop,
  ReviewFinding,
  RunLifecycleStatus,
  StateLayout,
  TaskMetadata,
  VerificationSummary,
} from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./PulmuScreens.css";

export type RunScreenKind =
  | "active"
  | "quench-retry"
  | "hone-finding"
  | "completed-local"
  | "completed-github"
  | "failed"
  | "interrupted";

export type RunDetailScreenProps = {
  readonly fixture: PulmuExampleRunFixture;
  readonly kind: RunScreenKind;
};

export type RunHistoryStatus = "ready" | "loading" | "stale";

export type RunHistoryScreenProps = {
  readonly onRefresh?: () => void;
  readonly status?: RunHistoryStatus;
};

export type EmptyWorkspaceScreenProps = {
  readonly onStartRun?: () => void;
};

const statusPresentation: Record<
  PulmuRunStatus,
  { readonly label: string; readonly tone: "info" | "success" | "danger" | "warning" }
> = {
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  interrupted: { label: "Interrupted", tone: "warning" },
  running: { label: "Running", tone: "info" },
};

function ProductHeader() {
  return (
    <div className="pulmu-screen__product">
      <span className="pulmu-screen__brand">🔥 Pulmu</span>
      <span className="pulmu-screen__workspace">workspace-view-demo</span>
    </div>
  );
}

function ScreenNavigation({ currentLabel, sectionHref, sectionLabel }: {
  readonly currentLabel: string;
  readonly sectionHref: `#${string}`;
  readonly sectionLabel: string;
}) {
  return (
    <CollapsibleSidebar
      collapseLabel="Collapse workspace navigation"
      expandLabel="Expand workspace navigation"
      label="Workspace navigation"
      mobileCloseLabel="Close workspace navigation"
      mobileTriggerLabel="Open workspace navigation"
    >
      <nav aria-label="Workspace">
        <ul>
          <li><a aria-current="page" href="#screen-main">{currentLabel}</a></li>
          <li><a href={sectionHref}>{sectionLabel}</a></li>
        </ul>
      </nav>
    </CollapsibleSidebar>
  );
}

function ScreenShell({ children, currentLabel, sectionHref, sectionLabel }: {
  readonly children: ReactNode;
  readonly currentLabel: string;
  readonly sectionHref: `#${string}`;
  readonly sectionLabel: string;
}) {
  const focusSkipTarget = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement) || !target.classList.contains("pulmu-skip-link")) return;
    event.preventDefault();
    target.ownerDocument.getElementById("screen-main")?.focus();
  };

  return (
    <AppShell
      className="pulmu-screen"
      data-testid="pulmu-screen-shell"
      header={<ProductHeader />}
      mainId="screen-main"
      onClick={focusSkipTarget}
      sidebar={(
        <ScreenNavigation
          currentLabel={currentLabel}
          sectionHref={sectionHref}
          sectionLabel={sectionLabel}
        />
      )}
      skipLinkLabel={`Skip to ${currentLabel.toLowerCase()}`}
    >
      {children}
    </AppShell>
  );
}

function AgentAuthorityPanel({ active }: { readonly active: boolean }) {
  return (
    <section aria-labelledby="agent-authority-heading" className="pulmu-screen__section">
      <h2 id="agent-authority-heading">Agent authority</h2>
      <div className="pulmu-screen__agent-grid">
        <AgentCard
          active={active}
          activity={active ? "Implementing source and tests" : "No write assignment in this terminal state"}
          name="pulmu_smith"
        />
        <AgentGroup
          activeAgents={[]}
          agentNames={["pulmu_reviewer", "pulmu_test_reviewer", "pulmu_design_reviewer"]}
          label="Independent read-only reviewers"
          parallel
        />
      </div>
    </section>
  );
}

function RunScenario({ fixture, kind }: RunDetailScreenProps) {
  const { run } = fixture;
  if (kind === "active") return <AgentAuthorityPanel active />;
  if (kind === "quench-retry") {
    return (
      <section aria-labelledby="retry-heading" className="pulmu-screen__section">
        <h2 id="retry-heading">Verification retry</h2>
        <div className="pulmu-screen__stack">
          <RetryLoop count={run.retries.quench} kind="quench" />
          <VerificationSummary result={{
            checks: ["Story interaction: one assertion failed", "Typecheck: passed"],
            status: "failed",
            summary: "The diagnosed interaction failure returned to the same Smith for correction.",
          }} />
          <AgentCard active activity="Applying the Quench diagnosis" name="pulmu_smith" />
        </div>
      </section>
    );
  }
  if (kind === "hone-finding") {
    return (
      <section aria-labelledby="finding-heading" className="pulmu-screen__section">
        <h2 id="finding-heading">Review refinement</h2>
        <div className="pulmu-screen__stack">
          <ReviewFinding result={{
            description: "Move focus to the drawer destination after compact navigation closes.",
            severity: "medium",
            status: "finding",
            title: "Compact navigation loses destination focus",
          }} />
          <RetryLoop count={run.retries.hone} kind="hone" />
          <AgentCard active activity="Resolving the consolidated review finding" name="pulmu_smith" />
        </div>
      </section>
    );
  }
  if (kind === "completed-local" || kind === "completed-github") {
    return (
      <section aria-labelledby="delivery-heading" className="pulmu-screen__section">
        <h2 id="delivery-heading">Reviewed delivery</h2>
        <div className="pulmu-screen__stack">
          <VerificationSummary result={{ checks: ["Lint", "Typecheck", "Story interactions", "Storybook build"], status: "pass" }} />
          <ReviewFinding result={{ status: "pass" }} />
          <DeliverySummary delivery={run.delivery} />
        </div>
      </section>
    );
  }
  if (kind === "failed") {
    return (
      <section aria-labelledby="failure-heading" className="pulmu-screen__section">
        <h2 id="failure-heading">Safe stop</h2>
        <div className="pulmu-screen__stack">
          <FailureInterruptedNotice
            failureCode={run.failureCode}
            stageId={run.currentStage.id}
            status="failed"
          />
          <VerificationSummary result={{
            checks: ["Story interaction: failed after retry 3 of 3"],
            status: "failed",
            summary: "Quench did not pass, so Ship did not create a delivery.",
          }} />
          <DeliverySummary delivery={run.delivery} />
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby="interrupted-heading" className="pulmu-screen__section">
      <h2 id="interrupted-heading">Session interruption</h2>
      <div className="pulmu-screen__stack">
        <FailureInterruptedNotice stageId={run.currentStage.id} status="interrupted" />
        <DeliverySummary delivery={run.delivery} />
      </div>
    </section>
  );
}

export function RunDetailScreen({ fixture, kind }: RunDetailScreenProps) {
  const { run } = fixture;
  return (
    <ScreenShell currentLabel={fixture.title} sectionHref="#run-scenario" sectionLabel="Run details">
      <PageHeader
        description={fixture.summary}
        eyebrow={`Workspace / ${fixture.id}`}
        title={fixture.title}
      />

      <section aria-label="Run metadata" className="pulmu-screen__metadata">
        <RunLifecycleStatus status={run.status} />
        <ForgeRiskBadge forge={run.forge} risk={run.risk} />
        <TaskMetadata areas={run.areas} taskType={run.taskType} />
      </section>

      <ContentWithRail
        className="pulmu-screen__forge"
        label="Run activity and canonical forge progress"
        rail={<ForgeStageRail patternDetail="Experience intent defined inside Shape" run={run} />}
        railLabel="Canonical forge stages"
      >
        <div className="pulmu-screen__stack" id="run-scenario" tabIndex={-1}>
          <ActiveStagePanel activity={fixture.activity} run={run} />
          <RunScenario fixture={fixture} kind={kind} />
        </div>
      </ContentWithRail>
    </ScreenShell>
  );
}

type HistoryRow = (typeof PULMU_EXAMPLE_RUN_HISTORY)[number];

const historyColumns = [
  { accessor: (fixture: HistoryRow) => fixture.id, header: "Run", key: "run", priority: 1 },
  { accessor: (fixture: HistoryRow) => fixture.title, header: "Scenario", key: "scenario", priority: 2 },
  {
    accessor: (fixture: HistoryRow) => fixture.run.status,
    header: "Status",
    key: "status",
    priority: 3,
    render: (value: unknown) => {
      const presentation = statusPresentation[value as PulmuRunStatus];
      return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
    },
  },
  {
    accessor: (fixture: HistoryRow) => fixture.run.currentStage.id,
    header: "Last stage",
    key: "stage",
    priority: 4,
    render: (value: unknown) => `${String(value)[0].toUpperCase()}${String(value).slice(1)}`,
  },
  {
    accessor: (fixture: HistoryRow) => fixture.run.delivery.kind,
    header: "Delivery",
    key: "delivery",
    priority: 5,
    render: (value: unknown) => value === "github" ? "GitHub PR" : value === "local" ? "Local commit" : value === "none" ? "Not delivered" : "Pending",
  },
] as const;

function HistoryData({ onRefresh, status }: Required<Pick<RunHistoryScreenProps, "status">> & Pick<RunHistoryScreenProps, "onRefresh">) {
  const table = (
    <DataTable
      caption="Pulmu run history"
      columns={historyColumns}
      rowKey={(fixture) => fixture.id}
      rows={PULMU_EXAMPLE_RUN_HISTORY}
    />
  );
  if (status === "loading") return <DataState status="loading" title="Loading run history" />;
  if (status === "stale") {
    return (
      <DataState
        action={onRefresh ? <Button onClick={onRefresh} variant="quiet">Refresh</Button> : undefined}
        description="The last adapter-derived snapshot remains available."
        status="stale"
        title="Run history may be out of date"
        updatedAt="3 Sep, 09:15 UTC"
      >
        {table}
      </DataState>
    );
  }
  return <DataState status="ready">{table}</DataState>;
}

export function RunHistoryScreen({ onRefresh, status = "ready" }: RunHistoryScreenProps) {
  return (
    <ScreenShell currentLabel="Run history" sectionHref="#run-history" sectionLabel="History table">
      <PageHeader
        description="Compare active, retry, delivery, failure, and interruption outcomes without exposing raw Run Context."
        eyebrow="Workspace / Runs"
        title="Run history"
      />
      <section aria-labelledby="run-history-heading" className="pulmu-screen__section" id="run-history" tabIndex={-1}>
        <h2 id="run-history-heading">All example runs</h2>
        <HistoryData onRefresh={onRefresh} status={status} />
      </section>
    </ScreenShell>
  );
}

export function EmptyWorkspaceScreen({ onStartRun }: EmptyWorkspaceScreenProps) {
  return (
    <ScreenShell currentLabel="Empty workspace" sectionHref="#empty-state" sectionLabel="Get started">
      <PageHeader
        description="A quiet first-use state for a workspace with no Pulmu runs."
        eyebrow="Workspace / Overview"
        title="Empty workspace"
      />
      <section aria-label="Empty workspace state" id="empty-state" tabIndex={-1}>
        <StateLayout
          action={onStartRun ? <Button onClick={onStartRun}>Start a Pulmu run</Button> : undefined}
          description={'Open Codex and run $pulmu "<task>". Activity will appear here after Ignite starts.'}
          state="empty"
          title="No forge runs yet"
        />
      </section>
    </ScreenShell>
  );
}
