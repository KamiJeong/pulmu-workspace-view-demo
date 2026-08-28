import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

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

    const pageHeading = canvas.getByRole("heading", { level: 1, name: "Token catalog" });
    await expect(pageHeading).toBeVisible();
    await expect(pageHeading).toHaveAttribute("lang", "en");
    await expect(canvas.getByRole("list", { name: "Primitive tokens" })).toHaveAttribute("lang", "en");
    for (const heading of [
      "Semantic foundations and contrast",
      "Action, status, and canonical stages",
      "Chart palette and motion",
      "Primitive scale",
      "Component aliases and consumption",
    ]) {
      await expect(canvas.getByRole("heading", { name: heading })).toBeVisible();
    }
    for (const stage of PULMU_STAGES) {
      await expect(canvas.getByText(`${stage.icon} ${stage.name}`)).toBeVisible();
    }

    const rootStyles = getComputedStyle(document.documentElement);
    await expect(rootStyles.getPropertyValue("--pulmu-color-surface-canvas").trim()).not.toBe("");
    await expect(rootStyles.getPropertyValue("--pulmu-focus-ring-width").trim()).toBe("3px");

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
    await expect(getComputedStyle(preview("--pulmu-space-2")).gap).toBe("8px");
    await expect(getComputedStyle(preview("--pulmu-size-icon-sm")).width).toBe("16px");
    await expect(getComputedStyle(preview("--pulmu-radius-md")).borderRadius).toBe("12px");
    await expect(getComputedStyle(preview("--pulmu-border-width-strong")).borderTopWidth).toBe("2px");
    await expect(getComputedStyle(preview("--pulmu-shadow-md")).boxShadow).not.toBe("none");
    await expect(getComputedStyle(preview("--pulmu-opacity-disabled")).opacity).toBe("0.48");
    await expect(getComputedStyle(preview("--pulmu-z-sticky")).zIndex).toBe("auto");
    await expect(getComputedStyle(preview("--pulmu-z-sticky").firstElementChild!).zIndex).toBe("100");
    await expect(getComputedStyle(preview("--pulmu-breakpoint-mobile")).maxWidth).toBe("390px");
    await expect(getComputedStyle(preview("--pulmu-duration-fast")).transitionDuration).toBe("0.12s");
    await expect(getComputedStyle(preview("--pulmu-easing-standard")).transitionTimingFunction).toContain("cubic-bezier");

    const firstLink = canvas.getByRole("link", { name: "Semantic" });
    firstLink.focus();
    await expect(firstLink).toHaveFocus();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const NarrowReflow: Story = {
  globals: { viewport: { isRotated: false, value: "narrow" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Token catalog" })).toBeVisible();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
