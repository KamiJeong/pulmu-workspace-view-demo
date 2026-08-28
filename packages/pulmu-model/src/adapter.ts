import {
  PULMU_AGENTS,
  PULMU_FORGE_MODES,
  PULMU_PATTERN_PASS,
  PULMU_RETRY_POLICIES,
  PULMU_RISK_LEVELS,
  PULMU_RUN_STATUSES,
  PULMU_STAGES,
  PULMU_TASK_TYPES,
  type PulmuAgentName,
  type PulmuForgeMode,
  type PulmuRiskLevel,
  type PulmuRunStatus,
  type PulmuRunViewModel,
  type PulmuStageId,
  type PulmuStageStatus,
  type PulmuTaskType,
} from "./contract";

const rawStageStatuses = ["in_progress", "completed", "failed", "interrupted"] as const;
const stageIds = new Set<string>(PULMU_STAGES.map(({ id }) => id));
const agentNames = new Set<string>(PULMU_AGENTS.map(({ name }) => name));
const taskAreaPattern = /^[a-z][a-z0-9-]*$/;
const errorCodePattern = /^[A-Z][A-Z0-9_]{0,63}$/;
const commitPattern = /^[0-9a-fA-F]{7,64}$/;
const runIdPattern = /^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{12}$/;
const pullRequestUrlPattern = /^https:\/\/[^\s/]+(?:\/[^\s/]+){2}\/pull\/([0-9]+)$/;

type UnknownRecord = Record<string, unknown>;

export class PulmuRunContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PulmuRunContextError";
  }
}

function invalid(message: string): never {
  throw new PulmuRunContextError(message);
}

function record(value: unknown, field: string): UnknownRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    invalid(`${field} must be an object`);
  }
  return value as UnknownRecord;
}

function member<T extends string>(value: unknown, values: readonly T[], field: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    invalid(`${field} is invalid`);
  }
  return value as T;
}

function nullableString(value: unknown, field: string, maximumLength = Number.POSITIVE_INFINITY): string | null {
  if (
    value !== null &&
    (typeof value !== "string" || value.length === 0 || value.length > maximumLength)
  ) {
    invalid(`${field} must be a non-empty string or null`);
  }
  return value as string | null;
}

function timestamp(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.endsWith("Z") || Number.isNaN(Date.parse(value))) {
    invalid(`${field} must be an ISO 8601 UTC timestamp`);
  }
  return value;
}

function nullableTimestamp(value: unknown, field: string): string | null {
  return value === null ? null : timestamp(value, field);
}

function retryCount(value: unknown, field: "quench" | "hone"): number {
  const maximum = PULMU_RETRY_POLICIES[field].maxRetries;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > maximum) {
    invalid(`retries.${field} must be between 0 and ${maximum}`);
  }
  return value as number;
}

function deriveTimeline(
  currentStageId: PulmuStageId,
  currentStatus: Exclude<PulmuStageStatus, "pending">,
) {
  const currentIndex = PULMU_STAGES.findIndex(({ id }) => id === currentStageId);

  return PULMU_STAGES.map(({ id, icon, name }, index) => {
    let status: PulmuStageStatus = "pending";
    if (index < currentIndex) status = "completed";
    if (index === currentIndex) status = currentStatus;

    return { id, icon, name, status };
  });
}

function validateError(value: unknown, required: boolean): string | null {
  if (value === null) {
    if (required) invalid("failed runs require an error");
    return null;
  }

  const error = record(value, "error");
  if (typeof error.code !== "string" || !errorCodePattern.test(error.code)) {
    invalid("error.code is invalid");
  }
  if (typeof error.message !== "string" || error.message.length === 0 || error.message.length > 500) {
    invalid("error.message is invalid");
  }
  return error.code;
}

function validatePullRequest(value: unknown): boolean {
  if (value === null) return false;

  const pullRequest = record(value, "pr");
  const match =
    typeof pullRequest.url === "string" ? pullRequestUrlPattern.exec(pullRequest.url) : null;
  if (
    !Number.isInteger(pullRequest.number) ||
    (pullRequest.number as number) <= 0 ||
    match === null ||
    Number(match[1]) !== pullRequest.number
  ) {
    invalid("pr is invalid or its number and URL do not match");
  }
  return true;
}

