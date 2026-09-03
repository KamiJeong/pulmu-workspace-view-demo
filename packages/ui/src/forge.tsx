import { useId, type HTMLAttributes, type ReactNode } from "react";
import {
  PULMU_FORGE_MODES,
  PULMU_PATTERN_PASS,
  PULMU_RETRY_POLICIES,
  PULMU_STAGES,
  type PulmuDeliveryView,
  type PulmuForgeMode,
  type PulmuRiskLevel,
  type PulmuRunStatus,
  type PulmuRunViewModel,
  type PulmuStageId,
  type PulmuStageStatus,
} from "@pulmu/model";
import {
  PULMU_PATTERN_ICON,
  PULMU_RUN_STATUS_ICONS,
  PULMU_STAGE_ICONS,
  PULMU_STAGE_STATUS_ICONS,
  PulmuIcon,
} from "@pulmu/icons";

import { classes } from "./internal";

const stageStatusLabels: Record<PulmuStageStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
  interrupted: "Interrupted",
};

const runStatusLabels: Record<PulmuRunStatus, string> = {
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  interrupted: "Interrupted",
};

const stageById = new Map(PULMU_STAGES.map((stage) => [stage.id, stage]));
const stageIconById = new Map(PULMU_STAGE_ICONS.map((stage) => [stage.id, stage.glyph]));

export type ForgeStageRailProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Adapter-derived run state. Raw Run Context must never be passed to UI. */
  readonly run: PulmuRunViewModel;
  /** Optional Pattern detail remains a descendant of Shape. */
  readonly patternDetail?: ReactNode;
  /** Accessible navigation name; customize when more than one rail is present. */
  readonly label?: string;
};

