import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { PULMU_STAGES } from "@pulmu/model";

import { TypographyPreview } from "./TypographyPreview";

const meta = {
  title: "03 Typography/Typography Preview",
  component: TypographyPreview,
  args: { forceFallback: false, locale: "ko" },
  argTypes: {
    forceFallback: { control: "boolean" },
    locale: { control: false },
  },
  parameters: { layout: "fullscreen" },
  render: (args, context) => (
    <TypographyPreview {...args} locale={context.globals.locale === "en" ? "en" : "ko"} />
  ),
} satisfies Meta<typeof TypographyPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const assertTypographyContract = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("heading", { level: 1, name: "Typography system" })).toBeVisible();
  await expect(canvas.getByRole("status")).toHaveTextContent("Running · Hammer in progress");

  for (const stage of PULMU_STAGES) {
    await expect(canvas.getByText(stage.name, { exact: true })).toBeVisible();
  }

  for (const metric of canvas.getAllByTestId("metric-value")) {
    await expect(getComputedStyle(metric).fontVariantNumeric).toContain("tabular-nums");
  }

  const monoFamily = getComputedStyle(document.documentElement)
    .getPropertyValue("--pulmu-typography-code-family")
    .trim();
  for (const reference of canvas.getAllByTestId("mono-reference")) {
    await expect(getComputedStyle(reference).fontFamily).toContain("ui-monospace");
  }
  await expect(monoFamily).toContain("ui-monospace");

  const wrapped = canvas.getByTestId("wrapped-identifier");
  const ellipsis = canvas.getByTestId("ellipsis-identifier");
  await expect(wrapped).toHaveTextContent("pulmu/feat/typography-system-with-resilient-korean-english-identifiers");
  await expect(ellipsis).toHaveAccessibleName(/pulmu\/feat\/typography-system/);
  await expect(ellipsis).toHaveAttribute("title", wrapped.textContent);
  await userEvent.tab();
  await expect(ellipsis).toHaveFocus();
  await expect(getComputedStyle(ellipsis).whiteSpace).toBe("normal");
  await expect(ellipsis.scrollWidth).toBeLessThanOrEqual(ellipsis.clientWidth);
  await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
};

export const PulmuContent: Story = {
  play: async ({ canvasElement }) => {
    await assertTypographyContract(canvasElement);
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/한국어 설명과 canonical English term/)).toBeVisible();
    await expect(canvas.getByTestId("typography-preview")).toHaveAttribute("lang", "ko");
    await expect(canvas.getByRole("heading", { level: 1, name: "Typography system" })).toHaveAttribute("lang", "en");
    await expect(canvas.getByRole("status")).toHaveAttribute("lang", "en");
    await expect(canvas.getByText(/한국어 설명과 canonical English term/)).toHaveAttribute("lang", "ko");
    await expect(canvas.getByRole("heading", { name: "Font fallback and license record" }).closest("aside")).toHaveAttribute("lang", "en");
    await expect(canvas.getByText(/SIL Open Font License 1.1/)).toBeVisible();
  },
};

export const MissingPreferredFont: Story = {
  args: { forceFallback: true },
  globals: { viewport: { isRotated: false, value: "narrow" } },
  play: async ({ canvasElement }) => {
    await assertTypographyContract(canvasElement);
    const canvas = within(canvasElement);
    const preview = canvas.getByTestId("typography-preview");
    const sample = canvas.getByTestId("fallback-sample");
    await expect(preview).toHaveClass("typography-preview--forced-fallback");
    await expect(canvas.getByRole("heading", { name: "Missing preferred font" })).toHaveAttribute("lang", "en");
    await expect(getComputedStyle(sample).fontFamily).toContain("__PulmuMissingPreferred__");
    await expect(sample.scrollWidth).toBeLessThanOrEqual(sample.clientWidth);
    await expect(sample.scrollHeight).toBeLessThanOrEqual(sample.clientHeight);
    await expect(sample.getBoundingClientRect().height).toBeGreaterThan(0);
    await expect(canvasElement.clientWidth).toBeLessThanOrEqual(320);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const NarrowReflow: Story = {
  globals: { viewport: { isRotated: false, value: "narrow" } },
  play: async ({ canvasElement }) => {
    await assertTypographyContract(canvasElement);
    await expect(canvasElement.clientWidth).toBeLessThanOrEqual(320);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
