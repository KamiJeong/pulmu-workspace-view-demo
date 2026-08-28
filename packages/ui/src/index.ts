export const PULMU_UI_PACKAGE = "@pulmu/ui" as const;
export const PULMU_UI_MATURITY = "beta" as const;

export type ComponentMaturity = "experimental" | "beta" | "stable";

export const componentMaturity = {
  Alert: "beta", Avatar: "beta", Badge: "beta", Breadcrumb: "beta", Button: "beta",
  Card: "beta", Checkbox: "beta", CodeReference: "beta", CopyButton: "beta", Dialog: "beta",
  EmptyState: "beta", ErrorState: "beta", IconButton: "beta", Input: "beta", Link: "beta",
  Menu: "beta", Pagination: "beta", Popover: "beta", Progress: "beta", SearchField: "beta",
  Select: "beta", Skeleton: "beta", SkipLink: "beta", Spinner: "beta", Switch: "beta",
  Tabs: "beta", Tooltip: "beta", VisuallyHidden: "beta",
} as const satisfies Record<string, ComponentMaturity>;

export * from "./a11y";
export * from "./actions";
export * from "./content";
export * from "./feedback";
export * from "./fields";
export * from "./navigation";
export * from "./overlays";
export * from "./tabs";
