import {
  PULMU_RUN_STATUSES,
  PULMU_STAGES,
  PULMU_STAGE_STATUSES,
  type PulmuRunStatus,
  type PulmuStageId,
  type PulmuStageStatus,
} from "@pulmu/model";

export const PULMU_TOKENS_PACKAGE = "@pulmu/tokens" as const;

export type TokenLayer = "primitive" | "semantic" | "component";

export type TokenDefinition = {
  readonly cssVar: `--pulmu-${string}`;
  readonly description: string;
  readonly usage: string;
  readonly value: string;
};

const token = <
  const CssVar extends `--pulmu-${string}`,
  const Value extends string,
  const Description extends string,
  const Usage extends string,
>(cssVar: CssVar, value: Value, description: Description, usage: Usage) =>
  ({ cssVar, value, description, usage }) as const;

export const primitiveTokens = {
  color: {
    neutral950: token("--pulmu-color-neutral-950", "#121212", "Deep neutral", "Dark canvas"),
    neutral900: token("--pulmu-color-neutral-900", "#1d1d1d", "Raised neutral", "Default surface"),
    neutral850: token("--pulmu-color-neutral-850", "#292929", "Elevated neutral", "Elevated surface"),
    neutral700: token("--pulmu-color-neutral-700", "#767676", "Strong neutral boundary", "Meaningful UI boundaries"),
    neutral600: token("--pulmu-color-neutral-600", "#7d7d7d", "Quiet neutral", "Disabled decoration"),
    neutral400: token("--pulmu-color-neutral-400", "#b9b9b9", "Muted neutral text", "Secondary text"),
    neutral100: token("--pulmu-color-neutral-100", "#f7f7f7", "Bright neutral text", "Primary text"),
    orange500: token("--pulmu-color-orange-500", "#e9782f", "Pressed orange", "Pressed actions"),
    orange400: token("--pulmu-color-orange-400", "#f7924b", "Action orange", "Primary actions"),
    orange300: token("--pulmu-color-orange-300", "#ffb37d", "Bright orange", "Focus and highlight"),
    blue400: token("--pulmu-color-blue-400", "#66b5ff", "Clear blue", "Progress and chart data"),
    cyan400: token("--pulmu-color-cyan-400", "#4fd3c4", "Clear cyan", "Chart data"),
    green400: token("--pulmu-color-green-400", "#65d690", "Clear green", "Completed states"),
    yellow400: token("--pulmu-color-yellow-400", "#e8c65a", "Clear yellow", "Interrupted states"),
    red400: token("--pulmu-color-red-400", "#ff7f86", "Clear red", "Failed states"),
    purple400: token("--pulmu-color-purple-400", "#c4a2ff", "Clear purple", "Chart data"),
    pink400: token("--pulmu-color-pink-400", "#ff91c8", "Clear pink", "Chart data"),
  },
  fontFamily: {
    sans: token("--pulmu-font-family-sans", "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", "System sans stack", "Interface and prose"),
    mono: token("--pulmu-font-family-mono", "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", "System monospace stack", "Code and token values"),
  },
  fontSize: {
    xs: token("--pulmu-font-size-xs", "0.75rem", "Extra-small type", "Metadata"),
    sm: token("--pulmu-font-size-sm", "0.875rem", "Small type", "Supporting copy"),
    md: token("--pulmu-font-size-md", "1rem", "Base type", "Body copy"),
    lg: token("--pulmu-font-size-lg", "1.25rem", "Large type", "Section headings"),
    xl: token("--pulmu-font-size-xl", "1.75rem", "Extra-large type", "Page headings"),
  },
  fontWeight: {
    regular: token("--pulmu-font-weight-regular", "400", "Regular weight", "Body copy"),
    medium: token("--pulmu-font-weight-medium", "500", "Medium weight", "Controls"),
    bold: token("--pulmu-font-weight-bold", "700", "Bold weight", "Headings and labels"),
  },
  lineHeight: {
    tight: token("--pulmu-line-height-tight", "1.2", "Tight leading", "Headings"),
    normal: token("--pulmu-line-height-normal", "1.5", "Normal leading", "Interface copy"),
    relaxed: token("--pulmu-line-height-relaxed", "1.65", "Relaxed leading", "Long-form prose"),
  },
  spacing: {
    zero: token("--pulmu-space-0", "0", "No space", "Reset spacing"),
    one: token("--pulmu-space-1", "0.25rem", "4px space", "Tight inline gaps"),
    two: token("--pulmu-space-2", "0.5rem", "8px space", "Compact gaps"),
    three: token("--pulmu-space-3", "0.75rem", "12px space", "Control padding"),
    four: token("--pulmu-space-4", "1rem", "16px space", "Default gaps"),
    six: token("--pulmu-space-6", "1.5rem", "24px space", "Card padding"),
    eight: token("--pulmu-space-8", "2rem", "32px space", "Section gaps"),
    twelve: token("--pulmu-space-12", "3rem", "48px space", "Page rhythm"),
  },
  size: {
    iconSm: token("--pulmu-size-icon-sm", "1rem", "Small icon", "Compact metadata"),
    iconMd: token("--pulmu-size-icon-md", "1.25rem", "Default icon", "Controls"),
    control: token("--pulmu-size-control", "2.75rem", "44px control", "Minimum interactive height"),
    content: token("--pulmu-size-content", "72rem", "Readable content width", "Page content"),
  },
  radius: {
    sm: token("--pulmu-radius-sm", "0.5rem", "Small radius", "Controls"),
    md: token("--pulmu-radius-md", "0.75rem", "Medium radius", "Panels"),
    full: token("--pulmu-radius-full", "9999px", "Full radius", "Pills"),
  },
  border: {
    thin: token("--pulmu-border-width-thin", "1px", "Thin border", "Default boundaries"),
    strong: token("--pulmu-border-width-strong", "2px", "Strong border", "Emphasized boundaries"),
  },
  shadow: {
    sm: token("--pulmu-shadow-sm", "0 1px 2px rgb(0 0 0 / 0.35)", "Small shadow", "Raised controls"),
    md: token("--pulmu-shadow-md", "0 8px 24px rgb(0 0 0 / 0.4)", "Medium shadow", "Overlays"),
  },
  opacity: {
    disabled: token("--pulmu-opacity-disabled", "0.48", "Disabled opacity", "Unavailable controls with text label"),
    muted: token("--pulmu-opacity-muted", "0.72", "Muted opacity", "Decorative de-emphasis only"),
    overlay: token("--pulmu-opacity-overlay", "0.8", "Overlay opacity", "Modal scrim"),
  },
  zIndex: {
    base: token("--pulmu-z-base", "0", "Base layer", "Page content"),
    sticky: token("--pulmu-z-sticky", "100", "Sticky layer", "Sticky navigation"),
    overlay: token("--pulmu-z-overlay", "400", "Overlay layer", "Menus and popovers"),
    modal: token("--pulmu-z-modal", "500", "Modal layer", "Dialogs"),
  },
  breakpoint: {
    mobile: token("--pulmu-breakpoint-mobile", "24.375rem", "390px breakpoint", "Mobile reference; use in JS or build tooling"),
    tablet: token("--pulmu-breakpoint-tablet", "48rem", "768px breakpoint", "Tablet reference; use in JS or build tooling"),
    desktop: token("--pulmu-breakpoint-desktop", "90rem", "1440px breakpoint", "Desktop reference; use in JS or build tooling"),
  },
  duration: {
    instant: token("--pulmu-duration-instant", "0ms", "No transition", "Immediate state changes"),
    fast: token("--pulmu-duration-fast", "120ms", "Fast transition", "Small controls"),
    normal: token("--pulmu-duration-normal", "200ms", "Normal transition", "Panels and disclosure"),
    slow: token("--pulmu-duration-slow", "320ms", "Slow transition", "Rare spatial changes"),
  },
  easing: {
    standard: token("--pulmu-easing-standard", "cubic-bezier(0.2, 0, 0, 1)", "Standard easing", "Most transitions"),
    enter: token("--pulmu-easing-enter", "cubic-bezier(0, 0, 0.2, 1)", "Enter easing", "Elements entering"),
    exit: token("--pulmu-easing-exit", "cubic-bezier(0.4, 0, 1, 1)", "Exit easing", "Elements leaving"),
  },
} as const;

