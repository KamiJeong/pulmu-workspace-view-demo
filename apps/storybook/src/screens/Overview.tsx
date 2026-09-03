import { useRef, type MouseEvent as ReactMouseEvent } from "react";
import {
  PULMU_EXAMPLE_RUN_FIXTURES,
  type PulmuRunViewModel,
} from "@pulmu/model";
import {
  ActiveStagePanel,
  AppShell,
  Badge,
  Button,
  CollapsibleSidebar,
  ContentWithRail,
  DataState,
  DataTable,
  ForgeStageRail,
  MetricCard,
  MetricGrid,
  PageHeader,
} from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./Overview.css";

export type OverviewStatus = "ready" | "loading" | "empty" | "error" | "stale";

export type OverviewProps = {
  readonly onRefresh?: () => void;
  readonly onRetry?: () => void;
  readonly onStartRun?: () => void;
  readonly onViewActiveRun?: () => void;
  readonly run?: PulmuRunViewModel;
  readonly status?: OverviewStatus;
};

type RecentRun = {
  readonly currentStage: string;
  readonly forge: string;
  readonly id: string;
  readonly status: PulmuRunViewModel["status"];
  readonly updatedAt: string;
};

export const activeOverviewRun = PULMU_EXAMPLE_RUN_FIXTURES.active.run;
export const failedOverviewRun = PULMU_EXAMPLE_RUN_FIXTURES.failed.run;

const completedOverviewRun = PULMU_EXAMPLE_RUN_FIXTURES.completedGithub.run;

const statusPresentation: Record<RecentRun["status"], { readonly label: string; readonly tone: "info" | "success" | "danger" | "warning" }> = {
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  interrupted: { label: "Interrupted", tone: "warning" },
  running: { label: "Running", tone: "info" },
};

const fixtureRuns = [activeOverviewRun, completedOverviewRun, failedOverviewRun] as const;
const recentRuns: readonly RecentRun[] = fixtureRuns.map((run, index) => ({
  currentStage: run.currentStage.id[0].toUpperCase() + run.currentStage.id.slice(1),
  forge: run.forge ? run.forge[0].toUpperCase() + run.forge.slice(1) : "Provisional",
  id: `Run ${index + 18}`,
  status: run.status,
  updatedAt: new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(run.timestamps.updatedAt)),
}));

const recentRunColumns = [
  { accessor: (run: RecentRun) => run.id, header: "Run", key: "run", priority: 1 },
  {
    accessor: (run: RecentRun) => run.status,
    header: "Status",
    key: "status",
    priority: 2,
    render: (value: unknown) => {
      const presentation = statusPresentation[value as RecentRun["status"]];
      return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
    },
  },
  { accessor: (run: RecentRun) => run.currentStage, header: "Current stage", key: "stage", priority: 3 },
  { accessor: (run: RecentRun) => run.forge, header: "Forge", key: "forge", priority: 4 },
  { accessor: (run: RecentRun) => run.updatedAt, header: "Updated", key: "updated", priority: 5 },
] as const;

const navigation = (
  <nav aria-label="Workspace">
    <ul>
      <li><a aria-current="page" href="#overview-main">Overview</a></li>
      <li><a href="#active-run">Active run</a></li>
      <li><a href="#recent-runs-heading">Recent runs</a></li>
    </ul>
  </nav>
);

function WorkspaceSidebar() {
  return (
    <CollapsibleSidebar
      collapseLabel="Collapse workspace navigation"
      expandLabel="Expand workspace navigation"
      label="Workspace navigation"
      mobileCloseLabel="Close workspace navigation"
      mobileTriggerLabel="Open workspace navigation"
    >
      {navigation}
    </CollapsibleSidebar>
  );
}

