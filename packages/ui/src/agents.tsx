import { useId, type HTMLAttributes } from "react";
import {
  PULMU_PATTERN_PASS,
  PULMU_STAGES,
  getPulmuActor,
  type PulmuActorName,
  type PulmuAgentName,
  type PulmuAgentRoutingCondition,
  type PulmuAgentRoutingFixture,
  type PulmuAgentRoutingGroup,
  type PulmuReviewerName,
  type PulmuStageId,
} from "@pulmu/model";

import type { ReviewResult } from "./forge";
import { ReviewFinding } from "./forge";
import { classes } from "./internal";

const accessLabels = {
  "workflow-control": "Workflow control",
  write: "Sole writer",
  "read-only": "Read-only",
} as const;

const conditionLabels: Record<PulmuAgentRoutingCondition, string> = {
  always: "Always routed",
  pattern: "When Pattern runs",
  failure: "When failure analysis is needed",
  security: "When security review is required",
  compatibility: "When compatibility review is required",
  design: "When Pattern ran",
};

const stageById = new Map(PULMU_STAGES.map((stage) => [stage.id, stage]));

export type AgentRoleBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  readonly name: PulmuActorName;
};

export function AgentRoleBadge({ className, name, ...props }: AgentRoleBadgeProps) {
  return <span {...props} className={classes("pulmu-agent-role", className)}>{getPulmuActor(name).role}</span>;
}

export type AgentStatusProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  readonly active: boolean;
};

export function AgentStatus({ active, className, ...props }: AgentStatusProps) {
  return (
    <span {...props} className={classes("pulmu-agent-status", active && "pulmu-agent-status--active", className)}>
      <span aria-hidden="true" className="pulmu-agent-status__marker">{active ? "●" : "○"}</span>
      {active ? "Active" : "Not active"}
    </span>
  );
}

export type AgentAuthorityIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  readonly name: PulmuActorName;
};

export function AgentAuthorityIndicator({ className, name, ...props }: AgentAuthorityIndicatorProps) {
  const actor = getPulmuActor(name);
  return (
    <span {...props} className={classes("pulmu-agent-authority", `pulmu-agent-authority--${actor.access}`, className)}>
      {accessLabels[actor.access]}
    </span>
  );
}

export type AgentIdentityProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  readonly active: boolean;
  readonly name: PulmuActorName;
};

export function AgentIdentity({ active, className, name, ...props }: AgentIdentityProps) {
  const actor = getPulmuActor(name);
  return (
    <div
      {...props}
      className={classes("pulmu-agent-identity", `pulmu-agent-identity--${actor.access}`, className)}
      data-agent-name={name}
    >
      <div className="pulmu-agent-identity__name">
        <code>{name}</code>
        <AgentStatus active={active} />
      </div>
      <div className="pulmu-agent-identity__badges">
        <AgentAuthorityIndicator name={name} />
        <AgentRoleBadge name={name} />
      </div>
    </div>
  );
}

export type AgentActivityRowProps = Omit<HTMLAttributes<HTMLLIElement>, "children"> & {
  readonly active: boolean;
  readonly activity: string;
  readonly name: PulmuActorName;
};

export function AgentActivityRow({ active, activity, className, name, ...props }: AgentActivityRowProps) {
  return (
    <li {...props} className={classes("pulmu-agent-activity-row", className)}>
      <AgentIdentity active={active} name={name} />
      <p><span>Activity</span><strong>{activity}</strong></p>
    </li>
  );
}

export type AgentCardProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  readonly active: boolean;
  readonly activity?: string;
  readonly name: PulmuActorName;
};

export function AgentCard({ active, activity, className, name, ...props }: AgentCardProps) {
  return (
    <article {...props} className={classes("pulmu-agent-card", className)}>
      <AgentIdentity active={active} name={name} />
      {activity ? <p className="pulmu-agent-card__activity"><span>Activity</span><strong>{activity}</strong></p> : null}
    </article>
  );
}