const runStatusPalette = [
  token("--pulmu-color-status-running", "var(--pulmu-color-blue-400)", "Running status", "Running text and icon"),
  token("--pulmu-color-status-completed", "var(--pulmu-color-green-400)", "Completed status", "Completed text and icon"),
  token("--pulmu-color-status-failed", "var(--pulmu-color-red-400)", "Failed status", "Failed text and icon"),
  token("--pulmu-color-status-interrupted", "var(--pulmu-color-yellow-400)", "Interrupted status", "Interrupted text and icon"),
] as const satisfies readonly TokenDefinition[];

const stageStatusPalette = [
  token("--pulmu-color-stage-status-pending", "var(--pulmu-color-neutral-400)", "Pending stage", "Pending text and icon"),
  token("--pulmu-color-stage-status-in-progress", "var(--pulmu-color-blue-400)", "In-progress stage", "In-progress text and icon"),
  token("--pulmu-color-stage-status-completed", "var(--pulmu-color-green-400)", "Completed stage", "Completed text and icon"),
  token("--pulmu-color-stage-status-failed", "var(--pulmu-color-red-400)", "Failed stage", "Failed text and icon"),
  token("--pulmu-color-stage-status-interrupted", "var(--pulmu-color-yellow-400)", "Interrupted stage", "Interrupted text and icon"),
] as const satisfies readonly TokenDefinition[];

