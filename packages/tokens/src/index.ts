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

export type ColorThemeName = "light" | "dark";

export type IronAndEmberPalette = {
  readonly canvas: string;
  readonly surface: string;
  readonly surfaceSubtle: string;
  readonly surfaceHover: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly brand: string;
  readonly brandHover: string;
  readonly brandSoft: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly info: string;
};

/** Exact source palettes. Consume semantic tokens in product UI rather than these literals. */
export const ironAndEmberPalettes = {
  light: {
    canvas: "#F7F7F5",
    surface: "#FFFFFF",
    surfaceSubtle: "#F1F1EE",
    surfaceHover: "#ECEDEA",
    border: "#DADCD8",
    borderStrong: "#BEC2BE",
    textPrimary: "#1B1D1F",
    textSecondary: "#62676C",
    textMuted: "#8D9297",
    brand: "#D85B26",
    brandHover: "#BF491B",
    brandSoft: "#FFF0E8",
    success: "#3F8F62",
    warning: "#C28A2E",
    danger: "#C65353",
    info: "#4D78A8",
  },
  dark: {
    canvas: "#111315",
    surface: "#171A1D",
    surfaceSubtle: "#1D2125",
    surfaceHover: "#24292E",
    border: "#2D3338",
    borderStrong: "#3A4147",
    textPrimary: "#F3F4F2",
    textSecondary: "#A8AFB5",
    textMuted: "#747C83",
    brand: "#E66A32",
    brandHover: "#F0783D",
    brandSoft: "#342018",
    success: "#54A875",
    warning: "#D5A043",
    danger: "#D66565",
    info: "#6590BE",
  },
} as const satisfies Record<ColorThemeName, IronAndEmberPalette>;

