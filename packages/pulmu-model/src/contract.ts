export const PULMU_STAGES = [
  { id: "ignite", icon: "🔥", name: "Ignite", step: "🔥 Ignite — Prepare" },
  { id: "inspect", icon: "🔎", name: "Inspect", step: "🔎 Inspect — Explore" },
  { id: "shape", icon: "📐", name: "Shape", step: "📐 Shape — Design" },
  { id: "hammer", icon: "🔨", name: "Hammer", step: "🔨 Hammer — Implement" },
  { id: "quench", icon: "🌊", name: "Quench", step: "🌊 Quench — Verify" },
  { id: "hone", icon: "🪨", name: "Hone", step: "🪨 Hone — Review" },
  { id: "ship", icon: "📦", name: "Ship", step: "📦 Ship — Deliver" },
] as const;

export type PulmuStageId = (typeof PULMU_STAGES)[number]["id"];

export const PULMU_STAGE_IDS = PULMU_STAGES.map(({ id }) => id) as readonly PulmuStageId[];

export const PULMU_PATTERN_PASS = {
  id: "pattern",
  icon: "🎨",
  name: "Pattern",
  parentStageId: "shape",
  topLevel: false,
} as const;

export const PULMU_RUN_STATUSES = ["running", "completed", "failed", "interrupted"] as const;
export type PulmuRunStatus = (typeof PULMU_RUN_STATUSES)[number];

export const PULMU_STAGE_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "interrupted",
] as const;
export type PulmuStageStatus = (typeof PULMU_STAGE_STATUSES)[number];

export const PULMU_TASK_TYPES = [
  "feature",
  "bugfix",
  "refactor",
  "docs",
  "test",
  "chore",
] as const;
export type PulmuTaskType = (typeof PULMU_TASK_TYPES)[number];

export const PULMU_RISK_LEVELS = ["low", "medium", "high"] as const;
export type PulmuRiskLevel = (typeof PULMU_RISK_LEVELS)[number];

export const PULMU_COMMON_TASK_AREAS = [
  "frontend",
  "backend",
  "database",
  "infra",
  "security",
  "design",
  "api",
  "testing",
] as const;

export const PULMU_FORGE_MODES = {
  quick: {
    depth: 1,
    label: "Quick",
    stageIds: PULMU_STAGE_IDS,
    summary: "범위가 좁고 위험이 낮은 변경을 위한 집중 검토",
  },
  standard: {
    depth: 2,
    label: "Standard",
    stageIds: PULMU_STAGE_IDS,
    summary: "일반적인 기능과 비단순 수정에 대한 기본 검토",
  },
  full: {
    depth: 3,
    label: "Full",
    stageIds: PULMU_STAGE_IDS,
    summary: "파급 범위와 호환성 위험이 큰 변경을 위한 확장 검토",
  },
} as const;
export type PulmuForgeMode = keyof typeof PULMU_FORGE_MODES;

export const PULMU_AGENTS = [
  { name: "pulmu_explorer", stage: "inspect", access: "read-only", role: "repository exploration" },
  { name: "pulmu_test_scout", stage: "inspect", access: "read-only", role: "test discovery" },
  { name: "pulmu_risk_scout", stage: "inspect", access: "read-only", role: "risk discovery" },
  { name: "pulmu_architect", stage: "shape", access: "read-only", role: "implementation architecture" },
  { name: "pulmu_designer", stage: "pattern", access: "read-only", role: "experience design" },
  { name: "pulmu_smith", stage: "hammer", access: "write", role: "source and test implementation" },
  { name: "pulmu_failure_analyst", stage: "quench", access: "read-only", role: "failure analysis" },
  { name: "pulmu_reviewer", stage: "hone", access: "read-only", role: "correctness review" },
  { name: "pulmu_test_reviewer", stage: "hone", access: "read-only", role: "test review" },
  { name: "pulmu_security_reviewer", stage: "hone", access: "read-only", role: "security review" },
  { name: "pulmu_compat_reviewer", stage: "hone", access: "read-only", role: "compatibility review" },
  { name: "pulmu_design_reviewer", stage: "hone", access: "read-only", role: "design review" },
] as const;
export type PulmuAgentName = (typeof PULMU_AGENTS)[number]["name"];

export const PULMU_ORCHESTRATOR = {
  name: "orchestrator",
  access: "workflow-control",
  role: "stage transitions, routing, consolidation, retries, and delivery",
} as const;

export const PULMU_RETRY_POLICIES = {
  quench: {
    maxRetries: 3,
    path: ["quench", "hammer", "quench"],
  },
  hone: {
    maxRetries: 2,
    path: ["hone", "hammer", "quench", "hone"],
  },
} as const satisfies Record<
  "quench" | "hone",
  { maxRetries: number; path: readonly PulmuStageId[] }
>;

export const PULMU_DELIVERY_KINDS = ["unknown", "local", "github", "none"] as const;
export type PulmuDeliveryKind = (typeof PULMU_DELIVERY_KINDS)[number];

export type PulmuDeliveryView =
  | { kind: "unknown"; status: "pending" }
  | { kind: "local" | "github"; status: "completed" }
  | { kind: "none"; status: "not_delivered" };

export type PulmuStageView = {
  id: PulmuStageId;
  icon: (typeof PULMU_STAGES)[number]["icon"];
  name: (typeof PULMU_STAGES)[number]["name"];
  status: PulmuStageStatus;
};

export type PulmuRunViewModel = {
  schemaVersion: 1;
  status: PulmuRunStatus;
  taskType: PulmuTaskType;
  forge: PulmuForgeMode | null;
  risk: PulmuRiskLevel | null;
  areas: readonly string[];
  pattern: {
    enabled: boolean;
    parentStageId: typeof PULMU_PATTERN_PASS.parentStageId;
  };
  currentStage: {
    id: PulmuStageId;
    status: Exclude<PulmuStageStatus, "pending">;
  };
  timeline: readonly PulmuStageView[];
  activeAgents: readonly PulmuAgentName[];
  retries: {
    quench: number;
    hone: number;
  };
  delivery: PulmuDeliveryView;
  failureCode: string | null;
  timestamps: {
    startedAt: string;
    updatedAt: string;
    terminalAt: string | null;
  };
};
