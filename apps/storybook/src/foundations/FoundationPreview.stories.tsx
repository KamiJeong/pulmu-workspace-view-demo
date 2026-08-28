import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { FoundationPreview } from "./FoundationPreview";

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
      theme={context.globals.theme === "light" ? "light" : "dark"}
    />
  ),
} satisfies Meta<typeof FoundationPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkspaceFoundation: Story = {
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
