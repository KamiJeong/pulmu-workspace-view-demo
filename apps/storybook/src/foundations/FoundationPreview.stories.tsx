import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { FoundationPreview } from "./FoundationPreview";
import { getThemeRuntime } from "../theme/themeRuntime";

const meta = {
  title: "01 Foundations/Foundation Preview",
  component: FoundationPreview,
  args: {
    headingOverride: "",
    locale: "ko",
    motion: "system",
    summaryOverride: "",
    theme: "dark",
  },
  argTypes: {
    headingOverride: { control: "text" },
    locale: { control: false },
    motion: { control: false },
    summaryOverride: { control: "text" },
    theme: { control: false },
  },
  parameters: {
    layout: "fullscreen",
  },
  render: (args, context) => (
    <FoundationPreview
      {...args}
      locale={context.globals.locale === "en" ? "en" : "ko"}
      motion={context.globals.motion === "reduced" ? "reduced" : "system"}
      theme={document.documentElement.dataset.theme === "light" ? "light" : "dark"}
    />
  ),
} satisfies Meta<typeof FoundationPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkspaceFoundation: Story = {
  globals: { theme: "dark" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    await expect(document.documentElement).toHaveAttribute("lang", "ko");
    await expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await expect(document.documentElement).toHaveAttribute("data-motion", "system");
    await expect(button).toHaveAccessibleName("미리보기 상태: 비활성");

    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveAccessibleName("미리보기 상태: 활성");
  },
};

export const SystemThemeRuntime: Story = {
  globals: { locale: "en", motion: "reduced", theme: "system" },
  play: async ({ canvasElement }) => {
    const root = document.documentElement;
    const resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const button = within(canvasElement).getByRole("button");

    await expect(root).toHaveAttribute("data-theme", resolvedTheme);
    await expect(root.style.colorScheme).toBe(resolvedTheme);
    await expect(root).toHaveAttribute("lang", "en");
    await expect(root).toHaveAttribute("data-motion", "reduced");

    button.focus();
    await expect(button).toHaveFocus();

    const manualTheme = resolvedTheme === "dark" ? "light" : "dark";
    getThemeRuntime().setPreference(manualTheme);
    await expect(root).toHaveAttribute("data-theme", manualTheme);
    await expect(root.style.colorScheme).toBe(manualTheme);
    await expect(root).toHaveAttribute("lang", "en");
    await expect(root).toHaveAttribute("data-motion", "reduced");
    await expect(button).toHaveFocus();

    getThemeRuntime().setPreference("system");
  },
};
