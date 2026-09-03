import { useState, type ReactNode } from "react";
import { PULMU_EXAMPLE_RUN_FIXTURES } from "@pulmu/model";
import { UI_ICONS } from "@pulmu/icons";
import {
  Alert,
  AgentCard,
  Avatar,
  Badge,
  BarChart,
  Breadcrumb,
  Button,
  Checkbox,
  CodeReference,
  CopyButton,
  DataState,
  DataTable,
  Dialog,
  FilterSummary,
  ForgeStageRail,
  IconButton,
  Input,
  Link,
  Menu,
  MetricCard,
  Pagination,
  Popover,
  Progress,
  SearchField,
  Select,
  Spinner,
  Switch,
  Tabs,
  Tooltip,
  TrendIndicator,
  componentMaturity,
} from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./ComponentMap.css";

export const componentMapGroups = [
  "Foundations",
  "Actions & navigation",
  "Fields",
  "Content & feedback",
  "Data",
  "Pulmu workflow",
  "Overlays",
] as const;

export type ComponentMapGroup = (typeof componentMapGroups)[number];
export type AuditStatus = "Ready" | "Needs improvement" | "Broken" | "Missing";
type ReviewedEvidence = `story:${string}` | `docs:${string}`;
type InventoryEvidence = `inventory:${string}`;
type PublishedAuditEntry = {
  readonly group: ComponentMapGroup;
  readonly note: string;
  readonly evidence: ReviewedEvidence | InventoryEvidence;
  readonly status: Exclude<AuditStatus, "Missing">;
};
export type AuditEntry = PublishedAuditEntry | {
  readonly evidence?: never;
  readonly group: ComponentMapGroup;
  readonly note: string;
  readonly status: "Missing";
};

const CORE_STORY = "story:apps/storybook/src/core/CoreComponents.stories.tsx" as const;
const DATA_STORY = "story:apps/storybook/src/data/DataComponents.stories.tsx" as const;
const FORGE_STORY = "story:apps/storybook/src/forge/ForgeComponents.stories.tsx" as const;
const AGENT_STORY = "story:apps/storybook/src/agents/AgentComponents.stories.tsx" as const;
const LAYOUT_STORY = "story:apps/storybook/src/layout/LayoutPatterns.stories.tsx" as const;

const ready = (group: ComponentMapGroup, evidence: ReviewedEvidence, note = "Published API and Storybook evidence available.") => ({
  evidence,
  group,
  note,
  status: "Ready",
} as const);
const improve = (group: ComponentMapGroup, evidence: ReviewedEvidence | InventoryEvidence, note: string) => ({
  evidence,
  group,
  note,
  status: "Needs improvement",
} as const);

/**
 * Compile-time exhaustive inventory for every published UI component. Audit status
 * describes review evidence; it is deliberately independent from beta API maturity.
 */