export function ForgeStageRail({ "aria-label": ariaLabel, className, label, patternDetail, run, ...props }: ForgeStageRailProps) {
  const accessibleLabel = label ?? ariaLabel ?? "Pulmu forge stages";
  const alternative = run.timeline
    .map((stage) => `${stage.name}: ${stageStatusLabels[stage.status]}`)
    .join("; ");

  return (
    <nav {...props} aria-label={accessibleLabel} className={classes("pulmu-forge-rail", className)}>
      <p className="pulmu-visually-hidden">Full forge flow: {alternative}.</p>
      <ol className="pulmu-forge-rail__list">
        {run.timeline.map((stage) => {
          const StageIcon = stageIconById.get(stage.id)!;
          const StatusIcon = PULMU_STAGE_STATUS_ICONS[stage.status];
          const isCurrent = stage.id === run.currentStage.id;
          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              className={classes("pulmu-forge-stage", isCurrent && "pulmu-forge-stage--current")}
              data-stage-id={stage.id}
              data-stage-status={stage.status}
              key={stage.id}
            >
              <div className="pulmu-forge-stage__summary">
                <PulmuIcon className="pulmu-forge-stage__glyph" decorative icon={StageIcon} />
                <span className="pulmu-forge-stage__copy">
                  <strong>{stage.name}</strong>
                  <span>{stageById.get(stage.id)!.step.split(" — ")[1]}</span>
                </span>
                <span className="pulmu-forge-stage__status">
                  <PulmuIcon decorative icon={StatusIcon} size="sm" />
                  <span>{stageStatusLabels[stage.status]}</span>
                </span>
              </div>
              {stage.id === "shape" && run.pattern.enabled ? <PatternInset>{patternDetail}</PatternInset> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type PatternInsetProps = HTMLAttributes<HTMLDivElement>;

export function PatternInset({ children, className, ...props }: PatternInsetProps) {
  return (
    <div {...props} className={classes("pulmu-pattern-inset", className)}>
      <PulmuIcon decorative icon={PULMU_PATTERN_ICON.glyph} size="sm" />
      <span><strong>{PULMU_PATTERN_PASS.name}</strong>{children ? <span className="pulmu-pattern-inset__detail">{children}</span> : null}</span>
    </div>
  );
}

export type RunLifecycleStatusProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly status: PulmuRunStatus;
};

export function RunLifecycleStatus({ className, status, ...props }: RunLifecycleStatusProps) {
  return (
    <div {...props} className={classes("pulmu-run-lifecycle", `pulmu-run-lifecycle--${status}`, className)} role="status">
      <PulmuIcon decorative icon={PULMU_RUN_STATUS_ICONS[status]} />
      <span><span className="pulmu-run-lifecycle__label">Run status</span><strong>{runStatusLabels[status]}</strong></span>
    </div>
  );
}

export type ForgeRiskBadgeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly forge: PulmuForgeMode | null;
  readonly risk: PulmuRiskLevel | null;
};

export function ForgeRiskBadge({ className, forge, risk, ...props }: ForgeRiskBadgeProps) {
  return (
    <div {...props} className={classes("pulmu-forge-risk", className)}>
      <span><span>Forge</span><strong>{forge ? PULMU_FORGE_MODES[forge].label : "Provisional"}</strong></span>
      <span><span>Risk</span><strong>{risk ? `${risk[0].toUpperCase()}${risk.slice(1)}` : "Provisional"}</strong></span>
    </div>
  );
}

export type TaskMetadataProps = Omit<HTMLAttributes<HTMLDListElement>, "children"> & {
  readonly areas: PulmuRunViewModel["areas"];
  readonly taskType: PulmuRunViewModel["taskType"];
};

export function TaskMetadata({ areas, className, taskType, ...props }: TaskMetadataProps) {
  return (
    <dl {...props} className={classes("pulmu-task-metadata", className)}>
      <div><dt>Task type</dt><dd>{taskType}</dd></div>
      <div><dt>Areas</dt><dd>{areas.length > 0 ? areas.join(", ") : "Not finalized"}</dd></div>
    </dl>
  );
}

export type StageActivityProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly activity: string;
  readonly agents?: PulmuRunViewModel["activeAgents"];
  readonly stageId: PulmuStageId;
};

export function StageActivity({ activity, agents = [], className, stageId, ...props }: StageActivityProps) {
  const stage = stageById.get(stageId)!;
  return (
    <div {...props} aria-atomic="true" aria-live="polite" className={classes("pulmu-stage-activity", className)}>
      <span aria-hidden="true" className="pulmu-stage-activity__marker">●</span>
      <span><strong>{stage.name} activity</strong><span>{activity}</span>{agents.length > 0 ? <small>Active: {agents.join(", ")}</small> : null}</span>
    </div>
  );
}

export type ActiveStagePanelProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  readonly activity?: string;
  readonly children?: ReactNode;
  readonly run: PulmuRunViewModel;
};

export function ActiveStagePanel({ activity, children, className, run, ...props }: ActiveStagePanelProps) {
  const stage = stageById.get(run.currentStage.id)!;
  const headingId = `${useId()}-active-stage`;
  return (
    <section {...props} aria-labelledby={headingId} className={classes("pulmu-active-stage", className)}>
      <div className="pulmu-active-stage__heading">
        <h2 id={headingId}><PulmuIcon decorative icon={stageIconById.get(stage.id)!} /> {stage.name}</h2>
        <span><span>Stage status</span><strong>{stageStatusLabels[run.currentStage.status]}</strong></span>
      </div>
      {activity ? <StageActivity activity={activity} agents={run.activeAgents} stageId={stage.id} /> : null}
      {children}
    </section>
  );
}

export type RetryLoopProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly count: number;
  readonly kind: keyof typeof PULMU_RETRY_POLICIES;
};

export function RetryLoop({ className, count, kind, ...props }: RetryLoopProps) {
  const policy = PULMU_RETRY_POLICIES[kind];
  const safeCount = Math.min(policy.maxRetries, Math.max(0, Number.isFinite(count) ? Math.trunc(count) : 0));
  const path = policy.path.map((id) => stageById.get(id)!.name).join(" → ");
  return (
    <div {...props} className={classes("pulmu-retry-loop", className)}>
      <strong>{kind === "quench" ? "Quench retry" : "Hone refinement"}</strong>
      <span>Attempt {safeCount} of {policy.maxRetries}</span>
      <span><span className="pulmu-visually-hidden">Canonical retry path: </span>{path}</span>
    </div>
  );
}

export type VerificationResult =
  | { readonly status: "pass"; readonly checks: readonly string[] }
  | { readonly status: "failed"; readonly checks: readonly string[]; readonly summary: string };

export type VerificationSummaryProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly result: VerificationResult;
};