const light = ironAndEmberPalettes.light;
const dark = ironAndEmberPalettes.dark;

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
    theme: {
      light: {
        canvas: token("--pulmu-color-light-canvas", light.canvas, "Ivory canvas", "Light theme canvas"),
        surface: token("--pulmu-color-light-surface", light.surface, "White surface", "Light theme panels"),
        surfaceSubtle: token("--pulmu-color-light-surface-subtle", light.surfaceSubtle, "Subtle steel surface", "Light theme grouped regions"),
        surfaceHover: token("--pulmu-color-light-surface-hover", light.surfaceHover, "Hover steel surface", "Light theme hover states"),
        border: token("--pulmu-color-light-border", light.border, "Subtle boundary", "Light theme decorative boundaries"),
        borderStrong: token("--pulmu-color-light-border-strong", light.borderStrong, "Strong subtle boundary", "Light theme structural boundaries"),
        textPrimary: token("--pulmu-color-light-text-primary", light.textPrimary, "Primary ink", "Light theme primary text"),
        textSecondary: token("--pulmu-color-light-text-secondary", light.textSecondary, "Secondary ink", "Light theme supporting text"),
        textMuted: token("--pulmu-color-light-text-muted", light.textMuted, "Muted ink", "Non-essential light theme metadata only"),
        brand: token("--pulmu-color-light-brand", light.brand, "Pulmu Ember", "Light theme brand accent"),
        brandHover: token("--pulmu-color-light-brand-hover", light.brandHover, "Deep Ember", "Light theme brand hover"),
        brandSoft: token("--pulmu-color-light-brand-soft", light.brandSoft, "Soft Ember", "Light theme selected backgrounds"),
        success: token("--pulmu-color-light-success", light.success, "Success green", "Light theme success accent"),
        warning: token("--pulmu-color-light-warning", light.warning, "Warning amber", "Light theme warning accent"),
        danger: token("--pulmu-color-light-danger", light.danger, "Danger red", "Light theme danger accent"),
        info: token("--pulmu-color-light-info", light.info, "Information blue", "Light theme information accent"),
      },
      dark: {
        canvas: token("--pulmu-color-dark-canvas", dark.canvas, "Coal canvas", "Dark theme canvas"),
        surface: token("--pulmu-color-dark-surface", dark.surface, "Iron surface", "Dark theme panels"),
        surfaceSubtle: token("--pulmu-color-dark-surface-subtle", dark.surfaceSubtle, "Subtle iron surface", "Dark theme grouped regions"),
        surfaceHover: token("--pulmu-color-dark-surface-hover", dark.surfaceHover, "Hover iron surface", "Dark theme hover states"),
        border: token("--pulmu-color-dark-border", dark.border, "Subtle dark boundary", "Dark theme decorative boundaries"),
        borderStrong: token("--pulmu-color-dark-border-strong", dark.borderStrong, "Strong dark boundary", "Dark theme structural boundaries"),
        textPrimary: token("--pulmu-color-dark-text-primary", dark.textPrimary, "Primary ivory", "Dark theme primary text"),
        textSecondary: token("--pulmu-color-dark-text-secondary", dark.textSecondary, "Secondary steel", "Dark theme supporting text"),
        textMuted: token("--pulmu-color-dark-text-muted", dark.textMuted, "Muted steel", "Non-essential dark theme metadata only"),
        brand: token("--pulmu-color-dark-brand", dark.brand, "Pulmu Ember", "Dark theme brand accent"),
        brandHover: token("--pulmu-color-dark-brand-hover", dark.brandHover, "Bright Ember", "Dark theme brand hover"),
        brandSoft: token("--pulmu-color-dark-brand-soft", dark.brandSoft, "Soft Ember", "Dark theme selected backgrounds"),
        success: token("--pulmu-color-dark-success", dark.success, "Success green", "Dark theme success accent"),
        warning: token("--pulmu-color-dark-warning", dark.warning, "Warning amber", "Dark theme warning accent"),
        danger: token("--pulmu-color-dark-danger", dark.danger, "Danger red", "Dark theme danger accent"),
        info: token("--pulmu-color-dark-info", dark.info, "Information blue", "Dark theme information accent"),
      },
    },
    accessible: {
      lightBoundary: token("--pulmu-color-light-boundary-accessible", "#797F79", "Accessible light boundary", "Sole visual boundary on light surfaces"),
      darkBoundary: token("--pulmu-color-dark-boundary-accessible", "#6F7880", "Accessible dark boundary", "Sole visual boundary on dark surfaces"),
      lightActionHover: token("--pulmu-color-light-action-hover", "#A83B13", "Accessible light action hover", "Primary action hover fill"),
      lightActionPressed: token("--pulmu-color-light-action-pressed", "#8F3110", "Accessible light action pressed", "Primary action pressed fill"),
      darkActionPressed: token("--pulmu-color-dark-action-pressed", "#D05A25", "Accessible dark action pressed", "Primary action pressed fill"),
      lightMutedText: token("--pulmu-color-light-muted-text-accessible", "#666B6F", "Accessible light muted text", "Small supporting text on light surfaces"),
      darkMutedText: token("--pulmu-color-dark-muted-text-accessible", "#8B939A", "Accessible dark muted text", "Small supporting text on dark surfaces"),
      lightDangerActionText: token("--pulmu-color-light-danger-action-text", "#FFFFFF", "Light danger action text", "Danger button foreground on light surfaces"),
      darkDangerActionText: token("--pulmu-color-dark-danger-action-text", "#000000", "Dark danger action text", "Danger button foreground on dark surfaces"),
      darkDangerText: token("--pulmu-color-dark-danger-text", "#ED8383", "Accessible dark danger text", "Danger text and legacy danger fills"),
      darkInfoText: token("--pulmu-color-dark-info-text", "#6F9AC8", "Accessible dark information text", "Information text on subtle dark fill"),
      lightSuccessText: token("--pulmu-color-light-success-text", "#276B46", "Accessible success text", "Success text on subtle light fill"),
      lightWarningText: token("--pulmu-color-light-warning-text", "#765315", "Accessible warning text", "Warning text on subtle light fill"),
      lightDangerText: token("--pulmu-color-light-danger-text", "#923838", "Accessible danger text", "Danger text on subtle light fill"),
      lightInfoText: token("--pulmu-color-light-info-text", "#365E88", "Accessible information text", "Information text on subtle light fill"),
      lightSuccessSubtle: token("--pulmu-color-light-success-subtle", "#E8F3EC", "Subtle success fill", "Light theme success badge background"),
      lightWarningSubtle: token("--pulmu-color-light-warning-subtle", "#FAF1DE", "Subtle warning fill", "Light theme warning badge background"),
      lightDangerSubtle: token("--pulmu-color-light-danger-subtle", "#FAEAEA", "Subtle danger fill", "Light theme danger badge background"),
      lightInfoSubtle: token("--pulmu-color-light-info-subtle", "#EAF0F7", "Subtle information fill", "Light theme information badge background"),
      darkSuccessSubtle: token("--pulmu-color-dark-success-subtle", "#1B2B22", "Subtle success fill", "Dark theme success badge background"),
      darkWarningSubtle: token("--pulmu-color-dark-warning-subtle", "#2D281B", "Subtle warning fill", "Dark theme warning badge background"),
      darkDangerSubtle: token("--pulmu-color-dark-danger-subtle", "#302021", "Subtle danger fill", "Dark theme danger badge background"),
      darkInfoSubtle: token("--pulmu-color-dark-info-subtle", "#1C2936", "Subtle information fill", "Dark theme information badge background"),
    },
    sidebar: {
      lightBg: token("--pulmu-color-light-sidebar-bg", "#F1F1EE", "Light sidebar", "Light sidebar background"),
      lightHover: token("--pulmu-color-light-sidebar-hover", "#E7E7E3", "Light sidebar hover", "Light sidebar hover state"),
      lightActive: token("--pulmu-color-light-sidebar-active", "#FFF0E8", "Light sidebar active", "Light sidebar active state"),
      lightText: token("--pulmu-color-light-sidebar-text", "#303438", "Light sidebar text", "Light sidebar labels"),
      lightTextMuted: token("--pulmu-color-light-sidebar-text-muted", "#62676C", "Light sidebar muted text", "Light sidebar metadata"),
      lightAccent: token("--pulmu-color-light-sidebar-accent", "#BF491B", "Light sidebar Ember", "Light sidebar active indicator"),
      darkBg: token("--pulmu-color-dark-sidebar-bg", "#15191D", "Dark sidebar", "Dark sidebar background"),
      darkHover: token("--pulmu-color-dark-sidebar-hover", "#1D2328", "Dark sidebar hover", "Dark sidebar hover state"),
      darkActive: token("--pulmu-color-dark-sidebar-active", "#28241F", "Dark sidebar active", "Dark sidebar active state"),
      darkText: token("--pulmu-color-dark-sidebar-text", "#D7DBDE", "Dark sidebar text", "Dark sidebar labels"),
      darkTextMuted: token("--pulmu-color-dark-sidebar-text-muted", "#818991", "Dark sidebar muted text", "Dark sidebar metadata"),
      darkAccent: token("--pulmu-color-dark-sidebar-accent", "#E66A32", "Dark sidebar Ember", "Dark sidebar active indicator"),
    },
    chart: {
      lightWarning: token("--pulmu-color-light-chart-warning", "#9B6818", "Accessible chart amber", "Light chart series"),
      lightTeal: token("--pulmu-color-light-chart-teal", "#317D78", "Accessible chart teal", "Light chart series"),
      darkTeal: token("--pulmu-color-dark-chart-teal", "#65AFA9", "Accessible chart teal", "Dark chart series"),
    },
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
  token("--pulmu-color-status-running", "var(--pulmu-color-status-info-foreground)", "Running status", "Running text and icon"),
  token("--pulmu-color-status-completed", "var(--pulmu-color-status-success-foreground)", "Completed status", "Completed text and icon"),
  token("--pulmu-color-status-failed", "var(--pulmu-color-status-danger-foreground)", "Failed status", "Failed text and icon"),
  token("--pulmu-color-status-interrupted", "var(--pulmu-color-status-warning-foreground)", "Interrupted status", "Interrupted text and icon"),
] as const satisfies readonly TokenDefinition[];

