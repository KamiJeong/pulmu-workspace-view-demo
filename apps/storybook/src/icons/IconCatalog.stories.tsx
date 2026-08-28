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

export const Iconography: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { level: 1, name: "Icon catalog" })).toBeVisible();
    for (const heading of ["General UI", "Lifecycle status", "Seven canonical forge stages", "Brand", "Size, stroke, and accessibility"]) {
      await expect(canvas.getByRole("heading", { name: heading })).toBeVisible();
    }

    const stageCards = canvasElement.querySelectorAll<HTMLElement>('[data-stage-icon="true"]');
    await expect(stageCards).toHaveLength(7);
    await expect([...stageCards].map(({ dataset }) => dataset.stageId)).toEqual(PULMU_STAGES.map(({ id }) => id));
    const shapeCard = canvasElement.querySelector<HTMLElement>('[data-stage-id="shape"]')!;
    await expect(within(shapeCard).getByTestId("pattern-icon")).toBeVisible();
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
  },
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
