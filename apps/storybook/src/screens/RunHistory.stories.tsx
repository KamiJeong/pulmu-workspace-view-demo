import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RunHistoryScreen } from "./PulmuScreens";
import { assertScreenShell, matchScreenScreenshot, screenGlobals } from "./screenTestUtils";

const meta = {
  title: "10 Example Screens/Run History",
  component: RunHistoryScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RunHistoryScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RunHistory: Story = {
  globals: screenGlobals("light", "desktop"),
  play: async ({ canvasElement }) => {
    await assertScreenShell(canvasElement, "desktop");
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Pulmu run history" });
    await expect(within(table).getAllByRole("row")).toHaveLength(8);
    await expect(within(table).getAllByRole("columnheader").map(({ textContent }) => textContent)).toEqual([
      "Run", "Scenario", "Status", "Last stage", "Delivery",
    ]);
    await expect(table.parentElement).toHaveAttribute("tabindex", "0");
    await matchScreenScreenshot(canvasElement, "run-history-desktop-1440.png");
  },
};

export const RunHistoryNarrow320: Story = {
  name: "Run History · Narrow · 320",
  globals: screenGlobals("dark", "narrow"),
  play: async ({ canvasElement }) => {
    await assertScreenShell(canvasElement, "narrow");
    const table = within(canvasElement).getByRole("table", { name: "Pulmu run history" });
    await expect(table.parentElement!.scrollWidth).toBeGreaterThan(table.parentElement!.clientWidth);
    await matchScreenScreenshot(canvasElement, "run-history-narrow-320.png");
  },
};

export const Loading: Story = {
  args: { status: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Loading run history" })).toHaveAttribute("aria-busy", "true");
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument();
  },
};

export const Stale: Story = {
  args: { onRefresh: fn(), status: "stale" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Run history may be out of date")).toBeInTheDocument();
    await expect(canvas.getByRole("table", { name: "Pulmu run history" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Refresh" }));
    await expect(Stale.args?.onRefresh).toHaveBeenCalledOnce();
  },
};