export function adaptPulmuRunContext(raw: unknown): PulmuRunViewModel {
  const root = record(raw, "Run Context");
  if (root.schemaVersion !== 1) invalid("unsupported Run Context schemaVersion");
  if (root.workflow !== "pulmu") invalid("Run Context workflow must be pulmu");
  if (
    typeof root.pulmuVersion !== "string" ||
    root.pulmuVersion.length === 0 ||
    root.pulmuVersion.length > 32
  ) {
    invalid("pulmuVersion is invalid");
  }
  if (typeof root.runId !== "string" || !runIdPattern.test(root.runId)) {
    invalid("runId is invalid");
  }

  const status = member(root.status, PULMU_RUN_STATUSES, "status") as PulmuRunStatus;
  const task = record(root.task, "task");
  if (
    typeof task.prompt !== "string" ||
    task.prompt.length === 0 ||
    task.prompt.length > 2_000
  ) {
    invalid("task.prompt is invalid");
  }
  const taskType = member(task.type, PULMU_TASK_TYPES, "task.type") as PulmuTaskType;

  const forge =
    root.forge === null
      ? null
      : member(root.forge, Object.keys(PULMU_FORGE_MODES) as PulmuForgeMode[], "forge");
  const risk =
    root.risk === null
      ? null
      : member(root.risk, PULMU_RISK_LEVELS, "risk") as PulmuRiskLevel;

  if (!Array.isArray(root.areas) || root.areas.length > 3) invalid("areas is invalid");
  const areas = root.areas.map((area) => {
    if (typeof area !== "string" || !taskAreaPattern.test(area)) invalid("area is invalid");
    return area;
  });
  if (new Set(areas).size !== areas.length) invalid("areas must be unique");
  if (typeof root.pattern !== "boolean") invalid("pattern must be boolean");

  const metadataIsProvisional = forge === null || risk === null;
  if (metadataIsProvisional && (forge !== null || risk !== null || areas.length > 0 || root.pattern)) {
    invalid("provisional metadata is inconsistent");
  }
  if (!metadataIsProvisional && areas.length === 0) invalid("final metadata requires an area");
  if (root.pattern && (!areas.includes("frontend") || !areas.includes("design"))) {
    invalid("Pattern metadata requires frontend and design areas");
  }

  const stage = record(root.stage, "stage");
  if (typeof stage.current !== "string" || !stageIds.has(stage.current)) {
    invalid("stage.current is invalid");
  }
  const currentStageId = stage.current as PulmuStageId;
  const currentStageStatus = member(stage.status, rawStageStatuses, "stage.status");

  const agents = record(root.agents, "agents");
  if (!Array.isArray(agents.active) || agents.active.length > 16) invalid("agents.active is invalid");
  const activeAgents = agents.active.map((agent) => {
    if (typeof agent !== "string" || !agentNames.has(agent)) invalid("active agent is invalid");
    return agent as PulmuAgentName;
  });
  if (new Set(activeAgents).size !== activeAgents.length) invalid("active agents must be unique");

  const retries = record(root.retries, "retries");
  const quenchRetries = retryCount(retries.quench, "quench");
  const honeRetries = retryCount(retries.hone, "hone");
  const stageIndex = PULMU_STAGES.findIndex(({ id }) => id === currentStageId);
  const hammerIndex = PULMU_STAGES.findIndex(({ id }) => id === "hammer");
  if ((quenchRetries > 0 || honeRetries > 0) && stageIndex < hammerIndex) {
    invalid("retry counters contradict the current stage");
  }

  const startedAt = timestamp(root.startedAt, "startedAt");
  const updatedAt = timestamp(root.updatedAt, "updatedAt");
  const completedAt = nullableTimestamp(root.completedAt, "completedAt");
  const interruptedAt = nullableTimestamp(root.interruptedAt, "interruptedAt");
  if (Date.parse(startedAt) > Date.parse(updatedAt)) invalid("updatedAt precedes startedAt");

  const git = record(root.git, "git");
  nullableString(git.baseBranch, "git.baseBranch", 512);
  nullableString(git.branch, "git.branch", 512);
  const commit = nullableString(git.commit, "git.commit", 512);
  const hasPullRequest = validatePullRequest(root.pr);
  const failureCode = validateError(root.error, status === "failed");

  if (status === "running") {
    if (
      currentStageStatus !== "in_progress" ||
      completedAt !== null ||
      interruptedAt !== null ||
      hasPullRequest ||
      root.error !== null
    ) {
      invalid("running run has contradictory terminal state");
    }
  }

  if (status === "completed") {
    if (
      currentStageId !== "ship" ||
      currentStageStatus !== "completed" ||
      completedAt !== updatedAt ||
      interruptedAt !== null ||
      root.error !== null ||
      commit === null ||
      !commitPattern.test(commit)
    ) {
      invalid("completed run has contradictory terminal state");
    }
  }

  if (status === "failed") {
    if (
      currentStageStatus !== "failed" ||
      completedAt !== null ||
      interruptedAt !== null ||
      hasPullRequest
    ) {
      invalid("failed run has contradictory terminal state");
    }
  }

  if (status === "interrupted") {
    if (
      currentStageStatus !== "interrupted" ||
      interruptedAt !== updatedAt ||
      completedAt !== null ||
      hasPullRequest
    ) {
      invalid("interrupted run has contradictory terminal state");
    }
  }

  if (status !== "running" && activeAgents.length > 0) {
    invalid("terminal runs cannot have active agents");
  }

  const delivery =
    status === "completed"
      ? ({ kind: hasPullRequest ? "github" : "local", status: "completed" } as const)
      : status === "running"
        ? ({ kind: "unknown", status: "pending" } as const)
        : ({ kind: "none", status: "not_delivered" } as const);

  return {
    schemaVersion: 1,
    status,
    taskType,
    forge,
    risk,
    areas: [...areas],
    pattern: {
      enabled: root.pattern,
      parentStageId: PULMU_PATTERN_PASS.parentStageId,
    },
    currentStage: { id: currentStageId, status: currentStageStatus },
    timeline: deriveTimeline(currentStageId, currentStageStatus),
    activeAgents: [...activeAgents],
    retries: { quench: quenchRetries, hone: honeRetries },
    delivery,
    failureCode,
    timestamps: {
      startedAt,
      updatedAt,
      terminalAt: completedAt ?? interruptedAt,
    },
  };
}
