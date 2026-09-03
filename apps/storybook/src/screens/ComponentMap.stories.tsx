import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { componentMaturity } from "@pulmu/ui";
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
  await stabilizeScreenVisual(target);
  if (!target.isConnected) throw new Error(`Component Map target detached while settling: ${name}`);
  const { expect: browserExpect } = await import("vitest");
  await browserExpect.element(target).toMatchScreenshot(name);
}

async function matchComponentMapSections(canvasElement: HTMLElement, viewport: ScreenViewport) {
  if (!("__vitest_worker__" in window)) return;
  const dark = canvasElement.querySelector<HTMLElement>('[data-testid="dark-theme-pane"]')!;
  const light = canvasElement.querySelector<HTMLElement>('[data-testid="light-theme-pane"]')!;
  const targets = [
    ["dark-header", dark.querySelector<HTMLElement>(".component-map__pane-header")!],
    ["light-header", light.querySelector<HTMLElement>(".component-map__pane-header")!],
    ["dark-data", dark.querySelector<HTMLElement>('.component-map__group[aria-label^="Data,"] .pulmu-chart')!],
    ["light-data", light.querySelector<HTMLElement>('.component-map__group[aria-label^="Data,"] .pulmu-chart')!],
    ["dark-workflow", dark.querySelector<HTMLElement>('.pulmu-forge-stage[data-stage-id="hammer"]')!],
    ["light-workflow", light.querySelector<HTMLElement>('.pulmu-forge-stage[data-stage-id="hammer"]')!],
    ["dark-overlays", dark.querySelector<HTMLElement>(".component-map__gaps")!],
    ["light-overlays", light.querySelector<HTMLElement>(".component-map__gaps")!],
  ] as const;

  for (const [section, target] of targets) {
    await matchComponentMapScreenshot(target, `component-map-${viewport}-${section}.png`);
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

  const directGroupHeadings = (pane: HTMLElement) => [...pane.querySelectorAll<HTMLElement>(":scope > section > h3")]
    .map(({ textContent }) => textContent);
  await expect(directGroupHeadings(dark)).toEqual(componentMapGroups);
  await expect(directGroupHeadings(light)).toEqual(componentMapGroups);
  await expect(Object.keys(componentAudit).sort()).toEqual(Object.keys(componentMaturity).sort());
  await expect(Object.values(componentAudit).map(({ status }) => status)).not.toContain("Broken");
  for (const [name, entry] of Object.entries(componentAudit)) {
    await expect(entry.evidence).toMatch(/^(story|docs):\S+\.(stories\.tsx|mdx|md)$/);
    if (entry.status === "Ready") await expect(entry.evidence.startsWith("inventory:")).toBe(false);
    await expect(entry.note.trim().length).toBeGreaterThan(0);
    for (const pane of [dark, light]) {
      const item = [...pane.querySelectorAll<HTMLElement>(".component-map__inventory li")]
        .find((candidate) => candidate.querySelector("code")?.textContent === name);
      await expect(item).toHaveAttribute("data-audit-evidence", entry.evidence);
    }
  }
  await expect(Object.keys(componentAuditGaps)).toEqual(["Drawer", "Toast"]);
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
  const finalGap = within(light).getByText("Toast").closest("li")!.getBoundingClientRect();
  await expect(finalGap.bottom).toBeLessThanOrEqual(map.getBoundingClientRect().bottom);
  await expect(map.getBoundingClientRect().height).toBeGreaterThan(window.innerHeight);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  await expect(document.body.scrollWidth).toBeLessThanOrEqual(document.body.clientWidth);
}

const visualStory = (viewport: ScreenViewport): Story => ({
  globals: screenGlobals("dark", viewport),
  render: () => <ComponentMap />,
  play: async ({ canvasElement }) => {
    await assertComponentMap(canvasElement, viewport);
    await matchComponentMapSections(canvasElement, viewport);
  },
});

export const Desktop1440 = visualStory("desktop");
export const Tablet768 = visualStory("tablet");
export const Mobile390 = visualStory("mobile");
export const Narrow320 = visualStory("narrow");
