import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  FULL_AGENT_ROUTING_FIXTURE,
  QUICK_AGENT_ROUTING_FIXTURE,
  STANDARD_AGENT_ROUTING_FIXTURE,
} from "@pulmu/model";
import {
  ActiveAgentGroup,
  AgentCard,
  AgentGroup,
  AgentStageRelationship,
  OrchestrationFlow,
  ParallelReadOnlyGroup,
  ReviewerFindingSummary,
} from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./AgentComponents.css";

const meta = {
  title: "08 Agent Components/Agent Surfaces",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const assertStaticSurface = async (canvasElement: HTMLElement) => {
  await expect(canvasElement.querySelectorAll("button, a, input, select, textarea, [tabindex]")).toHaveLength(0);
};

const assertNoPageOverflow = async (canvasElement: HTMLElement) => {
  await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  await expect(document.body.scrollWidth).toBeLessThanOrEqual(document.body.clientWidth);
};

const topLevelStageIds = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll<HTMLElement>(".pulmu-orchestration-flow__stages > li")]
    .map(({ dataset }) => dataset.orchestrationStageId);

export const IdentityAuthorityAndStatus: Story = {
  render: () => (
    <main className="agent-demo">
      <h1>Agent identity and authority</h1>
      <div className="agent-demo__grid">
        <AgentCard active activity="Routing the current forge stage" name="orchestrator" />
        <AgentCard active activity="Implementing source and tests" name="pulmu_smith" />
        <AgentCard active={false} activity="Reviewing correctness" name="pulmu_reviewer" />
      </div>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Workflow control")).toBeVisible();
    await expect(canvas.getByText("Sole writer")).toBeVisible();
    await expect(canvas.getByText("Read-only")).toBeVisible();
    await expect(canvas.getAllByText("Active")).toHaveLength(2);
    await expect(canvas.getByText("Not active")).toBeVisible();
    await assertStaticSurface(canvasElement);
  },
};

export const NoActiveAgents: Story = {
  render: () => <AgentGroup agentNames={[]} label="Current stage agents" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No active agents")).toBeVisible();
    await expect(canvas.getByText("This is a valid idle state.")).toBeVisible();
    await assertStaticSurface(canvasElement);
  },
};

export const ActiveAndParallelGroups: Story = {
  render: () => (
    <main className="agent-demo">
      <h1>Assigned agents</h1>
      <ActiveAgentGroup agentNames={["pulmu_smith"]} />
      <ParallelReadOnlyGroup agentNames={["pulmu_explorer", "pulmu_test_scout", "pulmu_risk_scout"]} />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Sole writer")).toBeVisible();
    await expect(canvas.getAllByText("Parallel read-only").length).toBeGreaterThanOrEqual(1);
    await expect(canvas.getAllByText("Read-only")).toHaveLength(3);
    await expect(canvas.getAllByText("Active")).toHaveLength(4);
    await assertStaticSurface(canvasElement);
  },
};

export const QuickForge: Story = {
  render: () => <OrchestrationFlow activeAgents={["pulmu_designer"]} enabledConditions={["pattern"]} fixture={QUICK_AGENT_ROUTING_FIXTURE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Quick Forge" })).toBeVisible();
    await expect(canvas.getAllByText("Sole writer")).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('[data-agent-name="pulmu_smith"]')).toHaveLength(1);
    await expect(topLevelStageIds(canvasElement)).toEqual(["inspect", "shape", "hammer", "hone"]);
    const pattern = canvasElement.querySelector<HTMLElement>('.pulmu-agent-stage__pattern [data-agent-name="pulmu_designer"]')!;
    await expect(pattern.closest("[data-orchestration-stage-id]")).toHaveAttribute("data-orchestration-stage-id", "shape");
    await assertStaticSurface(canvasElement);
  },
};

export const StandardForge: Story = {
  render: () => <OrchestrationFlow activeAgents={["pulmu_explorer", "pulmu_test_scout"]} fixture={STANDARD_AGENT_ROUTING_FIXTURE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Standard Forge" })).toBeVisible();
    await expect(canvas.getAllByText("Parallel read-only").length).toBeGreaterThanOrEqual(1);
    await expect(canvas.getAllByText("Sole writer")).toHaveLength(1);
    await expect(topLevelStageIds(canvasElement)).toEqual(["inspect", "shape", "hammer", "hone"]);
    await assertStaticSurface(canvasElement);
  },
};

