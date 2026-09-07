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
import {
  componentAudit,
  componentAuditGaps,
  type AuditEntry,
  type ComponentMapGroup,
} from "../audit/componentAudit";
import "./ComponentMap.css";

export { componentAudit, componentAuditGaps, componentMapGroups } from "../audit/componentAudit";

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
  { component: "OrchestrationFlow", evidence: "320px Light/Dark matrix", status: "Ready" },
] as const;
const tableColumns = [
  { accessor: (row: (typeof tableRows)[number]) => row.component, header: "Component", key: "component", priority: 1 },
  { accessor: (row: (typeof tableRows)[number]) => row.status, header: "Audit status", key: "status", priority: 2 },
  { accessor: (row: (typeof tableRows)[number]) => row.evidence, header: "Evidence", key: "evidence", priority: 3 },
] as const;

function AuditInventory() {
  const entries = Object.entries(componentAudit) as [AuditName, AuditEntry][];
  return (
    <ul aria-label="Published component audit" className="component-map__inventory">
      {entries.map(([name, entry]) => (
        <li data-audit-evidence={entry.evidence} data-audit-status={entry.status} key={name}>
          <span><code>{name}</code><small>{componentMaturity[name]}</small></span>
          <strong>{entry.status}</strong>
          <a aria-label={`Evidence for ${name}: ${entry.note}`} href={`./?path=/story/${entry.evidence.slice("story:".length)}`} target="_top">Evidence</a>
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
      <p className="component-map__sample-label">Representative samples</p>
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
        <Progress label="Component audit" value={100} />
        <div aria-label={`${title} data states`} className="component-map__states" role="group">
          <DataState data-state-sample="loading" status="loading" title="Loading components" />
          <DataState data-state-sample="empty" description="Change filters or add a component story." headingLevel={4} status="empty" title="No matching components" />
          <DataState data-state-sample="error" description="Retry the Storybook audit after resolving the failure." headingLevel={4} status="error" title="Audit data unavailable" />
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
          <span><i data-status="Broken" />Broken (0)</span>
          <span><i data-status="Missing" />Missing ({Object.keys(componentAuditGaps).length})</span>
          <small><code>beta</code> is API maturity, not audit status.</small>
        </div>
        <details className="component-map__published">
          <summary>Published inventory ({Object.keys(componentAudit).length} APIs)</summary>
          <p>Each API links to a precise inventoried story. Open the compact evidence list for audit status and API maturity.</p>
          <AuditInventory />
        </details>
      </header>
      <div className="component-map__comparison">
        <ThemePane theme="dark" />
        <ThemePane theme="light" />
      </div>
    </main>
  );
}
