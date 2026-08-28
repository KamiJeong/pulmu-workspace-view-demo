import { type HTMLAttributes, type ReactNode } from "react";
import { PulmuIcon, PULMU_RUN_STATUS_ICONS, UI_ICONS } from "@pulmu/icons";
import { classes } from "./internal";
import type { Tone } from "./content";

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly label: string;
  readonly max?: number;
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

export function Spinner({ className, label, size = "md", ...props }: HTMLAttributes<HTMLSpanElement> & { readonly label: string; readonly size?: "sm" | "md" }) {
  return (
    <span {...props} className={classes("pulmu-spinner", `pulmu-spinner--${size}`, className)} role="status">
      <PulmuIcon decorative icon={PULMU_RUN_STATUS_ICONS.running} size={size} />
      <span className="pulmu-visually-hidden">{label}</span>
    </span>
  );
}

export function Skeleton({ className, label = "Loading content", ...props }: HTMLAttributes<HTMLDivElement> & { readonly label?: string }) {
  return <div {...props} aria-label={label} aria-live="polite" aria-busy="true" className={classes("pulmu-skeleton", className)} role="status" />;
}

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  readonly title: ReactNode;
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
  readonly action?: ReactNode;
  readonly description: ReactNode;
  readonly title: ReactNode;
};

export function EmptyState({ action, className, description, title, ...props }: EmptyStateProps) {
  return <div {...props} className={classes("pulmu-empty-state", className)}><h2>{title}</h2><p>{description}</p>{action}</div>;
}

export function ErrorState(props: EmptyStateProps) {
  return <EmptyState {...props} className={classes("pulmu-error-state", props.className)} role="alert" />;
}