export const FullForgeWithConditionalReviewers: Story = {
  render: () => (
    <OrchestrationFlow
      activeAgents={["pulmu_reviewer", "pulmu_test_reviewer", "pulmu_security_reviewer", "pulmu_compat_reviewer", "pulmu_design_reviewer"]}
      enabledConditions={["failure", "pattern", "security", "compatibility", "design"]}
      fixture={FULL_AGENT_ROUTING_FIXTURE}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const reviewer of ["pulmu_reviewer", "pulmu_test_reviewer", "pulmu_security_reviewer", "pulmu_compat_reviewer", "pulmu_design_reviewer"]) {
      await expect(canvas.getByText(reviewer, { selector: "code" })).toBeVisible();
    }
    await expect(canvas.getAllByText("Sole writer")).toHaveLength(1);
    await expect(canvas.getByText("When security review is required")).toBeVisible();
    await expect(canvas.getByText("When compatibility review is required")).toBeVisible();
    await expect(topLevelStageIds(canvasElement)).toEqual(["inspect", "shape", "hammer", "quench", "hone"]);
    const securityReviewer = canvas.getByText("pulmu_security_reviewer", { selector: "code" });
    const designReviewer = canvas.getByText("pulmu_design_reviewer", { selector: "code" });
    await expect(securityReviewer.closest("[data-orchestration-stage-id]")).toHaveAttribute("data-orchestration-stage-id", "hone");
    await expect(designReviewer.closest("[data-orchestration-stage-id]")).toHaveAttribute("data-orchestration-stage-id", "hone");
    const pattern = canvasElement.querySelector<HTMLElement>('.pulmu-agent-stage__pattern [data-agent-name="pulmu_designer"]')!;
    await expect(pattern.closest("[data-orchestration-stage-id]")).toHaveAttribute("data-orchestration-stage-id", "shape");
    await assertStaticSurface(canvasElement);
  },
};

export const PatternDesigner: Story = {
  render: () => (
    <AgentStageRelationship
      activeAgents={["pulmu_designer"]}
      activity="Defining hierarchy, responsive behavior, and accessibility"
      agentNames={["pulmu_designer"]}
      condition="pattern"
      parentPass="pattern"
      stageId="shape"
    />
  ),
  play: async ({ canvasElement }) => {
    const relationship = canvasElement.querySelector<HTMLElement>('[data-agent-stage-id="shape"]')!;
    await expect(within(relationship).getByRole("heading", { level: 2, name: /Shape/ })).toBeVisible();
    await expect(within(relationship).getByText(/Pattern/, { selector: "strong" })).toBeVisible();
    await expect(within(relationship).getByText("pulmu_designer", { selector: "code" })).toBeVisible();
    await expect(canvasElement.querySelector('[data-agent-stage-id="pattern"]')).not.toBeInTheDocument();
    await assertStaticSurface(canvasElement);
  },
};

export const ReviewerFindings: Story = {
  render: () => (
    <main className="agent-demo">
      <h1>Reviewer findings</h1>
      <ReviewerFindingSummary active reviewer="pulmu_reviewer" result={{ status: "pass" }} />
      <ReviewerFindingSummary
        active
        reviewer="pulmu_test_reviewer"
        result={{ status: "finding", title: "Missing keyboard coverage", severity: "medium", description: "Verify the static reading order at narrow widths." }}
      />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Finding from pulmu_reviewer")).toHaveTextContent("Review PASS");
    await expect(canvas.getByLabelText("Finding from pulmu_test_reviewer")).toHaveTextContent("medium severity · Blocking");
    await assertStaticSurface(canvasElement);
  },
};

const NarrowFlow = () => (
  <OrchestrationFlow
    activeAgents={["pulmu_reviewer", "pulmu_test_reviewer", "pulmu_security_reviewer", "pulmu_compat_reviewer", "pulmu_design_reviewer"]}
    enabledConditions={["pattern", "security", "compatibility", "design"]}
    fixture={FULL_AGENT_ROUTING_FIXTURE}
  />
);

export const MobileMultipleAgents: Story = {
  globals: { viewport: { isRotated: false, value: "mobile" } },
  render: NarrowFlow,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.clientWidth).toBeLessThanOrEqual(390);
    await assertNoPageOverflow(canvasElement);
    await assertStaticSurface(canvasElement);
  },
};

export const NarrowLongAgentNames: Story = {
  globals: { viewport: { isRotated: false, value: "narrow" } },
  render: NarrowFlow,
  play: async ({ canvasElement }) => {
    const names = [...canvasElement.querySelectorAll<HTMLElement>(".pulmu-agent-identity__name code")];
    await expect(canvasElement.clientWidth).toBeLessThanOrEqual(320);
    await expect(names.every((name) => name.scrollWidth <= name.clientWidth)).toBe(true);
    await assertNoPageOverflow(canvasElement);
    await assertStaticSurface(canvasElement);
  },
};
