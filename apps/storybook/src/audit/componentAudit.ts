import { componentMaturity } from "@pulmu/ui";

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
export type AuditEntry = {
  readonly evidence: `story:${string}`;
  readonly group: ComponentMapGroup;
  readonly note: string;
  readonly status: Exclude<AuditStatus, "Missing">;
};

const story = (id: string) => `story:${id}` as const;
const ready = (group: ComponentMapGroup, id: string, note = "Published API is exercised by the inventoried story."): AuditEntry => ({
  evidence: story(id), group, note, status: "Ready",
});

const core = (slug: string) => `05-core-components-components--${slug}`;
const data = (slug: string) => `06-data-components-components--${slug}`;
const forge = (slug: string) => `07-forge-components-forge-status--${slug}`;
const agent = (slug: string) => `08-agent-components-agent-surfaces--${slug}`;
const layout = (slug: string) => `09-layout-patterns-responsive-workspace--${slug}`;

export const componentAudit = {
  Alert: ready("Content & feedback", core("alert-story")),
  AppShell: ready("Actions & navigation", layout("desktop-1440")),
  Avatar: ready("Content & feedback", core("avatar-story")),
  Badge: ready("Content & feedback", core("badge-story")),
  Breadcrumb: ready("Actions & navigation", core("breadcrumb-story")),
  Button: ready("Actions & navigation", core("button-story")),
  Card: ready("Content & feedback", core("card-story")),
  Checkbox: ready("Fields", core("checkbox-story")),
  CodeReference: ready("Content & feedback", core("code-reference-story")),
  CollapsibleSidebar: ready("Actions & navigation", layout("mobile-sidebar-keyboard")),
  ContentWithRail: ready("Data", layout("desktop-1440")),
  CopyButton: ready("Actions & navigation", core("copy-button-story")),
  Dialog: ready("Overlays", core("dialog-story")),
  EmbeddedView: ready("Content & feedback", layout("embedded-workspace")),
  EmptyState: ready("Content & feedback", core("empty-state-story")),
  ErrorState: ready("Content & feedback", core("error-state-story")),
  FilterDataRegion: ready("Data", layout("feedback-states")),
  IconButton: ready("Actions & navigation", core("icon-button-story")),
  Input: ready("Fields", core("input-story")),
  Link: ready("Actions & navigation", core("link-story")),
  MasterDetail: ready("Data", layout("desktop-1440")),
  Menu: ready("Overlays", core("menu-story")),
  MetricGrid: ready("Data", layout("desktop-1440")),
  OverflowRegion: ready("Data", layout("narrow-320")),
  PageHeader: ready("Content & feedback", layout("desktop-1440")),
  Pagination: ready("Actions & navigation", core("pagination-story")),
  Popover: ready("Overlays", core("popover-story")),
  Progress: ready("Content & feedback", core("progress-boundaries")),
  SearchField: ready("Fields", core("search-field-story")),
  Select: ready("Fields", core("select-story")),
  Skeleton: ready("Content & feedback", core("skeleton-story")),
  SkipLink: ready("Foundations", core("skip-link-story")),
  Spinner: ready("Content & feedback", core("spinner-story")),
  StateLayout: ready("Content & feedback", layout("feedback-states")),
  Switch: ready("Fields", core("switch-story")),
  Tabs: ready("Actions & navigation", core("manual-tabs-keyboard")),
  Tooltip: ready("Overlays", core("tooltip-story")),
  VisuallyHidden: ready("Foundations", core("visually-hidden-story")),
  BarChart: ready("Data", data("accessible-visualizations")),
  ChartSummary: ready("Data", data("accessible-visualizations")),
  DataState: ready("Data", data("loading-empty-error-and-stale")),
  DataTable: ready("Data", data("semantic-table-and-filters")),
  DonutChart: ready("Data", data("accessible-visualizations")),
  FilterSummary: ready("Fields", data("semantic-table-and-filters")),
  Legend: ready("Data", data("accessible-visualizations")),
  LineChart: ready("Data", data("accessible-visualizations")),
  MetricCard: ready("Data", data("metrics-and-progress")),
  SortableHeader: ready("Data", data("semantic-table-and-filters")),
  TrendIndicator: ready("Data", data("metrics-and-progress")),
  ActiveStagePanel: ready("Pulmu workflow", forge("running-hammer")),
  DeliverySummary: ready("Pulmu workflow", forge("delivery-states")),
  FailureInterruptedNotice: ready("Pulmu workflow", forge("failed-quench")),
  ForgeRiskBadge: ready("Pulmu workflow", forge("provisional-metadata")),
  ForgeStageRail: ready("Pulmu workflow", forge("boundary-width-rail")),
  PatternInset: ready("Pulmu workflow", forge("pattern-disabled")),
  RetryLoop: ready("Pulmu workflow", forge("quench-retry")),
  ReviewFinding: ready("Pulmu workflow", forge("review-states")),
  RunLifecycleStatus: ready("Pulmu workflow", forge("completed")),
  StageActivity: ready("Pulmu workflow", forge("running-hammer")),
  TaskMetadata: ready("Pulmu workflow", forge("provisional-metadata")),
  VerificationSummary: ready("Pulmu workflow", forge("verification-states")),
  ActiveAgentGroup: ready("Pulmu workflow", agent("active-and-parallel-groups")),
  AgentActivityRow: ready("Pulmu workflow", agent("identity-authority-and-status")),
  AgentAuthorityIndicator: ready("Pulmu workflow", agent("identity-authority-and-status")),
  AgentCard: ready("Pulmu workflow", agent("identity-authority-and-status")),
  AgentGroup: ready("Pulmu workflow", agent("no-active-agents")),
  AgentIdentity: ready("Pulmu workflow", agent("identity-authority-and-status")),
  AgentRoleBadge: ready("Pulmu workflow", agent("identity-authority-and-status")),
  AgentStageRelationship: ready("Pulmu workflow", agent("pattern-designer")),
  AgentStatus: ready("Pulmu workflow", agent("identity-authority-and-status")),
  OrchestrationFlow: ready("Pulmu workflow", agent("narrow-long-agent-names"), "Reviewed at 320px in both themes after compact indentation changes."),
  ParallelReadOnlyGroup: ready("Pulmu workflow", agent("active-and-parallel-groups")),
  ReviewerFindingSummary: ready("Pulmu workflow", agent("reviewer-findings")),
} as const satisfies Record<keyof typeof componentMaturity, AuditEntry>;

export const componentAuditGaps = {
  Drawer: { group: "Overlays", note: "No standalone published API; compact navigation composes Dialog.", status: "Missing" },
  Toast: { group: "Overlays", note: "No standalone published API or announcement contract yet.", status: "Missing" },
} as const;
