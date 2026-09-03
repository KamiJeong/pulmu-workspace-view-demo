import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  activeOverviewRun,
  failedOverviewRun,
  Overview,
  type OverviewProps,
} from "./Overview";

const meta = {
  title: "10 Example Screens/Workspace Overview",
  component: Overview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Overview>;

export default meta;
type Story = StoryObj<typeof meta>;
type OverviewTheme = "light" | "dark";
type OverviewViewport = "desktop" | "tablet" | "mobile" | "narrow";

const onViewActiveRun = fn();
const readyArgs = {
  onViewActiveRun,
  run: activeOverviewRun,
  status: "ready",
} as const satisfies OverviewProps;

const visualGlobals = (theme: OverviewTheme, viewport: OverviewViewport) => ({
  motion: "reduced",
  theme,
  viewport: { isRotated: false, value: viewport },
});

async function matchOverviewScreenshot(canvasElement: HTMLElement, name: string) {
  if (!("__vitest_worker__" in window)) return;

  const document = canvasElement.ownerDocument;
  await document.fonts.ready;
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  const view = document.defaultView;
  if (view) {
    view.history.replaceState(null, "", `${view.location.pathname}${view.location.search}`);
    view.scrollTo(0, 0);
  }
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  await new Promise<void>((resolve) => {
    view?.requestAnimationFrame(() => {
      view.requestAnimationFrame(() => resolve());
    });
  });

  const { expect: browserExpect } = await import("vitest");
  await browserExpect.element(document.documentElement).toMatchScreenshot(name);
}

async function assertReadyOverview(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const shell = canvas.getByTestId("overview-shell");
  const skipLink = canvas.getByRole("link", { name: "Skip to workspace overview" });

  await expect(shell.firstElementChild).toBe(skipLink);
  await expect(skipLink).toHaveAttribute("href", "#overview-main");
  skipLink.focus();
  await expect(skipLink).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  const main = canvas.getByRole("main");
  await expect(main).toHaveAttribute("tabindex", "-1");
  await waitFor(() => expect(main).toHaveFocus());
  await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  await expect(canvasElement.querySelectorAll(".pulmu-button--primary")).toHaveLength(1);
  await expect(canvas.getByRole("button", { name: "View active run" })).toBeInTheDocument();

  const stages = [...canvasElement.querySelectorAll<HTMLElement>("[data-stage-id]")];
  await expect(stages.map((stage) => stage.dataset.stageId)).toEqual([
    "ignite", "inspect", "shape", "hammer", "quench", "hone", "ship",
  ]);
  await expect(canvasElement.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  await expect(canvasElement.querySelector('[aria-current="step"]')).toHaveAttribute("data-stage-id", "hammer");
  await expect(stages.map((stage) => stage.dataset.stageStatus)).toEqual([
    "completed", "completed", "completed", "in_progress", "pending", "pending", "pending",
  ]);
  const pattern = canvas.getByText("Pattern");
  await expect(pattern.closest("[data-stage-id]")).toHaveAttribute("data-stage-id", "shape");
  await expect(stages).toHaveLength(7);

  const table = canvas.getByRole("table", { name: "Recent Pulmu runs" });
  await expect(within(table).getAllByRole("columnheader").map(({ textContent }) => textContent)).toEqual([
    "Run", "Status", "Current stage", "Forge", "Updated",
  ]);
  const overflow = table.parentElement;
  await expect(overflow).toHaveAttribute("role", "region");
  await expect(overflow).toHaveAttribute("tabindex", "0");
  await expect(getComputedStyle(overflow!).overflowX).toBe("auto");

  const forge = canvas.getByTestId("overview-forge");
  const primary = forge.firstElementChild;
  const supporting = forge.lastElementChild;
  await expect(Boolean(primary && supporting && (primary.compareDocumentPosition(supporting) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  await expect(document.body.scrollWidth).toBeLessThanOrEqual(document.body.clientWidth);
}

async function assertNavigationKeyboard(canvasElement: HTMLElement, compact: boolean) {
  const canvas = within(canvasElement);
  const assertValidTargets = async (scope: ReturnType<typeof within>) => {
    const links = scope.getAllByRole("link");
    for (const link of links) {
      const href = link.getAttribute("href");
      await expect(href?.startsWith("#")).toBe(true);
      await expect(canvasElement.ownerDocument.querySelector(href!)).toBeInTheDocument();
    }
  };

  if (compact) {
    const opener = canvas.getByRole("button", { name: "Open workspace navigation" });
    opener.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = canvas.getByRole("dialog", { name: "Workspace navigation" });
    await expect(within(dialog).getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    await assertValidTargets(within(dialog));
    await expect(canvas.getByRole("button", { name: "Close workspace navigation" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
    return;
  }

  const current = canvas.getByRole("link", { name: "Overview" });
  await expect(current).toHaveAttribute("aria-current", "page");
  await assertValidTargets(canvas);
  const collapse = canvas.getByRole("button", { name: "Collapse workspace navigation" });
  const toggleBounds = collapse.getBoundingClientRect();
  await expect(Math.round(toggleBounds.width)).toBe(44);
  await expect(Math.round(toggleBounds.height)).toBe(44);
  collapse.focus();
  await userEvent.keyboard(" ");
  const expand = canvas.getByRole("button", { name: "Expand workspace navigation" });
  await expect(expand).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect(canvas.getByRole("button", { name: "Collapse workspace navigation" })).toBeInTheDocument();
}

async function assertCompactNavigationActivation(
  canvasElement: HTMLElement,
  linkName: "Active run" | "Recent runs",
  destinationId: "active-run" | "recent-runs-heading",
) {
  const canvas = within(canvasElement);
  const opener = canvas.getByRole("button", { name: "Open workspace navigation" });
  opener.focus();
  await userEvent.keyboard("{Enter}");

  const dialog = canvas.getByRole("dialog", { name: "Workspace navigation" });
  const destinationLink = within(dialog).getByRole("link", { name: linkName });
  destinationLink.focus();
  await userEvent.keyboard("{Enter}");

  await waitFor(() => expect(canvas.queryByRole("dialog", { name: "Workspace navigation" })).not.toBeInTheDocument());
  await expect(canvasElement.ownerDocument.defaultView?.location.hash).toBe(`#${destinationId}`);
  await waitFor(() => expect(canvasElement.querySelector(`#${destinationId}`)).toHaveFocus());
}

export const Light: Story = {
  name: "Light · Desktop · 1440",
  args: readyArgs,
  globals: visualGlobals("light", "desktop"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "View active run" }));
    await expect(onViewActiveRun).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvasElement.querySelector("#active-run")).toHaveFocus());
    await assertNavigationKeyboard(canvasElement, false);
    await matchOverviewScreenshot(canvasElement, "overview-light-desktop-1440.png");
  },
};

export const Dark: Story = {
  name: "Dark · Desktop · 1440",
  args: readyArgs,
  globals: visualGlobals("dark", "desktop"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    await matchOverviewScreenshot(canvasElement, "overview-dark-desktop-1440.png");
  },
};

export const LightTablet768: Story = {
  name: "Light · Tablet · 768",
  args: readyArgs,
  globals: visualGlobals("light", "tablet"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    await assertNavigationKeyboard(canvasElement, false);
    await matchOverviewScreenshot(canvasElement, "overview-light-tablet-768.png");
  },
};

export const Tablet768: Story = {
  name: "Dark · Tablet · 768",
  args: readyArgs,
  globals: visualGlobals("dark", "tablet"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    await assertNavigationKeyboard(canvasElement, false);
    await matchOverviewScreenshot(canvasElement, "overview-dark-tablet-768.png");
  },
};

export const LightMobile390: Story = {
  name: "Light · Mobile · 390",
  args: readyArgs,
  globals: visualGlobals("light", "mobile"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    await assertNavigationKeyboard(canvasElement, true);
    await assertCompactNavigationActivation(canvasElement, "Recent runs", "recent-runs-heading");
    await matchOverviewScreenshot(canvasElement, "overview-light-mobile-390.png");
  },
};

export const Mobile390: Story = {
  name: "Dark · Mobile · 390",
  args: readyArgs,
  globals: visualGlobals("dark", "mobile"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    await assertNavigationKeyboard(canvasElement, true);
    await assertCompactNavigationActivation(canvasElement, "Recent runs", "recent-runs-heading");
    await matchOverviewScreenshot(canvasElement, "overview-dark-mobile-390.png");
  },
};

export const LightNarrow320: Story = {
  name: "Light · Narrow · 320",
  args: readyArgs,
  globals: visualGlobals("light", "narrow"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    const table = within(canvasElement).getByRole("table", { name: "Recent Pulmu runs" });
    await expect(table.parentElement!.scrollWidth).toBeGreaterThan(table.parentElement!.clientWidth);
    await assertCompactNavigationActivation(canvasElement, "Active run", "active-run");
    await matchOverviewScreenshot(canvasElement, "overview-light-narrow-320.png");
  },
};

export const Narrow320: Story = {
  name: "Dark · Narrow · 320",
  args: readyArgs,
  globals: visualGlobals("dark", "narrow"),
  play: async ({ canvasElement }) => {
    await assertReadyOverview(canvasElement);
    const table = within(canvasElement).getByRole("table", { name: "Recent Pulmu runs" });
    await expect(table.parentElement!.scrollWidth).toBeGreaterThan(table.parentElement!.clientWidth);
    await assertCompactNavigationActivation(canvasElement, "Active run", "active-run");
    await matchOverviewScreenshot(canvasElement, "overview-dark-narrow-320.png");
  },
};

export const Loading: Story = {
  args: { ...readyArgs, status: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Loading recent runs" })).toHaveAttribute("aria-busy", "true");
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { ...readyArgs, onStartRun: fn(), status: "empty" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "No runs yet" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Start a run" })).toHaveClass("pulmu-button--secondary");
    await userEvent.click(canvas.getByRole("button", { name: "Start a run" }));
    await expect(Empty.args?.onStartRun).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { onRetry: fn(), onViewActiveRun: fn(), run: failedOverviewRun, status: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toContainElement(canvas.getByRole("heading", { name: "Recent runs could not be loaded" }));
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-stage-status="failed"]')).toHaveTextContent("Failed");
    await userEvent.click(canvas.getByRole("button", { name: "Retry loading" }));
    await expect(Error.args?.onRetry).toHaveBeenCalledOnce();
  },
};

export const Stale: Story = {
  args: { ...readyArgs, onRefresh: fn(), status: "stale" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const warning = canvas.getByText("Recent runs may be out of date").closest('[role="status"]');
    const table = canvas.getByRole("table", { name: "Recent Pulmu runs" });
    await expect(warning).toBeInTheDocument();
    await expect(table).toBeInTheDocument();
    await expect(Boolean(warning && (warning.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    await expect(canvas.getByRole("button", { name: "Refresh" })).toHaveClass("pulmu-button--quiet");
    await userEvent.click(canvas.getByRole("button", { name: "Refresh" }));
    await expect(Stale.args?.onRefresh).toHaveBeenCalledOnce();
  },
};
