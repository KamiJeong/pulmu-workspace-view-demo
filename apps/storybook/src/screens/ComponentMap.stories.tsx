import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { componentMaturity } from "@pulmu/ui";
import { storyAuditManifest } from "../audit/storyAuditManifest.mjs";
import {
  ComponentMap,
  componentAudit,
  componentAuditGaps,
  componentMapGroups,
} from "./ComponentMap";
import { screenGlobals, stabilizeScreenVisual, type ScreenViewport } from "./screenTestUtils";

const meta = {
  title: "10 Example Screens/Component Map",
  component: ComponentMap,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ComponentMap>;

export default meta;
type Story = StoryObj<typeof meta>;

async function matchComponentMapScreenshot(target: HTMLElement, name: string) {
  if (!("__vitest_worker__" in window)) return;

  if (!target.isConnected) throw new Error(`Cannot capture detached Component Map target: ${name}`);
  const previewFrame = target.ownerDocument.defaultView?.frameElement?.parentElement;
  if (!previewFrame) throw new Error(`Cannot find the Component Map preview frame: ${name}`);
  const originalStyle = previewFrame.getAttribute("style");
  previewFrame.style.setProperty("height", `${Math.ceil(target.getBoundingClientRect().height)}px`);
  previewFrame.style.setProperty("transform", "none", "important");
  try {
    await stabilizeScreenVisual(target);
    if (!target.isConnected) throw new Error(`Component Map target detached while settling: ${name}`);
    const { expect: browserExpect } = await import("vitest");
    await browserExpect.element(target).toMatchScreenshot(name);
  } finally {
    if (originalStyle === null) previewFrame.removeAttribute("style");
    else previewFrame.setAttribute("style", originalStyle);
  }
}

async function assertComponentMap(canvasElement: HTMLElement, viewport: ScreenViewport) {
  const canvas = within(canvasElement);
  const map = canvas.getByRole("main");
  const dark = canvas.getByTestId("dark-theme-pane");
  const light = canvas.getByTestId("light-theme-pane");
  const darkProbe = canvas.getByTestId("dark-theme-probe");
  const lightProbe = canvas.getByTestId("light-theme-probe");

  await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  await expect(dark).toHaveAttribute("data-pulmu-theme", "dark");
  await expect(light).toHaveAttribute("data-pulmu-theme", "light");
  await expect(within(dark).getByRole("heading", { level: 2, name: "Dark theme" })).toBeVisible();
  await expect(within(light).getByRole("heading", { level: 2, name: "Light theme" })).toBeVisible();
  const inventory = canvas.getByText(`Published inventory (${Object.keys(componentAudit).length} APIs)`);
  inventory.focus();
  await expect(inventory.tagName).toBe("SUMMARY");
  await expect(inventory).toHaveFocus();
  await userEvent.click(inventory);
  await expect(inventory.closest("details")).toHaveAttribute("open");

  const directGroupHeadings = (pane: HTMLElement) => [...pane.querySelectorAll<HTMLElement>(":scope > section > h3")]
    .map(({ textContent }) => textContent);
  await expect(directGroupHeadings(dark)).toEqual(componentMapGroups);
  await expect(directGroupHeadings(light)).toEqual(componentMapGroups);
  await expect(Object.keys(componentAudit).sort()).toEqual(Object.keys(componentMaturity).sort());
  const storyIds = new Set(storyAuditManifest.map(({ id }) => id));
  await expect(storyAuditManifest).toHaveLength(new Set(storyAuditManifest.map(({ id }) => id)).size);
  await expect(Object.values(componentAudit).map(({ status }) => status)).not.toContain("Broken");
  for (const [name, entry] of Object.entries(componentAudit)) {
    await expect(entry.evidence).toMatch(/^story:\S+$/);
    await expect(entry.note.trim().length).toBeGreaterThan(0);
    await expect(storyIds.has(entry.evidence.slice("story:".length))).toBe(true);
    const item = [...map.querySelectorAll<HTMLElement>(".component-map__inventory li")]
      .find((candidate) => candidate.querySelector("code")?.textContent === name);
    await expect(item).toHaveAttribute("data-audit-evidence", entry.evidence);
    await expect(within(item!).getByRole("link", { name: new RegExp(`^Evidence for ${name}:`) })).toHaveAttribute(
      "href",
      `./?path=/story/${entry.evidence.slice("story:".length)}`,
    );
  }
  await expect(Object.keys(componentAuditGaps)).toEqual(["Drawer", "Toast"]);
  await userEvent.click(inventory);
  await expect(inventory.closest("details")).not.toHaveAttribute("open");
  await expect(within(dark).getByRole("list", { name: "component-map-dark missing component gaps" })).toBeVisible();
  await expect(within(light).getByRole("list", { name: "component-map-light missing component gaps" })).toBeVisible();

  const darkStyle = getComputedStyle(darkProbe);
  const lightStyle = getComputedStyle(lightProbe);
  await expect(darkStyle.colorScheme).toBe("dark");
  await expect(lightStyle.colorScheme).toBe("light");
  await expect(darkStyle.backgroundColor).not.toBe(lightStyle.backgroundColor);
  await expect(darkStyle.borderColor).not.toBe(lightStyle.borderColor);

  const darkBounds = dark.getBoundingClientRect();
  const lightBounds = light.getBoundingClientRect();
  if (viewport === "desktop") {
    await expect(Math.round(darkBounds.top)).toBe(Math.round(lightBounds.top));
    await expect(darkBounds.left).toBeLessThan(lightBounds.left);
  } else {
    await expect(darkBounds.top).toBeLessThan(lightBounds.top);
  }
  if (viewport === "mobile" || viewport === "narrow") {
    const firstSamples = dark.querySelector<HTMLElement>(".component-map__samples")!;
    const [first, second] = [...firstSamples.children].map((element) => element.getBoundingClientRect());
    await expect(second.top).toBeGreaterThanOrEqual(first.bottom);
    for (const pane of [dark, light]) {
      const stages = [...pane.querySelectorAll<HTMLElement>(".pulmu-forge-stage")];
      await expect(stages[1].getBoundingClientRect().top).toBeGreaterThanOrEqual(stages[0].getBoundingClientRect().bottom);
    }
  }

  for (const pane of [dark, light]) {
    const states = [...pane.querySelectorAll<HTMLElement>("[data-state-sample]")];
    await expect(states.map(({ dataset }) => dataset.stateSample)).toEqual(["loading", "empty", "error"]);
    await expect(states.map(({ textContent }) => textContent?.trim())).toEqual([
      "",
      "No matching componentsChange filters or add a component story.",
      "Audit data unavailableRetry the Storybook audit after resolving the failure.",
    ]);
    const headings = within(pane).getAllByRole("heading").map(({ tagName, textContent }) => ({
      level: Number(tagName.slice(1)),
      text: textContent,
    }));
    await expect(headings).toEqual([
      { level: 2, text: pane === dark ? "Dark theme" : "Light theme" },
      { level: 3, text: "Foundations" },
      { level: 3, text: "Actions & navigation" },
      { level: 3, text: "Fields" },
      { level: 3, text: "Content & feedback" },
      { level: 4, text: "No matching components" },
      { level: 4, text: "Audit data unavailable" },
      { level: 3, text: "Data" },
      { level: 3, text: "Forge activity distribution" },
      { level: 3, text: "Pulmu workflow" },
      { level: 3, text: "Overlays" },
    ]);
  }

  for (const trigger of canvas.getAllByRole("button", { name: /^(Popover|Actions)$/ })) {
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
  await expect(canvasElement.querySelectorAll("dialog[open]")).toHaveLength(0);

  for (const pane of [dark, light]) {
    const table = within(pane).getByRole("table", { name: /audit evidence/i });
    await expect(table.parentElement).toHaveAttribute("role", "region");
    await expect(table.parentElement).toHaveAttribute("tabindex", "0");
    await expect(getComputedStyle(table.parentElement!).overflowX).toBe("auto");
    await expect(pane.scrollWidth).toBeLessThanOrEqual(pane.clientWidth);
  }
  const expectedWidth = { desktop: 1440, tablet: 768, mobile: 390, narrow: 320 }[viewport];
  await expect(window.innerWidth).toBe(expectedWidth);
  await expect(map.scrollWidth).toBeLessThanOrEqual(map.clientWidth);
  const mapBounds = map.getBoundingClientRect();
  const finalGap = within(light).getByText("Toast").closest("li")!.getBoundingClientRect();
  for (const bounds of [darkBounds, lightBounds, finalGap]) {
    await expect(bounds.left).toBeGreaterThanOrEqual(mapBounds.left);
    await expect(bounds.top).toBeGreaterThanOrEqual(mapBounds.top);
    await expect(bounds.right).toBeLessThanOrEqual(mapBounds.right);
    await expect(bounds.bottom).toBeLessThanOrEqual(mapBounds.bottom);
  }
  await expect(mapBounds.height).toBeGreaterThan(window.innerHeight);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  await expect(document.body.scrollWidth).toBeLessThanOrEqual(document.body.clientWidth);
}

async function assertOverlayLifecycles(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const panes = [canvas.getByTestId("dark-theme-pane"), canvas.getByTestId("light-theme-pane")];
  const initialScroll = { left: window.scrollX, top: window.scrollY };
  const keyboard = "__vitest_worker__" in window
    ? (await import("vitest/browser")).userEvent
    : userEvent;

  for (const pane of panes) {
    const paneCanvas = within(pane);
    const otherPane = panes.find((candidate) => candidate !== pane)!;
    const otherCanvas = within(otherPane);

    const tooltipTrigger = paneCanvas.getByRole("button", { name: "Theme guidance" });
    tooltipTrigger.focus();
    await expect(tooltipTrigger).toHaveFocus();
    const tooltip = paneCanvas.getByRole("tooltip");
    await expect(tooltip).toHaveTextContent("Names and behavior are unchanged across themes.");
    await expect(tooltipTrigger).toHaveAttribute("aria-describedby", tooltip.id);
    await expect(tooltip).toBeVisible();
    await expect(otherCanvas.queryByRole("tooltip")).not.toBeInTheDocument();
    await keyboard.keyboard("{Escape}");
    await expect(tooltipTrigger).toHaveFocus();
    await expect(paneCanvas.queryByRole("tooltip")).not.toBeInTheDocument();

    const popoverTrigger = paneCanvas.getByRole("button", { name: "Popover" });
    popoverTrigger.focus();
    await keyboard.keyboard("{Enter}");
    await expect(popoverTrigger).toHaveFocus();
    await expect(popoverTrigger).toHaveAttribute("aria-expanded", "true");
    const popover = paneCanvas.getByRole("region", { name: "Popover" });
    await expect(popover).toHaveTextContent("Scoped semantic tokens resolve inside this pane.");
    await expect(otherCanvas.queryByRole("region", { name: "Popover" })).not.toBeInTheDocument();
    await keyboard.keyboard("{Escape}");
    await expect(popoverTrigger).toHaveFocus();
    await expect(popoverTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(paneCanvas.queryByRole("region", { name: "Popover" })).not.toBeInTheDocument();

    const menuTrigger = paneCanvas.getByRole("button", { name: "Actions" });
    menuTrigger.focus();
    await keyboard.keyboard("{Enter}");
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "true");
    const menu = paneCanvas.getByRole("menu", { name: /component-map-(dark|light) component actions/ });
    const viewDetails = within(menu).getByRole("menuitem", { name: "View details" });
    const archive = within(menu).getByRole("menuitem", { name: "Archive unavailable" });
    await waitFor(() => expect(viewDetails).toHaveFocus());
    await expect(archive).toBeDisabled();
    await keyboard.keyboard("{ArrowDown}");
    await expect(viewDetails).toHaveFocus();
    await expect(otherCanvas.queryByRole("menu")).not.toBeInTheDocument();
    await keyboard.keyboard("{Escape}");
    await waitFor(() => expect(menuTrigger).toHaveFocus());
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(paneCanvas.queryByRole("menu")).not.toBeInTheDocument();

    const dialogTrigger = paneCanvas.getByRole("button", { name: "Open dialog" });
    dialogTrigger.focus();
    await keyboard.keyboard("{Enter}");
    const dialog = paneCanvas.getByRole("dialog", { name: "Component review" });
    const closeDialog = within(dialog).getByRole("button", { name: "Close dialog" });
    const done = within(dialog).getByRole("button", { name: "Done" });
    const disabledStop = document.createElement("button");
    const disabledGroup = document.createElement("fieldset");
    const inheritedDisabledStop = document.createElement("button");
    const hiddenStop = document.createElement("button");
    const invisibleStop = document.createElement("button");
    const inertGroup = document.createElement("div");
    const inertStop = document.createElement("button");
    const negativeStop = document.createElement("button");
    disabledStop.disabled = true;
    disabledStop.tabIndex = 0;
    disabledStop.textContent = "Disabled focus stop";
    disabledGroup.disabled = true;
    inheritedDisabledStop.tabIndex = 0;
    inheritedDisabledStop.textContent = "Inherited disabled focus stop";
    disabledGroup.append(inheritedDisabledStop);
    hiddenStop.hidden = true;
    hiddenStop.tabIndex = 0;
    hiddenStop.textContent = "Hidden focus stop";
    invisibleStop.style.visibility = "hidden";
    invisibleStop.tabIndex = 0;
    invisibleStop.textContent = "Invisible focus stop";
    inertGroup.inert = true;
    inertStop.tabIndex = 0;
    inertStop.textContent = "Inert focus stop";
    inertGroup.append(inertStop);
    negativeStop.tabIndex = -1;
    negativeStop.textContent = "Negative focus stop";
    dialog.append(disabledStop, disabledGroup, hiddenStop, invisibleStop, inertGroup, negativeStop);
    await waitFor(() => expect(closeDialog).toHaveFocus());
    await expect(dialog).toHaveAccessibleDescription("A focused interaction sample; visual baselines keep this closed.");
    await expect(otherCanvas.queryByRole("dialog", { name: "Component review" })).not.toBeInTheDocument();
    await keyboard.tab({ shift: true });
    await expect(done).toHaveFocus();
    await keyboard.tab();
    await expect(closeDialog).toHaveFocus();
    await keyboard.tab({ shift: true });
    await expect(done).toHaveFocus();
    await keyboard.tab();
    await expect(closeDialog).toHaveFocus();
    disabledStop.remove();
    disabledGroup.remove();
    hiddenStop.remove();
    invisibleStop.remove();
    inertGroup.remove();
    negativeStop.remove();
    await keyboard.keyboard("{Escape}");
    await waitFor(() => expect(dialogTrigger).toHaveFocus());
    await expect(paneCanvas.queryByRole("dialog", { name: "Component review" })).not.toBeInTheDocument();
    await expect(canvasElement.querySelectorAll("dialog[open]")).toHaveLength(0);
  }
  window.scrollTo(initialScroll);
}

const visualStory = (viewport: ScreenViewport): Story => ({
  globals: screenGlobals("dark", viewport),
  render: () => <ComponentMap />,
  play: async ({ canvasElement }) => {
    await assertComponentMap(canvasElement, viewport);
    const map = within(canvasElement).getByRole("main");
    await matchComponentMapScreenshot(map, `component-map-${viewport}.png`);
    await assertOverlayLifecycles(canvasElement);
  },
});

export const Desktop1440 = visualStory("desktop");
export const Tablet768 = visualStory("tablet");
export const Mobile390 = visualStory("mobile");
export const Narrow320 = visualStory("narrow");