export const componentAudit = {
  Alert: ready("Content & feedback", CORE_STORY),
  AppShell: ready("Actions & navigation", LAYOUT_STORY),
  Avatar: ready("Content & feedback", CORE_STORY),
  Badge: ready("Content & feedback", CORE_STORY),
  Breadcrumb: ready("Actions & navigation", CORE_STORY),
  Button: ready("Actions & navigation", CORE_STORY),
  Card: ready("Content & feedback", CORE_STORY),
  Checkbox: ready("Fields", CORE_STORY),
  CodeReference: ready("Content & feedback", CORE_STORY),
  CollapsibleSidebar: ready("Actions & navigation", LAYOUT_STORY),
  ContentWithRail: ready("Data", LAYOUT_STORY),
  CopyButton: ready("Actions & navigation", CORE_STORY),
  Dialog: ready("Overlays", CORE_STORY),
  EmbeddedView: ready("Content & feedback", LAYOUT_STORY),
  EmptyState: ready("Content & feedback", CORE_STORY),
  ErrorState: ready("Content & feedback", CORE_STORY),
  FilterDataRegion: ready("Data", LAYOUT_STORY),
  IconButton: ready("Actions & navigation", CORE_STORY),
  Input: ready("Fields", CORE_STORY),
  Link: ready("Actions & navigation", CORE_STORY),
  MasterDetail: ready("Data", LAYOUT_STORY),
  Menu: ready("Overlays", CORE_STORY),
  MetricGrid: ready("Data", LAYOUT_STORY),
  OverflowRegion: ready("Data", LAYOUT_STORY),
  PageHeader: ready("Content & feedback", LAYOUT_STORY),
  Pagination: ready("Actions & navigation", CORE_STORY),
  Popover: ready("Overlays", CORE_STORY),
  Progress: ready("Content & feedback", CORE_STORY),
  SearchField: ready("Fields", CORE_STORY),
  Select: ready("Fields", CORE_STORY),
  Skeleton: ready("Content & feedback", CORE_STORY),
  SkipLink: ready("Foundations", LAYOUT_STORY),
  Spinner: ready("Content & feedback", CORE_STORY),
  StateLayout: ready("Content & feedback", LAYOUT_STORY),
  Switch: ready("Fields", CORE_STORY),
  Tabs: ready("Actions & navigation", CORE_STORY),
  Tooltip: ready("Overlays", CORE_STORY),
  VisuallyHidden: ready("Foundations", CORE_STORY),
  BarChart: ready("Data", DATA_STORY),
  ChartSummary: ready("Data", DATA_STORY),
  DataState: ready("Data", DATA_STORY),
  DataTable: ready("Data", DATA_STORY),
  DonutChart: ready("Data", DATA_STORY),
  FilterSummary: ready("Fields", DATA_STORY),
  Legend: ready("Data", DATA_STORY),
  LineChart: ready("Data", DATA_STORY),
  MetricCard: ready("Data", DATA_STORY),
  SortableHeader: ready("Data", DATA_STORY),
  TrendIndicator: ready("Data", DATA_STORY),
  ActiveStagePanel: ready("Pulmu workflow", FORGE_STORY),
  DeliverySummary: ready("Pulmu workflow", FORGE_STORY),
  FailureInterruptedNotice: ready("Pulmu workflow", FORGE_STORY),
  ForgeRiskBadge: ready("Pulmu workflow", FORGE_STORY),
  ForgeStageRail: ready("Pulmu workflow", FORGE_STORY),
  PatternInset: ready("Pulmu workflow", FORGE_STORY),
  RetryLoop: ready("Pulmu workflow", FORGE_STORY),
  ReviewFinding: ready("Pulmu workflow", FORGE_STORY),
  RunLifecycleStatus: ready("Pulmu workflow", FORGE_STORY),
  StageActivity: ready("Pulmu workflow", FORGE_STORY),
  TaskMetadata: ready("Pulmu workflow", FORGE_STORY),
  VerificationSummary: ready("Pulmu workflow", FORGE_STORY),
  ActiveAgentGroup: ready("Pulmu workflow", AGENT_STORY),
  AgentActivityRow: ready("Pulmu workflow", AGENT_STORY),
  AgentAuthorityIndicator: ready("Pulmu workflow", AGENT_STORY),
  AgentCard: ready("Pulmu workflow", AGENT_STORY),
  AgentGroup: ready("Pulmu workflow", AGENT_STORY),
  AgentIdentity: ready("Pulmu workflow", AGENT_STORY),
  AgentRoleBadge: ready("Pulmu workflow", AGENT_STORY),
  AgentStageRelationship: ready("Pulmu workflow", AGENT_STORY),
  AgentStatus: ready("Pulmu workflow", AGENT_STORY),
  OrchestrationFlow: improve("Pulmu workflow", AGENT_STORY, "Dense routing view still needs additional 320px manual review."),
  ParallelReadOnlyGroup: ready("Pulmu workflow", AGENT_STORY),
  ReviewerFindingSummary: ready("Pulmu workflow", AGENT_STORY),
} as const satisfies Record<keyof typeof componentMaturity, AuditEntry>;

export const componentAuditGaps = {
  Drawer: { group: "Overlays", note: "No standalone published API; compact navigation composes Dialog.", status: "Missing" },
  Toast: { group: "Overlays", note: "No standalone published API or announcement contract yet.", status: "Missing" },
} as const satisfies Record<string, AuditEntry>;

type AuditName = keyof typeof componentAudit;
type PaneTheme = "dark" | "light";

const run = PULMU_EXAMPLE_RUN_FIXTURES.active.run;
const chartData = [
  { id: "inspect", label: "Inspect", value: 18 },
  { id: "shape", label: "Shape", value: 24 },
  { id: "hammer", label: "Hammer", value: 41 },
  { id: "quench", label: "Quench", value: 17 },
] as const;
const tableRows = [
  { component: "Button", evidence: "States + keyboard", status: "Ready" },
  { component: "OrchestrationFlow", evidence: "Responsive follow-up", status: "Needs improvement" },
] as const;
const tableColumns = [
  { accessor: (row: (typeof tableRows)[number]) => row.component, header: "Component", key: "component", priority: 1 },
  { accessor: (row: (typeof tableRows)[number]) => row.status, header: "Audit status", key: "status", priority: 2 },
  { accessor: (row: (typeof tableRows)[number]) => row.evidence, header: "Evidence", key: "evidence", priority: 3 },
] as const;

