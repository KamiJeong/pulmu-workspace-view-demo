import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { PULMU_EXAMPLE_RUN_FIXTURES } from "@pulmu/model";
import { RunDetailScreen } from "./PulmuScreens";
import {
  assertForgeContract,
  assertScreenShell,
  matchScreenScreenshot,
  screenGlobals,
  type ScreenViewport,
} from "./screenTestUtils";

const meta = {
  title: "10 Example Screens/Forge Runs",
  component: RunDetailScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RunDetailScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

async function assertRunScreen(canvasElement: HTMLElement, viewport: ScreenViewport, currentStage: string) {
  await assertScreenShell(canvasElement, viewport);
  await assertForgeContract(canvasElement, currentStage);
}

export const ActiveForgeRun: Story = {
  args: { fixture: PULMU_EXAMPLE_RUN_FIXTURES.active, kind: "active" },
  globals: screenGlobals("light", "desktop"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "desktop", "hammer");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Sole writer")).toBeInTheDocument();
    await expect(canvas.getAllByText("Read-only")).toHaveLength(3);
    await matchScreenScreenshot(canvasElement, "active-forge-run-desktop-1440.png");
  },
};

export const ActiveForgeRunTablet768: Story = {
  name: "Active Forge Run · Tablet · 768",
  args: ActiveForgeRun.args,
  globals: screenGlobals("dark", "tablet"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "tablet", "hammer");
    await matchScreenScreenshot(canvasElement, "active-forge-run-tablet-768.png");
  },
};

export const ActiveForgeRunMobile390: Story = {
  name: "Active Forge Run · Mobile · 390",
  args: ActiveForgeRun.args,
  globals: screenGlobals("light", "mobile"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "mobile", "hammer");
    await matchScreenScreenshot(canvasElement, "active-forge-run-mobile-390.png");
  },
};

export const ActiveForgeRunNarrow320: Story = {
  name: "Active Forge Run · Narrow · 320",
  args: ActiveForgeRun.args,
  globals: screenGlobals("dark", "narrow"),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvasElement.querySelectorAll("[data-stage-id]")).toHaveLength(7);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    await matchScreenScreenshot(canvasElement, "active-forge-run-narrow-320.png");
  },
};

export const QuenchRetry: Story = {
  args: { fixture: PULMU_EXAMPLE_RUN_FIXTURES.quenchRetry, kind: "quench-retry" },
  globals: screenGlobals("dark", "desktop"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "desktop", "hammer");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Quench → Hammer → Quench")).toBeInTheDocument();
    await expect(canvas.getByText("Attempt 2 of 3")).toBeInTheDocument();
    await matchScreenScreenshot(canvasElement, "quench-retry-desktop-1440.png");
  },
};

export const HoneReviewFinding: Story = {
  args: { fixture: PULMU_EXAMPLE_RUN_FIXTURES.honeFinding, kind: "hone-finding" },
  globals: screenGlobals("light", "desktop"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "desktop", "hammer");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Hone → Hammer → Quench → Hone")).toBeInTheDocument();
    await expect(canvas.getByText("Attempt 1 of 2")).toBeInTheDocument();
    await expect(canvas.getByText(/medium severity · Blocking/i)).toBeInTheDocument();
    await expect(canvas.queryByText("Verification PASS")).not.toBeInTheDocument();
    await matchScreenScreenshot(canvasElement, "hone-review-finding-desktop-1440.png");
  },
};

export const CompletedLocalDelivery: Story = {
  args: { fixture: PULMU_EXAMPLE_RUN_FIXTURES.completedLocal, kind: "completed-local" },
  globals: screenGlobals("light", "desktop"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "desktop", "ship");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Local commit")).toBeInTheDocument();
    await expect(canvas.queryByText("GitHub pull request")).not.toBeInTheDocument();
    await matchScreenScreenshot(canvasElement, "completed-local-delivery-desktop-1440.png");
  },
};

export const CompletedGitHubDelivery: Story = {
  args: { fixture: PULMU_EXAMPLE_RUN_FIXTURES.completedGithub, kind: "completed-github" },
  globals: screenGlobals("dark", "desktop"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "desktop", "ship");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("GitHub pull request")).toBeInTheDocument();
    await expect(canvas.queryByText("Local commit")).not.toBeInTheDocument();
    await matchScreenScreenshot(canvasElement, "completed-github-delivery-desktop-1440.png");
  },
};

export const FailedRun: Story = {
  args: { fixture: PULMU_EXAMPLE_RUN_FIXTURES.failed, kind: "failed" },
  globals: screenGlobals("light", "desktop"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "desktop", "quench");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Run failed")).toBeInTheDocument();
    await expect(canvas.getByText("Failure code: VERIFY_FAILED")).toBeInTheDocument();
    await expect(canvas.getByText("No delivery was created")).toBeInTheDocument();
    await matchScreenScreenshot(canvasElement, "failed-run-desktop-1440.png");
  },
};

export const InterruptedRun: Story = {
  args: { fixture: PULMU_EXAMPLE_RUN_FIXTURES.interrupted, kind: "interrupted" },
  globals: screenGlobals("dark", "desktop"),
  play: async ({ canvasElement }) => {
    await assertRunScreen(canvasElement, "desktop", "hammer");
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Run interrupted")).toBeInTheDocument();
    await expect(canvas.queryByText(/Failure code:/)).not.toBeInTheDocument();
    await expect(canvas.getByText("No delivery was created")).toBeInTheDocument();
    await matchScreenScreenshot(canvasElement, "interrupted-run-desktop-1440.png");
  },
};