const stageStatusPalette = [
  token("--pulmu-color-stage-status-pending", "var(--pulmu-color-text-muted)", "Pending stage", "Pending text and icon with a text label"),
  token("--pulmu-color-stage-status-in-progress", "var(--pulmu-color-brand-default)", "Current stage", "Current stage accent with a text label"),
  token("--pulmu-color-stage-status-completed", "var(--pulmu-color-status-success-foreground)", "Completed stage", "Completed text and icon"),
  token("--pulmu-color-stage-status-failed", "var(--pulmu-color-status-danger-foreground)", "Failed stage", "Failed text and icon"),
  token("--pulmu-color-stage-status-interrupted", "var(--pulmu-color-status-warning-foreground)", "Interrupted stage", "Interrupted text and icon"),
] as const satisfies readonly TokenDefinition[];

const stagePalette = [
  token("--pulmu-color-stage-ignite", "var(--pulmu-color-text-secondary)", "Deprecated Ignite identity alias", "Use stage status tokens"),
  token("--pulmu-color-stage-inspect", "var(--pulmu-color-text-secondary)", "Deprecated Inspect identity alias", "Use stage status tokens"),
  token("--pulmu-color-stage-shape", "var(--pulmu-color-text-secondary)", "Deprecated Shape identity alias", "Use stage status tokens"),
  token("--pulmu-color-stage-hammer", "var(--pulmu-color-text-secondary)", "Deprecated Hammer identity alias", "Use stage status tokens"),
  token("--pulmu-color-stage-quench", "var(--pulmu-color-text-secondary)", "Deprecated Quench identity alias", "Use stage status tokens"),
  token("--pulmu-color-stage-hone", "var(--pulmu-color-text-secondary)", "Deprecated Hone identity alias", "Use stage status tokens"),
  token("--pulmu-color-stage-ship", "var(--pulmu-color-text-secondary)", "Deprecated Ship identity alias", "Use stage status tokens"),
] as const satisfies readonly TokenDefinition[];