export function VerificationSummary({ className, result, ...props }: VerificationSummaryProps) {
  const passed = result.status === "pass";
  return (
    <div {...props} className={classes("pulmu-verification", `pulmu-verification--${result.status}`, className)} role={passed ? "status" : "alert"}>
      <PulmuIcon decorative icon={PULMU_STAGE_STATUS_ICONS[passed ? "completed" : "failed"]} />
      <div><strong>Verification {passed ? "PASS" : "failed"}</strong>{!passed ? <p>{result.summary}</p> : null}<ul>{result.checks.map((check) => <li key={check}>{check}</li>)}</ul></div>
    </div>
  );
}

export type ReviewSeverity = "low" | "medium" | "high";
export type ReviewResult =
  | { readonly status: "pass" }
  | { readonly status: "finding"; readonly description: string; readonly severity: ReviewSeverity; readonly title: string };
export type ReviewFindingProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
  readonly result: ReviewResult;
};

export function ReviewFinding({ className, result, ...props }: ReviewFindingProps) {
  if (result.status === "pass") {
    return (
      <div {...props} className={classes("pulmu-review-finding", "pulmu-review-finding--pass", className)} role="status">
        <div><strong>Review PASS</strong><PulmuIcon decorative icon={PULMU_STAGE_STATUS_ICONS.completed} size="sm" /></div>
      </div>
    );
  }
  const blocking = result.severity === "medium" || result.severity === "high";
  return (
    <article {...props} className={classes("pulmu-review-finding", blocking && "pulmu-review-finding--blocking", className)}>
      <div><strong>{result.title}</strong><span>{result.severity} severity · {blocking ? "Blocking" : "Non-blocking"}</span></div>
      <p>{result.description}</p>
    </article>
  );
}

export type FailureInterruptedNoticeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly failureCode?: string | null;
  readonly stageId: PulmuStageId;
  readonly status: "failed" | "interrupted";
};

export function FailureInterruptedNotice({ className, failureCode, stageId, status, ...props }: FailureInterruptedNoticeProps) {
  const failed = status === "failed";
  return (
    <div {...props} className={classes("pulmu-terminal-notice", `pulmu-terminal-notice--${status}`, className)} role={failed ? "alert" : "status"}>
      <PulmuIcon decorative icon={PULMU_RUN_STATUS_ICONS[status]} />
      <div><strong>Run {status}</strong><p>{stageById.get(stageId)!.name} {failed ? "did not complete successfully" : "was interrupted before completion"}.</p>{failed && failureCode ? <small>Failure code: {failureCode}</small> : null}</div>
    </div>
  );
}

export type DeliverySummaryProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly delivery: PulmuDeliveryView;
};

export function DeliverySummary({ className, delivery, ...props }: DeliverySummaryProps) {
  const label = delivery.kind === "github" ? "GitHub pull request" : delivery.kind === "local" ? "Local commit" : delivery.kind === "none" ? "Not delivered" : "Delivery pending";
  return (
    <div {...props} className={classes("pulmu-delivery", className)}>
      <strong>Delivery</strong>
      <span>{label}</span>
      <small>{delivery.status === "completed" ? "Completed" : delivery.status === "not_delivered" ? "No delivery was created" : "Awaiting Ship"}</small>
    </div>
  );
}