const stagePalette = [
  token("--pulmu-color-stage-ignite", "var(--pulmu-color-orange-400)", "Ignite stage", "Ignite text and icon"),
  token("--pulmu-color-stage-inspect", "var(--pulmu-color-blue-400)", "Inspect stage", "Inspect text and icon"),
  token("--pulmu-color-stage-shape", "var(--pulmu-color-purple-400)", "Shape stage", "Shape text and icon"),
  token("--pulmu-color-stage-hammer", "var(--pulmu-color-cyan-400)", "Hammer stage", "Hammer text and icon"),
  token("--pulmu-color-stage-quench", "var(--pulmu-color-yellow-400)", "Quench stage", "Quench text and icon"),
  token("--pulmu-color-stage-hone", "var(--pulmu-color-pink-400)", "Hone stage", "Hone text and icon"),
  token("--pulmu-color-stage-ship", "var(--pulmu-color-green-400)", "Ship stage", "Ship text and icon"),
] as const satisfies readonly TokenDefinition[];

const mapCanonicalTokens = <Key extends string>(keys: readonly Key[], values: readonly TokenDefinition[]) =>
  Object.fromEntries(keys.map((key, index) => [key, values[index]])) as Record<Key, TokenDefinition>;

export const runStatusTokens = mapCanonicalTokens<PulmuRunStatus>(PULMU_RUN_STATUSES, runStatusPalette);
export const stageStatusTokens = mapCanonicalTokens<PulmuStageStatus>(PULMU_STAGE_STATUSES, stageStatusPalette);
export const stageTokens = mapCanonicalTokens<PulmuStageId>(PULMU_STAGES.map(({ id }) => id), stagePalette);