const mapCanonicalTokens = <Key extends string>(keys: readonly Key[], values: readonly TokenDefinition[]) =>
  Object.fromEntries(keys.map((key, index) => [key, values[index]])) as Record<Key, TokenDefinition>;

export const runStatusTokens = mapCanonicalTokens<PulmuRunStatus>(PULMU_RUN_STATUSES, runStatusPalette);
export const stageStatusTokens = mapCanonicalTokens<PulmuStageStatus>(PULMU_STAGE_STATUSES, stageStatusPalette);
export const stageTokens = mapCanonicalTokens<PulmuStageId>(PULMU_STAGES.map(({ id }) => id), stagePalette);

export const semanticTokens = {
  color: {
    canvas: token("--pulmu-color-surface-canvas", "var(--pulmu-color-dark-canvas)", "Canvas surface", "Page background"),
    surface: token("--pulmu-color-surface-default", "var(--pulmu-color-dark-surface)", "Default surface", "Panels and cards"),
    surfaceSubtle: token("--pulmu-color-surface-subtle", "var(--pulmu-color-dark-surface-subtle)", "Subtle surface", "Grouped regions and inset content"),
    surfaceHover: token("--pulmu-color-surface-hover", "var(--pulmu-color-dark-surface-hover)", "Hover surface", "Neutral hover state"),
    surfaceElevated: token("--pulmu-color-surface-elevated", "var(--pulmu-color-surface-subtle)", "Deprecated elevated surface alias", "Use surfaceSubtle"),
    border: token("--pulmu-color-border-default", "var(--pulmu-color-dark-border)", "Default boundary", "Decorative and multiply reinforced boundaries"),
    borderStrong: token("--pulmu-color-border-strong", "var(--pulmu-color-dark-border-strong)", "Strong boundary", "Structural boundaries reinforced by layout"),
    borderInteractive: token("--pulmu-color-border-interactive", "var(--pulmu-color-dark-boundary-accessible)", "Accessible interactive boundary", "Sole control and focus-adjacent boundaries"),
    text: token("--pulmu-color-text-primary", "var(--pulmu-color-dark-text-primary)", "Primary text", "Body and headings"),
    textSecondary: token("--pulmu-color-text-secondary", "var(--pulmu-color-dark-text-secondary)", "Secondary text", "Supporting and required text"),
    textMuted: token("--pulmu-color-text-muted", "var(--pulmu-color-dark-muted-text-accessible)", "Muted text compatibility alias", "Small supporting text; exact palette muted is decorative only"),
    textInverse: token("--pulmu-color-text-inverse", "var(--pulmu-color-neutral-950)", "Inverse text", "Dark text on bright fills"),
    brand: token("--pulmu-color-brand-default", "var(--pulmu-color-dark-brand)", "Pulmu Ember", "Logo, selected state, focus, and current Forge stage"),
    brandHover: token("--pulmu-color-brand-hover", "var(--pulmu-color-dark-brand-hover)", "Pulmu Ember hover", "Brand-accent hover state"),
    brandSoft: token("--pulmu-color-brand-soft", "var(--pulmu-color-dark-brand-soft)", "Pulmu Ember soft", "Selected and active backgrounds"),
    action: token("--pulmu-color-action-default", "var(--pulmu-color-dark-brand)", "Default action", "Primary action fill and important links"),
    actionHover: token("--pulmu-color-action-hover", "var(--pulmu-color-dark-brand-hover)", "Hover action", "Primary action hover state"),
    actionPressed: token("--pulmu-color-action-pressed", "var(--pulmu-color-dark-action-pressed)", "Pressed action", "Primary action pressed state"),
    actionText: token("--pulmu-color-action-text", "var(--pulmu-color-dark-canvas)", "Action foreground", "Text and icons on primary actions"),
    dangerActionText: token("--pulmu-color-danger-action-text", "var(--pulmu-color-dark-danger-action-text)", "Danger action foreground", "Danger button text across default, hover, and active fills"),
    focus: token("--pulmu-color-focus-ring", "var(--pulmu-color-dark-brand)", "Focus ring", "Keyboard focus on every surface"),
    statusSuccess: token("--pulmu-color-status-success", "var(--pulmu-color-dark-success)", "Success accent", "Icons and non-text success accents"),
    statusWarning: token("--pulmu-color-status-warning", "var(--pulmu-color-dark-warning)", "Warning accent", "Icons and non-text warning accents"),
    statusDanger: token("--pulmu-color-status-danger", "var(--pulmu-color-dark-danger)", "Danger accent", "Icons and non-text danger accents"),
    statusInfo: token("--pulmu-color-status-info", "var(--pulmu-color-dark-info)", "Information accent", "Icons and non-text information accents"),
    statusSuccessForeground: token("--pulmu-color-status-success-foreground", "var(--pulmu-color-dark-success)", "Success foreground", "Accessible success badge text"),
    statusWarningForeground: token("--pulmu-color-status-warning-foreground", "var(--pulmu-color-dark-warning)", "Warning foreground", "Accessible warning badge text"),
    statusDangerForeground: token("--pulmu-color-status-danger-foreground", "var(--pulmu-color-dark-danger-text)", "Danger foreground", "Accessible danger badge text"),
    statusInfoForeground: token("--pulmu-color-status-info-foreground", "var(--pulmu-color-dark-info-text)", "Information foreground", "Accessible information badge text"),
    statusSuccessSubtle: token("--pulmu-color-status-success-subtle", "var(--pulmu-color-dark-success-subtle)", "Success subtle fill", "Success badge background"),
    statusWarningSubtle: token("--pulmu-color-status-warning-subtle", "var(--pulmu-color-dark-warning-subtle)", "Warning subtle fill", "Warning badge background"),
    statusDangerSubtle: token("--pulmu-color-status-danger-subtle", "var(--pulmu-color-dark-danger-subtle)", "Danger subtle fill", "Danger badge background"),
    statusInfoSubtle: token("--pulmu-color-status-info-subtle", "var(--pulmu-color-dark-info-subtle)", "Information subtle fill", "Information badge background"),
    sidebarBg: token("--pulmu-color-sidebar-bg", "var(--pulmu-color-dark-sidebar-bg)", "Sidebar background", "App sidebar"),
    sidebarHover: token("--pulmu-color-sidebar-hover", "var(--pulmu-color-dark-sidebar-hover)", "Sidebar hover", "Sidebar item hover"),
    sidebarActive: token("--pulmu-color-sidebar-active", "var(--pulmu-color-dark-sidebar-active)", "Sidebar active", "Active sidebar item background"),
    sidebarText: token("--pulmu-color-sidebar-text", "var(--pulmu-color-dark-sidebar-text)", "Sidebar text", "Sidebar labels"),
    sidebarTextMuted: token("--pulmu-color-sidebar-text-muted", "var(--pulmu-color-dark-sidebar-text-muted)", "Sidebar muted text", "Sidebar metadata"),
    sidebarAccent: token("--pulmu-color-sidebar-accent", "var(--pulmu-color-dark-sidebar-accent)", "Sidebar Ember", "Active sidebar indicator"),
  },
  typography: {
    headingFamily: token("--pulmu-typography-heading-family", "var(--pulmu-font-family-sans)", "Heading family", "Page and section headings"),
    headingPageSize: token("--pulmu-typography-heading-page-size", "var(--pulmu-font-size-xl)", "Page heading size", "Page headings"),
    headingSectionSize: token("--pulmu-typography-heading-section-size", "var(--pulmu-font-size-lg)", "Section heading size", "Section headings"),
    headingLineHeight: token("--pulmu-typography-heading-line-height", "var(--pulmu-line-height-tight)", "Heading leading", "Page and section headings"),
    headingWeight: token("--pulmu-typography-heading-weight", "var(--pulmu-font-weight-bold)", "Heading weight", "Page and section headings"),
    bodyFamily: token("--pulmu-typography-body-family", "var(--pulmu-font-family-sans)", "Body family", "Interface copy"),
    bodySize: token("--pulmu-typography-body-size", "var(--pulmu-font-size-md)", "Body size", "Interface copy"),
    bodyLineHeight: token("--pulmu-typography-body-line-height", "var(--pulmu-line-height-normal)", "Body leading", "Interface copy"),
    bodyWeight: token("--pulmu-typography-body-weight", "var(--pulmu-font-weight-regular)", "Body weight", "Interface copy"),
    labelFamily: token("--pulmu-typography-label-family", "var(--pulmu-font-family-sans)", "Label family", "Controls and compact labels"),
    labelSize: token("--pulmu-typography-label-size", "var(--pulmu-font-size-sm)", "Label size", "Controls and compact labels"),
    labelLineHeight: token("--pulmu-typography-label-line-height", "var(--pulmu-line-height-normal)", "Label leading", "Controls and compact labels"),
    labelWeight: token("--pulmu-typography-label-weight", "var(--pulmu-font-weight-medium)", "Label weight", "Controls and compact labels"),
    captionFamily: token("--pulmu-typography-caption-family", "var(--pulmu-font-family-sans)", "Caption family", "Metadata and supporting text"),
    captionSize: token("--pulmu-typography-caption-size", "var(--pulmu-font-size-xs)", "Caption size", "Metadata and supporting text"),
    captionLineHeight: token("--pulmu-typography-caption-line-height", "var(--pulmu-line-height-normal)", "Caption leading", "Metadata and supporting text"),
    captionWeight: token("--pulmu-typography-caption-weight", "var(--pulmu-font-weight-regular)", "Caption weight", "Metadata and supporting text"),
    metricFamily: token("--pulmu-typography-metric-family", "var(--pulmu-font-family-sans)", "Metric family", "KPI and metric values"),
    metricSize: token("--pulmu-typography-metric-size", "var(--pulmu-font-size-xl)", "Metric size", "KPI and metric values"),
    metricLineHeight: token("--pulmu-typography-metric-line-height", "var(--pulmu-line-height-tight)", "Metric leading", "KPI and metric values"),
    metricWeight: token("--pulmu-typography-metric-weight", "var(--pulmu-font-weight-bold)", "Metric weight", "KPI and metric values"),
    metricVariantNumeric: token("--pulmu-typography-metric-variant-numeric", "tabular-nums", "Metric numeral alignment", "KPI and changing metric values"),
    codeFamily: token("--pulmu-typography-code-family", "var(--pulmu-font-family-mono)", "Code family", "Code and token values"),
    codeSize: token("--pulmu-typography-code-size", "var(--pulmu-font-size-sm)", "Code size", "Branches, commits, agents, and code"),
    codeLineHeight: token("--pulmu-typography-code-line-height", "var(--pulmu-line-height-normal)", "Code leading", "Branches, commits, agents, and code"),
    codeWeight: token("--pulmu-typography-code-weight", "var(--pulmu-font-weight-regular)", "Code weight", "Branches, commits, agents, and code"),
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
    series1: token("--pulmu-chart-series-1", "var(--pulmu-color-brand-default)", "Chart series 1", "Solid circle series"),
    series2: token("--pulmu-chart-series-2", "var(--pulmu-color-status-info)", "Chart series 2", "Dashed square series"),
    series3: token("--pulmu-chart-series-3", "var(--pulmu-color-status-success)", "Chart series 3", "Dotted triangle series"),
    series4: token("--pulmu-chart-series-4", "var(--pulmu-color-status-warning)", "Chart series 4", "Dash-dot diamond series"),
    series5: token("--pulmu-chart-series-5", "var(--pulmu-color-status-danger)", "Chart series 5", "Long-dash cross series"),
    series6: token("--pulmu-chart-series-6", "var(--pulmu-color-text-secondary)", "Chart series 6", "Short-dash star series"),
    series7: token("--pulmu-chart-series-7", "var(--pulmu-color-dark-chart-teal)", "Chart series 7", "Double-dash plus series"),
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
  { ...semanticTokens.chart.series1, dash: "solid", label: "Series 1", literal: dark.brand, literals: { light: light.brand, dark: dark.brand }, pointShape: "circle" },
  { ...semanticTokens.chart.series2, dash: "8 4", label: "Series 2", literal: dark.info, literals: { light: light.info, dark: dark.info }, pointShape: "square" },
  { ...semanticTokens.chart.series3, dash: "2 3", label: "Series 3", literal: dark.success, literals: { light: light.success, dark: dark.success }, pointShape: "triangle" },
  { ...semanticTokens.chart.series4, dash: "8 3 2 3", label: "Series 4", literal: dark.warning, literals: { light: primitiveTokens.color.chart.lightWarning.value, dark: dark.warning }, pointShape: "diamond" },
  { ...semanticTokens.chart.series5, dash: "12 4", label: "Series 5", literal: dark.danger, literals: { light: light.danger, dark: dark.danger }, pointShape: "cross" },
  { ...semanticTokens.chart.series6, dash: "4 3", label: "Series 6", literal: dark.textSecondary, literals: { light: light.textSecondary, dark: dark.textSecondary }, pointShape: "star" },
  { ...semanticTokens.chart.series7, dash: "10 3 3 3", label: "Series 7", literal: primitiveTokens.color.chart.darkTeal.value, literals: { light: primitiveTokens.color.chart.lightTeal.value, dark: primitiveTokens.color.chart.darkTeal.value }, pointShape: "plus" },
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