function AuditInventory({ group }: { readonly group: ComponentMapGroup }) {
  const entries = (Object.entries(componentAudit) as [AuditName, AuditEntry][])
    .filter(([, entry]) => entry.group === group);
  return (
    <ul aria-label={`${group} component audit`} className="component-map__inventory">
      {entries.map(([name, entry]) => (
        <li data-audit-evidence={entry.evidence} data-audit-status={entry.status} key={name} title={`${entry.note} Evidence: ${entry.evidence}`}>
          <code>{name}</code>
          <span>{entry.status}</span>
          <small>{componentMaturity[name]}</small>
        </li>
      ))}
    </ul>
  );
}

function Group({ children, group, paneId }: { readonly children: ReactNode; readonly group: ComponentMapGroup; readonly paneId: string }) {
  const id = `${paneId}-${group.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`;
  const paneLabel = paneId.endsWith("dark") ? "Dark theme" : "Light theme";
  return (
    <section aria-label={`${group}, ${paneLabel}`} className="component-map__group">
      <h3 id={id}>{group}</h3>
      <AuditInventory group={group} />
      <div className="component-map__samples">{children}</div>
    </section>
  );
}

function OverlaySamples({ paneId }: { readonly paneId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <div className="component-map__row">
        <Tooltip content="Names and behavior are unchanged across themes.">
          <Button variant="secondary">Theme guidance</Button>
        </Tooltip>
        <Popover content="Scoped semantic tokens resolve inside this pane." triggerLabel="Popover" />
        <Menu
          items={[
            { id: `${paneId}-view`, label: "View details" },
            { disabled: true, id: `${paneId}-archive`, label: "Archive unavailable" },
          ]}
          label={`${paneId} component actions`}
          triggerLabel="Actions"
        />
        <Button onClick={() => setDialogOpen(true)} variant="secondary">Open dialog</Button>
      </div>
      <Dialog
        actions={<Button onClick={() => setDialogOpen(false)}>Done</Button>}
        description="A focused interaction sample; visual baselines keep this closed."
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Component review"
      >Dialog focus and dismissal behavior remain part of the published component.</Dialog>
      <ul aria-label={`${paneId} missing component gaps`} className="component-map__gaps">
        {Object.entries(componentAuditGaps).map(([name, entry]) => (
          <li key={name}><strong>{name}</strong><Badge tone="warning">{entry.status}</Badge><span>{entry.note}</span></li>
        ))}
      </ul>
    </>
  );
}