export const semanticTokens = {
  color: {
    canvas: token("--pulmu-color-surface-canvas", "var(--pulmu-color-neutral-950)", "Canvas surface", "Page background"),
    surface: token("--pulmu-color-surface-default", "var(--pulmu-color-neutral-900)", "Default surface", "Panels and cards"),
    surfaceElevated: token("--pulmu-color-surface-elevated", "var(--pulmu-color-neutral-850)", "Elevated surface", "Floating content"),
    border: token("--pulmu-color-border-default", "var(--pulmu-color-neutral-700)", "Default boundary", "Meaningful UI boundaries"),
    borderStrong: token("--pulmu-color-border-strong", "var(--pulmu-color-neutral-400)", "Strong boundary", "Selected and emphasized boundaries"),
    text: token("--pulmu-color-text-primary", "var(--pulmu-color-neutral-100)", "Primary text", "Body and headings"),
    textMuted: token("--pulmu-color-text-muted", "var(--pulmu-color-neutral-400)", "Muted text", "Supporting text"),
    textInverse: token("--pulmu-color-text-inverse", "var(--pulmu-color-neutral-950)", "Inverse text", "Text on bright fills"),
    action: token("--pulmu-color-action-default", "var(--pulmu-color-orange-400)", "Default action", "Action fills and links"),
    actionHover: token("--pulmu-color-action-hover", "var(--pulmu-color-orange-300)", "Hover action", "Action hover state"),
    actionPressed: token("--pulmu-color-action-pressed", "var(--pulmu-color-orange-500)", "Pressed action", "Action pressed state"),
    actionText: token("--pulmu-color-action-text", "var(--pulmu-color-neutral-950)", "Action foreground", "Text and icons on actions"),
    focus: token("--pulmu-color-focus-ring", "var(--pulmu-color-orange-300)", "Focus ring", "Keyboard focus on every surface"),
  },
  typography: {
    bodyFamily: token("--pulmu-typography-body-family", "var(--pulmu-font-family-sans)", "Body family", "Interface copy"),
    bodySize: token("--pulmu-typography-body-size", "var(--pulmu-font-size-md)", "Body size", "Interface copy"),
    bodyLineHeight: token("--pulmu-typography-body-line-height", "var(--pulmu-line-height-normal)", "Body leading", "Interface copy"),
    headingWeight: token("--pulmu-typography-heading-weight", "var(--pulmu-font-weight-bold)", "Heading weight", "Page and section headings"),
    codeFamily: token("--pulmu-typography-code-family", "var(--pulmu-font-family-mono)", "Code family", "Code and token values"),
  },
  spacing: {
    inline: token("--pulmu-spacing-inline", "var(--pulmu-space-2)", "Inline gap", "Icons and labels"),
    control: token("--pulmu-spacing-control", "var(--pulmu-space-3)", "Control inset", "Controls"),
    panel: token("--pulmu-spacing-panel", "var(--pulmu-space-6)", "Panel inset", "Panels and cards"),
    section: token("--pulmu-spacing-section", "var(--pulmu-space-8)", "Section gap", "Page sections"),
  },
  size: {
    icon: token("--pulmu-size-icon", "var(--pulmu-size-icon-md)", "Default icon size", "Control icons"),
    content: token("--pulmu-size-content-max", "var(--pulmu-size-content)", "Maximum content width", "Page content"),
  },
  radius: {
    control: token("--pulmu-radius-control", "var(--pulmu-radius-sm)", "Control radius", "Buttons and inputs"),
    panel: token("--pulmu-radius-panel", "var(--pulmu-radius-md)", "Panel radius", "Panels and cards"),
  },
  border: {
    default: token("--pulmu-border-default", "var(--pulmu-border-width-thin) solid var(--pulmu-color-border-default)", "Default border", "Meaningful boundaries"),
    selected: token("--pulmu-border-selected", "var(--pulmu-border-width-strong) solid var(--pulmu-color-border-strong)", "Selected border", "Selected regions"),
  },
  shadow: {
    raised: token("--pulmu-shadow-raised", "var(--pulmu-shadow-sm)", "Raised shadow", "Raised controls"),
    overlay: token("--pulmu-shadow-overlay", "var(--pulmu-shadow-md)", "Overlay shadow", "Floating layers"),
  },
  opacity: {
    disabled: token("--pulmu-opacity-state-disabled", "var(--pulmu-opacity-disabled)", "Disabled state opacity", "Unavailable controls"),
  },
  zIndex: {
    navigation: token("--pulmu-z-navigation", "var(--pulmu-z-sticky)", "Navigation layer", "Sticky navigation"),
    popover: token("--pulmu-z-popover", "var(--pulmu-z-overlay)", "Popover layer", "Menus and popovers"),
    dialog: token("--pulmu-z-dialog", "var(--pulmu-z-modal)", "Dialog layer", "Dialogs"),
  },
  breakpoint: {
    compact: token("--pulmu-breakpoint-compact", "var(--pulmu-breakpoint-mobile)", "Compact layout reference", "Single-column layouts"),
    wide: token("--pulmu-breakpoint-wide", "var(--pulmu-breakpoint-tablet)", "Wide layout reference", "Multi-column layouts"),
  },
  focusRing: {
    color: token("--pulmu-focus-ring-color", "var(--pulmu-color-focus-ring)", "Focus color", "Keyboard focus"),
    width: token("--pulmu-focus-ring-width", "3px", "Focus width", "Keyboard focus"),
    offset: token("--pulmu-focus-ring-offset", "3px", "Focus offset", "Separates focus from every surface"),
  },
  target: {
    minimum: token("--pulmu-target-size-min", "var(--pulmu-size-control)", "Minimum target size", "Interactive controls"),
  },
  density: {
    compact: token("--pulmu-density-compact", "var(--pulmu-space-2)", "Compact density", "Dense metadata"),
    default: token("--pulmu-density-default", "var(--pulmu-space-3)", "Default density", "Controls and lists"),
    comfortable: token("--pulmu-density-comfortable", "var(--pulmu-space-4)", "Comfortable density", "Touch-oriented layouts"),
  },
  chart: {
    series1: token("--pulmu-chart-series-1", "var(--pulmu-color-orange-400)", "Chart series 1", "Solid circle series"),
    series2: token("--pulmu-chart-series-2", "var(--pulmu-color-blue-400)", "Chart series 2", "Dashed square series"),
    series3: token("--pulmu-chart-series-3", "var(--pulmu-color-purple-400)", "Chart series 3", "Dotted triangle series"),
    series4: token("--pulmu-chart-series-4", "var(--pulmu-color-cyan-400)", "Chart series 4", "Dash-dot diamond series"),
    series5: token("--pulmu-chart-series-5", "var(--pulmu-color-yellow-400)", "Chart series 5", "Long-dash cross series"),
    series6: token("--pulmu-chart-series-6", "var(--pulmu-color-pink-400)", "Chart series 6", "Short-dash star series"),
    series7: token("--pulmu-chart-series-7", "var(--pulmu-color-green-400)", "Chart series 7", "Double-dash plus series"),
  },
  motion: {
    durationFast: token("--pulmu-motion-duration-fast", "var(--pulmu-duration-fast)", "Fast motion", "Control feedback"),
    durationNormal: token("--pulmu-motion-duration-normal", "var(--pulmu-duration-normal)", "Normal motion", "Disclosure"),
    durationSlow: token("--pulmu-motion-duration-slow", "var(--pulmu-duration-slow)", "Slow motion", "Rare spatial transitions"),
    easingStandard: token("--pulmu-motion-easing-standard", "var(--pulmu-easing-standard)", "Standard motion curve", "Most transitions"),
  },
  status: { run: runStatusTokens, stage: stageStatusTokens },
  stage: stageTokens,
} as const;

