import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { PULMU_STAGES } from "@pulmu/model";

import { IconCatalog } from "./IconCatalog";

const meta = {
  title: "04 Icons/Icon Catalog",
  component: IconCatalog,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof IconCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUS_LABELS = {
  completed: "Completed",
  failed: "Failed",
  in_progress: "Current",
  pending: "Pending",
} as const;

const STATUS_TOKENS = {
  completed: "--pulmu-color-stage-status-completed",
  failed: "--pulmu-color-stage-status-failed",
  in_progress: "--pulmu-color-stage-status-in-progress",
  pending: "--pulmu-color-stage-status-pending",
} as const;

const semanticColor = (token: string) => {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const verifyIconCatalog = async (canvasElement: HTMLElement, theme: "dark" | "light") => {
    const canvas = within(canvasElement);

    await expect(document.documentElement).toHaveAttribute("data-theme", theme);
    await expect(canvas.getByRole("heading", { level: 1, name: "Icon catalog" })).toBeVisible();
    for (const heading of ["General UI", "Lifecycle status", "Forge identity", "Brand", "Size, stroke, and accessibility"]) {
      await expect(canvas.getByRole("heading", { name: heading })).toBeVisible();
    }

    const sequences = canvasElement.querySelectorAll<HTMLOListElement>('[data-stage-sequence="true"]');
    await expect(sequences).toHaveLength(2);
    const expectedStatuses = [
      ["completed", "completed", "completed", "in_progress", "pending", "pending", "pending"],
      ["completed", "completed", "completed", "completed", "failed", "pending", "pending"],
    ];
    for (const [sequenceIndex, sequence] of [...sequences].entries()) {
      const stageCards = sequence.querySelectorAll<HTMLElement>("[data-stage-id]");
      await expect(stageCards).toHaveLength(7);
      await expect([...stageCards].map(({ dataset }) => dataset.stageId)).toEqual(PULMU_STAGES.map(({ id }) => id));
      await expect([...stageCards].map(({ dataset }) => dataset.stageStatus)).toEqual(expectedStatuses[sequenceIndex]);

      for (const [index, stageCard] of [...stageCards].entries()) {
        const status = expectedStatuses[sequenceIndex][index] as keyof typeof STATUS_TOKENS;
        const identity = stageCard.querySelector<HTMLElement>(".stage-icon-card__identity")!;
        const statusDisplay = stageCard.querySelector<SVGElement>(".stage-icon-card__status svg")!;
        await expect(within(stageCard).getByText(STATUS_LABELS[status])).toBeVisible();
        await expect(getComputedStyle(identity).color).toBe(semanticColor("--pulmu-color-text-secondary"));
        await expect(statusDisplay).toHaveAttribute("data-color-token", STATUS_TOKENS[status]);
        await expect(getComputedStyle(statusDisplay).color).toBe(semanticColor(STATUS_TOKENS[status]));
      }

      const shapeCard = sequence.querySelector<HTMLElement>('[data-stage-id="shape"]')!;
      await expect(within(shapeCard).getByText("Pattern", { selector: "strong" })).toBeVisible();
      await expect(within(shapeCard).getByText("Conditional design pass inside Shape")).toBeVisible();
      await expect(sequence.querySelectorAll('[data-pattern-pass="true"]')).toHaveLength(1);
      for (const stage of PULMU_STAGES) {
        await expect(sequence).not.toHaveTextContent(stage.icon);
      }
      await expect(sequence).not.toHaveTextContent("🎨");
    }
    await expect(canvasElement.querySelector('[data-stage-id="pattern"]')).toBeNull();

    for (const icon of canvasElement.querySelectorAll("svg")) {
      await expect(icon).toHaveAttribute("focusable", "false");
    }
    for (const decorativeIcon of canvasElement.querySelectorAll('svg[aria-hidden="true"]')) {
      await expect(decorativeIcon).not.toHaveAttribute("role");
    }
    await expect(canvas.getByRole("img", { name: "Icon guidance" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Open icon settings" })).toBeVisible();
    await expect(canvas.getByText("Running", { selector: "strong" })).toBeVisible();

    const sizedIcons = canvasElement.querySelectorAll<SVGElement>(".icon-size-row svg");
    await expect(getComputedStyle(sizedIcons[0]).width).toBe("16px");
    await expect(getComputedStyle(sizedIcons[1]).width).toBe("20px");
    await expect(sizedIcons[0]).toHaveAttribute("stroke-width", "2");

    const loading = canvas.getByTestId("loading-icon");
    await expect(within(loading).getByText("Loading workspace")).toBeVisible();
    const loadingGlyph = loading.querySelector<SVGElement>(".pulmu-loading-icon__glyph")!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await expect(getComputedStyle(loadingGlyph).animationName).toBe("none");
    } else {
      await expect(getComputedStyle(loadingGlyph).animationName).toBe("pulmu-icon-spin");
    }

    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
};

export const Iconography: Story = {
  name: "Dark iconography",
  globals: { theme: "dark" },
  play: async ({ canvasElement }) => verifyIconCatalog(canvasElement, "dark"),
};

export const LightIconography: Story = {
  globals: { theme: "light" },
  play: async ({ canvasElement }) => verifyIconCatalog(canvasElement, "light"),
};

export const ReducedMotion: Story = {
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loading = canvas.getByTestId("loading-icon");
    const loadingGlyph = loading.querySelector<SVGElement>(".pulmu-loading-icon__glyph")!;

    await expect(document.documentElement).toHaveAttribute("data-motion", "reduced");
    await expect(getComputedStyle(loadingGlyph).animationName).toBe("none");
    await expect(loadingGlyph).toBeVisible();
    await expect(within(loading).getByText("Loading workspace")).toBeVisible();
  },
};

export const NarrowReflow: Story = {
  globals: { viewport: { isRotated: false, value: "narrow" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 1, name: "Icon catalog" })).toBeVisible();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