export type AgentGroupProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  readonly activeAgents?: readonly PulmuAgentName[];
  readonly agentNames: readonly PulmuAgentName[];
  readonly label?: string;
  readonly parallel?: boolean;
};

export function AgentGroup({ activeAgents = [], agentNames, className, label = "Agent group", parallel = false, ...props }: AgentGroupProps) {
  const headingId = `${useId()}-agent-group`;
  if (parallel && agentNames.some((name) => getPulmuActor(name).access !== "read-only")) {
    throw new Error("Parallel agent groups accept read-only Pulmu agents only");
  }
  const activeNames = new Set(activeAgents);
  return (
    <div {...props} aria-labelledby={headingId} className={classes("pulmu-agent-group", parallel && "pulmu-agent-group--parallel", className)} role="group">
      <div className="pulmu-agent-group__heading">
        <strong id={headingId}>{label}</strong>
        <span>{parallel ? "Parallel read-only" : "Sequential assignment"}</span>
      </div>
      {agentNames.length === 0 ? (
        <p className="pulmu-agent-group__empty"><strong>No active agents</strong><span>This is a valid idle state.</span></p>
      ) : (
        <ul className="pulmu-agent-group__list">
          {agentNames.map((name) => (
            <AgentActivityRow
              active={activeNames.has(name)}
              activity={getPulmuActor(name).role}
              key={name}
              name={name}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export type ActiveAgentGroupProps = Omit<AgentGroupProps, "activeAgents">;

export function ActiveAgentGroup({ agentNames, label = "Active agent group", ...props }: ActiveAgentGroupProps) {
  return <AgentGroup {...props} activeAgents={agentNames} agentNames={agentNames} label={label} />;
}

export type ParallelReadOnlyGroupProps = Omit<AgentGroupProps, "activeAgents" | "parallel">;

export function ParallelReadOnlyGroup({ agentNames, label = "Parallel read-only group", ...props }: ParallelReadOnlyGroupProps) {
  return <AgentGroup {...props} activeAgents={agentNames} agentNames={agentNames} label={label} parallel />;
}

export type AgentStageRelationshipProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  readonly activeAgents?: readonly PulmuAgentName[];
  readonly activity: string;
  readonly agentNames: readonly PulmuAgentName[];
  readonly condition?: PulmuAgentRoutingCondition;
  readonly parallel?: boolean;
  readonly parentPass?: typeof PULMU_PATTERN_PASS.id;
  readonly stageId: PulmuStageId;
};

type AgentRoutingAssignmentProps = Pick<
  AgentStageRelationshipProps,
  "activeAgents" | "activity" | "agentNames" | "condition" | "parallel" | "parentPass"
>;

function AgentRoutingAssignment({
  activeAgents = [], activity, agentNames, condition = "always", parallel = false, parentPass,
}: AgentRoutingAssignmentProps) {
  return (
    <div
      className={classes("pulmu-agent-assignment", parentPass === "pattern" && "pulmu-agent-stage__pattern")}
      data-agent-condition={condition}
    >
      {parentPass === "pattern" ? <p><strong>🎨 Pattern</strong><span>Conditional pass inside Shape</span></p> : null}
      <p className="pulmu-agent-stage__activity"><span>Activity</span><strong>{activity}</strong></p>
      <p className="pulmu-agent-stage__condition">{conditionLabels[condition]}</p>
      <AgentGroup activeAgents={activeAgents} agentNames={agentNames} label={parallel ? "Specialists" : "Assigned agent"} parallel={parallel} />
    </div>
  );
}

type AgentStageAssignmentsProps = {
  readonly activeAgents: readonly PulmuAgentName[];
  readonly groups: readonly PulmuAgentRoutingGroup[];
  readonly stageId: PulmuStageId;
};

function AgentStageAssignments({ activeAgents, groups, stageId }: AgentStageAssignmentsProps) {
  const stage = stageById.get(stageId)!;
  const headingId = `${useId()}-agent-stage`;
  return (
    <div aria-labelledby={headingId} className="pulmu-agent-stage" data-agent-stage-id={stageId} role="group">
      <header className="pulmu-agent-stage__heading">
        <span>Stage</span>
        <h2 id={headingId}>{stage.icon} {stage.name}</h2>
      </header>
      <div className="pulmu-agent-stage__assignments">
        {groups.map((group) => (
          <AgentRoutingAssignment
            activeAgents={activeAgents}
            activity={group.activity}
            agentNames={group.agents}
            condition={group.condition}
            key={group.id}
            parallel={group.parallel}
            parentPass={group.parentPass}
          />
        ))}
      </div>
    </div>
  );
}

export function AgentStageRelationship({
  activeAgents = [], activity, agentNames, className, condition = "always", parallel = false, parentPass, stageId, ...props
}: AgentStageRelationshipProps) {
  const stage = stageById.get(stageId)!;
  const headingId = `${useId()}-agent-stage`;
  return (
    <div {...props} aria-labelledby={headingId} className={classes("pulmu-agent-stage", className)} data-agent-stage-id={stageId} role="group">
      <header className="pulmu-agent-stage__heading">
        <span>Stage</span>
        <h2 id={headingId}>{stage.icon} {stage.name}</h2>
      </header>
      <div className="pulmu-agent-stage__assignments">
        <AgentRoutingAssignment
          activeAgents={activeAgents}
          activity={activity}
          agentNames={agentNames}
          condition={condition}
          parallel={parallel}
          parentPass={parentPass}
        />
      </div>
    </div>
  );
}

export type ReviewerFindingSummaryProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  readonly active?: boolean;
  readonly result: ReviewResult;
  readonly reviewer: PulmuReviewerName;
};

export function ReviewerFindingSummary({ active = false, className, result, reviewer, ...props }: ReviewerFindingSummaryProps) {
  return (
    <section {...props} aria-label={`Finding from ${reviewer}`} className={classes("pulmu-reviewer-summary", className)}>
      <AgentIdentity active={active} name={reviewer} />
      <ReviewFinding result={result} />
    </section>
  );
}

export type OrchestrationFlowProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  readonly activeAgents?: readonly PulmuAgentName[];
  readonly enabledConditions?: readonly PulmuAgentRoutingCondition[];
  readonly fixture: PulmuAgentRoutingFixture;
};

export function OrchestrationFlow({ activeAgents = [], className, enabledConditions = ["always"], fixture, ...props }: OrchestrationFlowProps) {
  const headingId = `${useId()}-orchestration-flow`;
  const smithAssignments = fixture.groups.flatMap(({ agents }) => agents).filter((name) => name === "pulmu_smith");
  if (smithAssignments.length !== 1) {
    throw new Error("OrchestrationFlow requires exactly one pulmu_smith assignment");
  }
  const conditions = new Set<PulmuAgentRoutingCondition>(["always", ...enabledConditions]);
  const groups = fixture.groups.filter(({ condition }) => conditions.has(condition));
  const groupsByStage = new Map<PulmuStageId, PulmuAgentRoutingGroup[]>();
  for (const group of groups) {
    const stageGroups = groupsByStage.get(group.stageId) ?? [];
    stageGroups.push(group);
    groupsByStage.set(group.stageId, stageGroups);
  }
  const representedStages = PULMU_STAGES.filter(({ id }) => groupsByStage.has(id));
  return (
    <section {...props} aria-labelledby={headingId} className={classes("pulmu-orchestration-flow", className)}>
      <header className="pulmu-orchestration-flow__heading">
        <span>Orchestration flow</span>
        <h2 id={headingId}>{fixture.label} Forge</h2>
      </header>
      <AgentCard active activity="Owns stage transitions, routing, consolidation, retries, and delivery" name="orchestrator" />
      <ol className="pulmu-orchestration-flow__stages">
        {representedStages.map((stage) => (
          <li data-orchestration-stage-id={stage.id} key={stage.id}>
            <AgentStageAssignments activeAgents={activeAgents} groups={groupsByStage.get(stage.id)!} stageId={stage.id} />
          </li>
        ))}
      </ol>
    </section>
  );
}
