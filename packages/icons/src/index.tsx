import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";

import {
  BadgeCheck,
  ChevronDown,
  CircleCheck,
  CircleDashed,
  CirclePause,
  CircleX,
  DraftingCompass,
  ExternalLink,
  Flame,
  Hammer,
  Info,
  LoaderCircle,
  Menu,
  PackageCheck,
  Palette,
  Plus,
  Search,
  Settings,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  PULMU_PATTERN_PASS,
  PULMU_STAGES,
  type PulmuRunStatus,
  type PulmuStageId,
  type PulmuStageStatus,
} from "@pulmu/model";

export const PULMU_ICONS_PACKAGE = "@pulmu/icons" as const;

export const ICON_SIZES = {
  sm: "var(--pulmu-size-icon-sm)",
  md: "var(--pulmu-size-icon-md)",
} as const;
export type IconSize = keyof typeof ICON_SIZES;

export const ICON_STROKE_WIDTH = 2 as const;

export const UI_ICONS = {
  add: Plus,
  chevronDown: ChevronDown,
  close: X,
  externalLink: ExternalLink,
  info: Info,
  menu: Menu,
  search: Search,
  settings: Settings,
} as const satisfies Record<string, LucideIcon>;

export const PULMU_RUN_STATUS_ICONS = {
  running: LoaderCircle,
  completed: CircleCheck,
  failed: CircleX,
  interrupted: CirclePause,
} as const satisfies Record<PulmuRunStatus, LucideIcon>;

export const PULMU_STAGE_STATUS_ICONS = {
  pending: CircleDashed,
  in_progress: LoaderCircle,
  completed: CircleCheck,
  failed: CircleX,
  interrupted: CirclePause,
} as const satisfies Record<PulmuStageStatus, LucideIcon>;

const STAGE_GLYPHS = {
  ignite: Flame,
  inspect: Search,
  shape: DraftingCompass,
  hammer: Hammer,
  quench: Waves,
  hone: BadgeCheck,
  ship: PackageCheck,
} as const satisfies Record<PulmuStageId, LucideIcon>;

export const PULMU_STAGE_ICONS = PULMU_STAGES.map((stage) => ({
  ...stage,
  glyph: STAGE_GLYPHS[stage.id],
})) satisfies readonly ((typeof PULMU_STAGES)[number] & { readonly glyph: LucideIcon })[];

export const PULMU_PATTERN_ICON = {
  ...PULMU_PATTERN_PASS,
  glyph: Palette,
} as const;

export const BRAND_ICONS = {
  pulmu: Flame,
} as const satisfies Record<string, LucideIcon>;

type LucideProps = ComponentPropsWithoutRef<LucideIcon>;

type PulmuIconBaseProps = Omit<
  LucideProps,
  "aria-hidden" | "aria-label" | "focusable" | "role" | "size" | "strokeWidth"
> & {
  readonly icon: LucideIcon;
  readonly size?: IconSize;
};

export type PulmuIconProps = PulmuIconBaseProps &
  (
    | { readonly decorative: true; readonly label?: never }
    | { readonly decorative: false; readonly label: string }
  );

/**
 * Applies Pulmu's size, stroke, and SVG accessibility contract to a Lucide glyph.
 * Icon-only controls keep their accessible name on the parent control and pass
 * `decorative` here so the SVG does not duplicate that name.
 */
export function PulmuIcon({
  decorative,
  icon: Icon,
  label,
  size = "md",
  ...props
}: PulmuIconProps) {
  return (
    <Icon
      {...props}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
      role={decorative ? undefined : "img"}
      size={ICON_SIZES[size]}
      strokeWidth={ICON_STROKE_WIDTH}
    />
  );
}

export type LoadingIconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  readonly label: string;
  readonly size?: IconSize;
};

/** A visible, announced loading state whose rotation stops under reduced motion. */
export function LoadingIcon({ className, label, size = "md", ...props }: LoadingIconProps) {
  const classes = ["pulmu-loading-icon", className].filter(Boolean).join(" ");

  return (
    <span {...props} className={classes} role="status">
      <PulmuIcon
        className="pulmu-loading-icon__glyph"
        decorative
        icon={PULMU_RUN_STATUS_ICONS.running}
        size={size}
      />
      <span className="pulmu-loading-icon__label">{label}</span>
    </span>
  );
}
