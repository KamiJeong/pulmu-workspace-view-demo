import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EmptyWorkspaceScreen } from "./PulmuScreens";
import { assertScreenShell, matchScreenScreenshot, screenGlobals } from "./screenTestUtils";

const meta = {
  title: "10 Example Screens/Empty Workspace",
  component: EmptyWorkspaceScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EmptyWorkspaceScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyWorkspace: Story = {
  args: { onStartRun: fn() },
  globals: screenGlobals("light", "desktop"),
  play: async ({ canvasElement }) => {
    await assertScreenShell(canvasElement, "desktop");
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "No forge runs yet" })).toBeInTheDocument();
    await expect(canvas.getByText('$pulmu "<task>"', { exact: false })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Start a Pulmu run" }));
    await expect(EmptyWorkspace.args?.onStartRun).toHaveBeenCalledOnce();
    await expect(canvas.queryByText(/Billing|Invite|Repository Onboarding/i)).not.toBeInTheDocument();
    await matchScreenScreenshot(canvasElement, "empty-workspace-desktop-1440.png");
  },
};

export const EmptyWorkspaceMobile390: Story = {
  name: "Empty Workspace · Mobile · 390",
  args: { onStartRun: fn() },
  globals: screenGlobals("dark", "mobile"),
  play: async ({ canvasElement }) => {
    await assertScreenShell(canvasElement, "mobile");
    await matchScreenScreenshot(canvasElement, "empty-workspace-mobile-390.png");
  },
};