function DataRegion({
  onRefresh,
  onRetry,
  onStartRun,
  status,
}: Pick<OverviewProps, "onRefresh" | "onRetry" | "onStartRun" | "status"> & { readonly status: OverviewStatus }) {
  const table = (
    <DataTable
      caption="Recent Pulmu runs"
      columns={recentRunColumns}
      rowKey={(run) => run.id}
      rows={recentRuns}
    />
  );

  if (status === "loading") {
    return <DataState status="loading" title="Loading recent runs" />;
  }
  if (status === "empty") {
    return (
      <DataState
        action={onStartRun ? <Button onClick={onStartRun} variant="secondary">Start a run</Button> : undefined}
        description="Run Pulmu to see workspace activity here."
        status="empty"
        title="No runs yet"
      />
    );
  }
  if (status === "error") {
    return (
      <DataState
        action={onRetry ? <Button onClick={onRetry} variant="secondary">Retry loading</Button> : undefined}
        description="Recent runs are unavailable. Try loading them again."
        status="error"
        title="Recent runs could not be loaded"
      />
    );
  }
  if (status === "stale") {
    return (
      <DataState
        action={onRefresh ? <Button onClick={onRefresh} variant="quiet">Refresh</Button> : undefined}
        description="The last successful snapshot remains available."
        status="stale"
        title="Recent runs may be out of date"
        updatedAt="3 Sep, 09:15 UTC"
      >
        {table}
      </DataState>
    );
  }
  return <DataState status="ready">{table}</DataState>;
}

function ProductHeader() {
  return (
    <div className="overview__product">
      <span className="overview__brand">🔥 Pulmu</span>
      <span className="overview__workspace">workspace-view-demo</span>
    </div>
  );
}

export function Overview({
  onRefresh,
  onRetry,
  onStartRun,
  onViewActiveRun,
  run = activeOverviewRun,
  status = "ready",
}: OverviewProps) {
  const activeRunRef = useRef<HTMLDivElement>(null);
  const focusSkipTarget = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement) || !target.classList.contains("pulmu-skip-link")) return;
    event.preventDefault();
    target.ownerDocument.getElementById("overview-main")?.focus();
  };
  const completedStages = run.timeline.filter((stage) => stage.status === "completed").length;
  const currentStageName = run.timeline.find((stage) => stage.id === run.currentStage.id)?.name ?? "Unknown";
  const forgeLabel = run.forge ? `${run.forge[0].toUpperCase()}${run.forge.slice(1)}` : "Provisional";

  return (
    <AppShell
      className="overview"
      data-testid="overview-shell"
      header={<ProductHeader />}
      mainId="overview-main"
      onClick={focusSkipTarget}
      sidebar={<WorkspaceSidebar />}
      skipLinkLabel="Skip to workspace overview"
    >
      <PageHeader
        actions={(
          <Button onClick={() => {
            onViewActiveRun?.();
            activeRunRef.current?.focus();
          }}>
            View active run
          </Button>
        )}
        description="Track the active forge, recent outcomes, and delivery readiness in one place."
        eyebrow="Workspace / Overview"
        title="Workspace overview"
      />

      <MetricGrid label="Workspace metrics">
        <MetricCard label="Active stage" support="Current forge activity" value={currentStageName} />
        <MetricCard label="Progress" support="Canonical forge stages" value={`${completedStages} / ${run.timeline.length}`} />
        <MetricCard label="Forge" support="Review depth" value={forgeLabel} />
      </MetricGrid>

      <section aria-labelledby="forge-progress-heading" className="overview__section">
        <h2 className="overview__section-heading" id="forge-progress-heading">Forge progress</h2>
        <ContentWithRail
          className="overview__forge"
          data-testid="overview-forge"
          label="Active run and canonical forge progress"
          rail={(
            <ForgeStageRail
              patternDetail="Hierarchy, responsive behavior, and accessibility defined"
              run={run}
            />
          )}
          railLabel="Canonical forge stages"
        >
          <div id="active-run" ref={activeRunRef} tabIndex={-1}>
            <ActiveStagePanel
              activity="Implementing the workspace overview Storybook slice"
              run={run}
            />
          </div>
        </ContentWithRail>
      </section>

      <section aria-labelledby="recent-runs-heading" className="overview__section overview__recent-runs">
        <h2 className="overview__section-heading" id="recent-runs-heading" tabIndex={-1}>Recent runs</h2>
        <DataRegion
          onRefresh={onRefresh}
          onRetry={onRetry}
          onStartRun={onStartRun}
          status={status}
        />
      </section>
    </AppShell>
  );
}