function ThemePane({ theme }: { readonly theme: PaneTheme }) {
  const paneId = `component-map-${theme}`;
  const title = theme === "dark" ? "Dark theme" : "Light theme";
  return (
    <article
      aria-labelledby={`${paneId}-heading`}
      className="component-map__pane"
      data-pulmu-theme={theme}
      data-testid={`${theme}-theme-pane`}
    >
      <header className="component-map__pane-header">
        <div><span className="component-map__eyebrow">Scoped review surface</span><h2 id={`${paneId}-heading`}>{title}</h2></div>
        <span aria-hidden="true" className="component-map__theme-probe" data-testid={`${theme}-theme-probe`} />
      </header>

      <Group group="Foundations" paneId={paneId}>
        <div className="component-map__foundation-grid">
          <span><i className="component-map__swatch component-map__swatch--canvas" />Canvas</span>
          <span><i className="component-map__swatch component-map__swatch--surface" />Surface</span>
          <span><i className="component-map__swatch component-map__swatch--brand" />Ember</span>
          <span><i className="component-map__swatch component-map__swatch--border" />Boundary</span>
        </div>
        <CodeReference>--pulmu-color-surface-default</CodeReference>
      </Group>

      <Group group="Actions & navigation" paneId={paneId}>
        <div className="component-map__row">
          <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="quiet">Quiet</Button>
          <IconButton icon={UI_ICONS.settings} label={`${title} settings`} variant="secondary" />
          <CopyButton copyLabel="Copy command" text={'$pulmu "Implement issue #39"'} />
        </div>
        <Breadcrumb label={`${title} breadcrumb`} items={[{ href: "#component-map", label: "Design system" }, { label: title }]} />
        <Tabs label={`${title} component views`} items={[
          { content: "Representative states", id: `${paneId}-states`, label: "States" },
          { content: "Responsive evidence", id: `${paneId}-evidence`, label: "Evidence" },
        ]} />
        <div className="component-map__row"><Link href="#audit-method">Audit method</Link><Pagination currentPage={2} getHref={(page) => `#${paneId}-page-${page}`} label={`${title} pagination`} totalPages={3} /></div>
      </Group>

      <Group group="Fields" paneId={paneId}>
        <Input id={`${paneId}-workspace`} label="Workspace name" defaultValue="Pulmu demo" />
        <SearchField id={`${paneId}-search`} label="Search components" placeholder="Button, Dialog…" />
        <Select id={`${paneId}-forge`} defaultValue="standard" label="Forge depth" options={[
          { label: "Quick Forge", value: "quick" }, { label: "Standard Forge", value: "standard" }, { label: "Full Forge", value: "full" },
        ]} />
        <Input error="Use an owner/repository path." id={`${paneId}-repository`} label="Repository" aria-required="true" />
        <div className="component-map__stack"><Checkbox id={`${paneId}-verification`} defaultChecked label="Run verification" /><Switch id={`${paneId}-motion`} defaultChecked label="Reduce motion" /></div>
        <FilterSummary filters={[{ id: `${paneId}-ready`, label: "Status", value: "Ready" }]} label={`${title} active filters`} />
      </Group>

      <Group group="Content & feedback" paneId={paneId}>
        <div className="component-map__row">
          <Avatar alt="Pulmu team" fallback="PU" />
          <Badge>Beta API</Badge><Badge tone="success">Ready</Badge><Badge tone="warning">Needs improvement</Badge>
          <Spinner label="Reviewing components" />
        </div>
        <Alert title="Theme parity available" tone="success">Both panes use the same component tree and semantic tokens.</Alert>
        <MetricCard label="Audited exports" support="Typed manifest coverage" trend={<TrendIndicator label="Coverage change" value={0.12} />} value={Object.keys(componentAudit).length} />
        <Progress label="Component audit" value={98} />
        <div aria-label={`${title} data states`} className="component-map__states" role="group">
          <DataState data-state-sample="loading" status="loading" title="Loading components" />
          <DataState data-state-sample="empty" description="Change filters or add a component story." status="empty" title="No matching components" />
          <DataState data-state-sample="error" description="Retry the Storybook audit after resolving the failure." status="error" title="Audit data unavailable" />
        </div>
      </Group>

      <Group group="Data" paneId={paneId}>
        <BarChart data={chartData} summary="Hammer has the largest share. Exact values remain available in the equivalent data table." title="Forge activity distribution" />
        <DataTable caption={`${title} audit evidence`} columns={tableColumns} rowKey={(row) => row.component} rows={tableRows} />
      </Group>

      <Group group="Pulmu workflow" paneId={paneId}>
        <ForgeStageRail label={`${title} Pulmu forge stages`} patternDetail="Component map hierarchy and parity" run={run} />
        <AgentCard active activity="Implementing the approved component map" name="pulmu_smith" />
      </Group>

      <Group group="Overlays" paneId={paneId}>
        <OverlaySamples paneId={paneId} />
      </Group>
    </article>
  );
}

export function ComponentMap() {
  const readyCount = Object.values(componentAudit).filter(({ status }) => status === "Ready").length;
  const improveCount = Object.values(componentAudit).filter(({ status }) => status === "Needs improvement").length;
  return (
    <main className="component-map" id="component-map">
      <header className="component-map__intro">
        <span className="component-map__eyebrow">Design System v0.1 · Issue #39</span>
        <h1>Component map</h1>
        <p>Compare one canonical component composition in Dark and Light themes. Audit status describes current review evidence; every published API remains beta until its package contract is promoted.</p>
        <div aria-label="Component audit status legend" className="component-map__legend" id="audit-method">
          <strong>Audit status</strong>
          <span><i data-status="Ready" />Ready ({readyCount})</span>
          <span><i data-status="Needs improvement" />Needs improvement ({improveCount})</span>
          <span><i data-status="Missing" />Missing ({Object.keys(componentAuditGaps).length})</span>
          <small><code>beta</code> is API maturity, not audit status.</small>
        </div>
      </header>
      <div className="component-map__comparison">
        <ThemePane theme="dark" />
        <ThemePane theme="light" />
      </div>
    </main>
  );
}
