import { type HTMLAttributes, type ReactNode } from "react";
import { PulmuIcon, PULMU_RUN_STATUS_ICONS, UI_ICONS } from "@pulmu/icons";
import { classes } from "./internal";
import type { Tone } from "./content";

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Accessible and visible name for the operation. */
  readonly label: string;
  /** Positive finite upper bound; invalid values safely normalize to 100. */
  readonly max?: number;
  /** Determinate value clamped to 0…max; omit for an indeterminate progress bar. */
  readonly value?: number;
};

export function Progress({ className, label, max = 100, value, ...props }: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = value === undefined ? undefined : Math.min(safeMax, Math.max(0, Number.isFinite(value) ? value : 0));
  const percent = safeValue === undefined ? undefined : (safeValue / safeMax) * 100;
  return (
    <div {...props} className={classes("pulmu-progress", value === undefined && "pulmu-progress--indeterminate", className)}>
      <div className="pulmu-progress__label"><span>{label}</span>{value === undefined ? null : <span>{Math.round(percent!)}%</span>}</div>
      <div aria-label={label} aria-valuemax={safeMax} aria-valuemin={0} aria-valuenow={safeValue} className="pulmu-progress__track" role="progressbar">
        <span className="pulmu-progress__value" style={{ width: value === undefined ? undefined : `${percent}%` }} />
      </div>
    </div>
  );
}

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  /** Hides the spinner from assistive technology when adjacent text already announces progress. */
  readonly decorative?: boolean;
  /** Status text announced while the spinner is visible. */
  readonly label: string;
  /** Icon size: 16px `sm` or 20px `md`. */
  readonly size?: "sm" | "md";
};

export function Spinner({ className, decorative = false, label, size = "md", ...props }: SpinnerProps) {
  return (
    <span {...props} aria-hidden={decorative || undefined} className={classes("pulmu-spinner", `pulmu-spinner--${size}`, className)} role={decorative ? undefined : "status"}>
      <PulmuIcon decorative icon={PULMU_RUN_STATUS_ICONS.running} size={size} />
      {decorative ? null : <span className="pulmu-visually-hidden">{label}</span>}
    </span>
  );
}

export function Skeleton({ className, label = "Loading content", ...props }: HTMLAttributes<HTMLDivElement> & {
  /** Accessible loading description for the placeholder. */
  readonly label?: string;
}) {
  return <div {...props} aria-label={label} aria-live="polite" aria-busy="true" className={classes("pulmu-skeleton", className)} role="status" />;
}

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  /** Short status heading read before the supporting message. */
  readonly title: ReactNode;
  /** Status intent; danger uses assertive alert semantics, other tones use polite status. */
  readonly tone?: Exclude<Tone, "neutral">;
};

export function Alert({ children, className, title, tone = "info", ...props }: AlertProps) {
  return (
    <div {...props} className={classes("pulmu-alert", `pulmu-tone--${tone}`, className)} role={tone === "danger" ? "alert" : "status"}>
      <PulmuIcon decorative icon={tone === "success" ? PULMU_RUN_STATUS_ICONS.completed : tone === "danger" ? PULMU_RUN_STATUS_ICONS.failed : UI_ICONS.info} />
      <div><strong>{title}</strong>{children ? <div>{children}</div> : null}</div>
    </div>
  );
}

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  /** Optional recovery or creation control. */
  readonly action?: ReactNode;
  /** Concise explanation and next-step context. */
  readonly description: ReactNode;
  /** State heading. */
  readonly title: ReactNode;
};

export function EmptyState({ action, className, description, title, ...props }: EmptyStateProps) {
  return <div {...props} className={classes("pulmu-empty-state", className)}><h2>{title}</h2><p>{description}</p>{action}</div>;
}

export function ErrorState(props: EmptyStateProps) {
  return <EmptyState {...props} className={classes("pulmu-error-state", props.className)} role="alert" />;
}
