import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { PULMU_STAGES } from "@pulmu/model";

import { TokenCatalog } from "./TokenCatalog";

const meta = {
  title: "02 Tokens/Token Catalog",
  component: TokenCatalog,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TokenCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkFoundations: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const pageHeading = canvas.getByRole("heading", { level: 1, name: "Iron & Ember color tokens" });
    await expect(pageHeading).toBeVisible();
    await expect(pageHeading).toHaveAttribute("lang", "en");
    await expect(canvas.getByRole("list", { name: "Primitive tokens" })).toHaveAttribute("lang", "en");
    for (const heading of [
      "Light and Dark source palettes",
      "Soft Forge depth contract",
      "Semantic roles and contrast",
      "Forge lifecycle mapping",
      "Theme-aware charts",
      "Compatibility and consumption",
    ]) {
      await expect(canvas.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(canvas.getByRole("list", { name: "light theme palette" })).toBeVisible();
    await expect(canvas.getByRole("list", { name: "dark theme palette" })).toBeVisible();
    await expect(canvas.getAllByText("#E66A32").length).toBeGreaterThan(0);
    await expect(canvas.getAllByText("#D85B26").length).toBeGreaterThan(0);
    for (const stage of PULMU_STAGES) {
      await expect(canvas.getByText(`${stage.icon} ${stage.name}`)).toBeVisible();
    }

    const rootStyles = getComputedStyle(document.documentElement);
    await expect(rootStyles.getPropertyValue("--pulmu-color-surface-canvas").trim()).not.toBe("");
    await expect(rootStyles.getPropertyValue("--pulmu-focus-ring-width").trim()).toBe("3px");
    await expect(rootStyles.getPropertyValue("--pulmu-color-surface-raised").trim()).not.toBe("");
    await expect(rootStyles.getPropertyValue("--pulmu-shadow-inset").trim()).not.toBe("");

    const depthComparison = canvas.getByRole("group", { name: "Surface depth comparison" });
    for (const role of ["default", "raised", "inset", "overlay"]) {
      await expect(depthComparison.querySelector(`[data-depth-role="${role}"]`)).not.toBeNull();
    }
    await expect(getComputedStyle(depthComparison.querySelector('[data-depth-role="default"]')!).boxShadow).toBe("none");
    await expect(getComputedStyle(depthComparison.querySelector('[data-depth-role="raised"]')!).boxShadow).not.toBe("none");
    await expect(getComputedStyle(depthComparison.querySelector('[data-depth-role="inset"]')!).boxShadow).toContain("inset");
    await expect(getComputedStyle(depthComparison.querySelector('[data-depth-role="overlay"]')!).boxShadow).not.toBe("none");
    await expect(canvas.getByRole("button", { name: "Selected" })).toHaveAttribute("aria-pressed", "true");
    await expect(getComputedStyle(canvas.getByRole("button", { name: "Disabled" })).boxShadow).toBe("none");
    await expect(canvas.getByRole("group", { name: "Dense data and status restraint" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Known limitations" })).toBeVisible();
    const depthMatrix = canvas.getByRole("table", { name: "Light and Dark depth token matrix" });
    await expect(within(depthMatrix).getAllByRole("row")).toHaveLength(4);

    const previewKinds = new Set(
      [...canvasElement.querySelectorAll<HTMLElement>("[data-token-preview-kind]")]
        .map((element) => element.dataset.tokenPreviewKind),
    );
    for (const kind of ["color", "typography", "spacing", "size", "radius", "border", "shadow", "opacity", "z-index", "breakpoint", "motion"]) {
      await expect(previewKinds).toContain(kind);
    }
    const preview = (cssVar: string) => canvasElement.querySelector<HTMLElement>(`[data-token-preview="${cssVar}"]`)!;
    await expect(getComputedStyle(preview("--pulmu-button-foreground")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(preview("--pulmu-font-size-xl")).fontSize).toBe("20px");
    const weightPreview = preview("--pulmu-font-weight-regular");
    await expect(getComputedStyle(weightPreview).fontWeight).toBe("400");
    await expect(getComputedStyle(weightPreview).lineHeight).toBe("24px");
    await expect(weightPreview.scrollHeight).toBeLessThanOrEqual(weightPreview.clientHeight);
    const lineHeightPreview = preview("--pulmu-line-height-relaxed");
    await expect(getComputedStyle(lineHeightPreview).fontWeight).toBe("400");
    await expect(getComputedStyle(lineHeightPreview).lineHeight).toBe("26.4px");
    await expect(lineHeightPreview.scrollHeight).toBeLessThanOrEqual(lineHeightPreview.clientHeight);
    await expect(
      getComputedStyle(preview("--pulmu-typography-metric-variant-numeric")).fontVariantNumeric,
    ).toContain("tabular-nums");
    await expect(getComputedStyle(preview("--pulmu-space-2")).gap).toBe("8px");
    await expect(getComputedStyle(preview("--pulmu-size-icon-sm")).width).toBe("16px");
    await expect(getComputedStyle(preview("--pulmu-radius-md")).borderRadius).toBe("12px");
    await expect(getComputedStyle(preview("--pulmu-border-width-strong")).borderTopWidth).toBe("2px");
    await expect(getComputedStyle(preview("--pulmu-shadow-md")).boxShadow).not.toBe("none");
    await expect(getComputedStyle(preview("--pulmu-opacity-disabled")).opacity).toBe("0.48");
    await expect(getComputedStyle(preview("--pulmu-z-sticky")).zIndex).toBe("auto");
    await expect(getComputedStyle(preview("--pulmu-z-sticky").firstElementChild!).zIndex).toBe("100");
    await expect(getComputedStyle(preview("--pulmu-breakpoint-mobile")).maxWidth).toBe("390px");
    const durationPreview = getComputedStyle(preview("--pulmu-duration-fast")).transitionDuration;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await expect(Number.parseFloat(durationPreview)).toBeLessThanOrEqual(0.00001);
    } else {
      await expect(durationPreview).toBe("0.12s");
    }
    await expect(getComputedStyle(preview("--pulmu-easing-standard")).transitionTimingFunction).toContain("cubic-bezier");

    const firstLink = canvas.getByRole("link", { name: "Palettes" });
    firstLink.focus();
    await expect(firstLink).toHaveFocus();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const LightFoundations: Story = {
  globals: { theme: "light" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(document.documentElement).toHaveAttribute("data-theme", "light");
    await expect(canvas.getByRole("heading", { level: 1, name: "Iron & Ember color tokens" })).toBeVisible();
    const rootStyles = getComputedStyle(document.documentElement);
    await expect(rootStyles.getPropertyValue("--pulmu-color-surface-canvas").trim()).toBe("#F7F7F5");
    await expect(rootStyles.getPropertyValue("--pulmu-color-brand-default").trim()).toBe("#D85B26");
    const raised = canvasElement.querySelector<HTMLElement>('[data-depth-role="raised"]')!;
    const inset = canvasElement.querySelector<HTMLElement>('[data-depth-role="inset"]')!;
    await expect(getComputedStyle(raised).backgroundColor).toBe("rgb(255, 255, 255)");
    await expect(getComputedStyle(raised).boxShadow).not.toBe("none");
    await expect(getComputedStyle(inset).boxShadow).toContain("inset");
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const ReducedMotionAndFocus: Story = {
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;
    const rootStyles = getComputedStyle(root);

    await expect(root).toHaveAttribute("data-motion", "reduced");
    for (const duration of ["fast", "normal", "slow"]) {
      await expect(rootStyles.getPropertyValue(`--pulmu-motion-duration-${duration}`).trim()).toBe("0ms");
    }

    const motionPreview = canvasElement.querySelector<HTMLElement>(
      '[data-token-preview="--pulmu-motion-duration-fast"]',
    )!;
    const motionStyles = getComputedStyle(motionPreview);
    await expect(Number.parseFloat(motionStyles.transitionDuration)).toBeLessThanOrEqual(0.00001);
    await expect(Number.parseFloat(motionStyles.animationDuration)).toBeLessThanOrEqual(0.00001);

    const firstLink = canvas.getByRole("link", { name: "Palettes" });
    await userEvent.tab();
    const hasFocus = document.activeElement === firstLink;
    const isFocusVisible = firstLink.matches(":focus-visible");
    const { outlineColor, outlineOffset, outlineStyle, outlineWidth } = getComputedStyle(firstLink);
    const focusPreview = canvasElement.querySelector<HTMLElement>(
      '[data-token-preview="--pulmu-focus-ring-color"]',
    )!;
    const focusTokenColor = getComputedStyle(focusPreview).backgroundColor;
    await expect(hasFocus).toBe(true);
    await expect(isFocusVisible).toBe(true);
    await expect(outlineWidth).toBe("3px");
    await expect(outlineStyle).toBe("solid");
    if (window.matchMedia("(forced-colors: active)").matches) {
      await expect(outlineColor).not.toBe("");
    } else {
      await expect(outlineColor).toBe(focusTokenColor);
    }
    await expect(outlineOffset).toBe("3px");
  },
};

export const NarrowReflow: Story = {
  globals: { viewport: { isRotated: false, value: "narrow" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Iron & Ember color tokens" })).toBeVisible();
    const comparison = canvas.getByRole("group", { name: "Surface depth comparison" });
    await expect(getComputedStyle(comparison).gridTemplateColumns.split(" ")).toHaveLength(1);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
