export const PULMU_UI_PACKAGE = "@pulmu/ui" as const;
export const PULMU_UI_MATURITY = "beta" as const;

export type ComponentMaturity = "experimental" | "beta" | "stable";

export const componentMaturity = {
  Alert: "beta", Avatar: "beta", Badge: "beta", Breadcrumb: "beta", Button: "beta",
  Card: "beta", Checkbox: "beta", CodeReference: "beta", CopyButton: "beta", Dialog: "beta",
  EmptyState: "beta", ErrorState: "beta", IconButton: "beta", Input: "beta", Link: "beta",
  BarChart: "beta", ChartSummary: "beta", DataState: "beta", DataTable: "beta", DonutChart: "beta",
  FilterSummary: "beta", Legend: "beta", LineChart: "beta", Menu: "beta", MetricCard: "beta",
  Pagination: "beta", Popover: "beta", Progress: "beta", SearchField: "beta", SortableHeader: "beta",
  Select: "beta", Skeleton: "beta", SkipLink: "beta", Spinner: "beta", Switch: "beta",
  Tabs: "beta", Tooltip: "beta", TrendIndicator: "beta", VisuallyHidden: "beta",
  ActiveStagePanel: "beta", DeliverySummary: "beta", FailureInterruptedNotice: "beta",
  ForgeRiskBadge: "beta", ForgeStageRail: "beta", PatternInset: "beta", RetryLoop: "beta",
  ReviewFinding: "beta", RunLifecycleStatus: "beta", StageActivity: "beta",
  TaskMetadata: "beta", VerificationSummary: "beta",
} as const satisfies Record<string, ComponentMaturity>;

export * from "./a11y";
export * from "./actions";
export * from "./content";
export * from "./charts";
export * from "./data";
export * from "./feedback";
export * from "./fields";
export * from "./formatters";
export * from "./forge";
export * from "./navigation";
export * from "./overlays";
export * from "./tabs";