export const componentTokens = {
  button: {
    background: token("--pulmu-button-background", "var(--pulmu-color-action-default)", "Button background", "Primary buttons"),
    foreground: token("--pulmu-button-foreground", "var(--pulmu-color-action-text)", "Button foreground", "Primary button text and icons"),
    radius: token("--pulmu-button-radius", "var(--pulmu-radius-control)", "Button radius", "Buttons"),
    minHeight: token("--pulmu-button-min-height", "var(--pulmu-target-size-min)", "Button minimum height", "Buttons"),
    paddingInline: token("--pulmu-button-padding-inline", "var(--pulmu-spacing-control)", "Button inline padding", "Buttons"),
  },
  panel: {
    background: token("--pulmu-panel-background", "var(--pulmu-color-surface-default)", "Panel background", "Cards and panels"),
    border: token("--pulmu-panel-border", "var(--pulmu-border-default)", "Panel border", "Cards and panels"),
    radius: token("--pulmu-panel-radius", "var(--pulmu-radius-panel)", "Panel radius", "Cards and panels"),
    padding: token("--pulmu-panel-padding", "var(--pulmu-spacing-panel)", "Panel padding", "Cards and panels"),
  },
  toolbar: {
    background: token("--pulmu-toolbar-background", "var(--pulmu-color-surface-elevated)", "Toolbar background", "Storybook toolbar-compatible surfaces"),
    border: token("--pulmu-toolbar-border", "var(--pulmu-border-default)", "Toolbar border", "Toolbar boundary"),
    minHeight: token("--pulmu-toolbar-min-height", "var(--pulmu-target-size-min)", "Toolbar target height", "Toolbar controls"),
  },
  tokenCard: {
    background: token("--pulmu-token-card-background", "var(--pulmu-color-surface-default)", "Token card background", "Token catalog entries"),
    border: token("--pulmu-token-card-border", "var(--pulmu-border-default)", "Token card border", "Token catalog entries"),
    radius: token("--pulmu-token-card-radius", "var(--pulmu-radius-panel)", "Token card radius", "Token catalog entries"),
  },
} as const;

export const chartPalette = [
  { ...semanticTokens.chart.series1, dash: "solid", label: "Series 1", literal: primitiveTokens.color.orange400.value, pointShape: "circle" },
  { ...semanticTokens.chart.series2, dash: "8 4", label: "Series 2", literal: primitiveTokens.color.blue400.value, pointShape: "square" },
  { ...semanticTokens.chart.series3, dash: "2 3", label: "Series 3", literal: primitiveTokens.color.purple400.value, pointShape: "triangle" },
  { ...semanticTokens.chart.series4, dash: "8 3 2 3", label: "Series 4", literal: primitiveTokens.color.cyan400.value, pointShape: "diamond" },
  { ...semanticTokens.chart.series5, dash: "12 4", label: "Series 5", literal: primitiveTokens.color.yellow400.value, pointShape: "cross" },
  { ...semanticTokens.chart.series6, dash: "4 3", label: "Series 6", literal: primitiveTokens.color.pink400.value, pointShape: "star" },
  { ...semanticTokens.chart.series7, dash: "10 3 3 3", label: "Series 7", literal: primitiveTokens.color.green400.value, pointShape: "plus" },
] as const;

export type PrimitiveTokenRegistry = typeof primitiveTokens;
export type SemanticTokenRegistry = typeof semanticTokens;
export type ComponentTokenRegistry = typeof componentTokens;

export type TokenCatalogEntry = TokenDefinition & {
  readonly group: string;
  readonly key: string;
  readonly layer: TokenLayer;
};

const isToken = (value: unknown): value is TokenDefinition =>
  typeof value === "object" && value !== null && "cssVar" in value && "value" in value;

const collectTokens = (registry: object, layer: TokenLayer, path: readonly string[] = []): TokenCatalogEntry[] =>
  Object.entries(registry).flatMap(([key, value]) => {
    const nextPath = [...path, key];
    if (isToken(value)) {
      return [{ ...value, group: path[0] ?? key, key: `${layer}Tokens.${nextPath.join(".")}`, layer }];
    }
    return collectTokens(value as object, layer, nextPath);
  });

export const tokenCatalog = [
  ...collectTokens(primitiveTokens, "primitive"),
  ...collectTokens(semanticTokens, "semantic"),
  ...collectTokens(componentTokens, "component"),
] as const satisfies readonly TokenCatalogEntry[];

export type TokenCatalogKey = (typeof tokenCatalog)[number]["key"];
export type PulmuCssVariable = (typeof tokenCatalog)[number]["cssVar"];
