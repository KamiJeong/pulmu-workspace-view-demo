import type { StorybookConfig } from "@storybook/react-vite";

const addons: NonNullable<StorybookConfig["addons"]> = [
  "@storybook/addon-docs",
  "@storybook/addon-a11y",
  "@storybook/addon-vitest",
];

if (process.env.STORYBOOK_MCP === "true") {
  addons.push("@storybook/addon-mcp");
}

const config: StorybookConfig = {
  addons,
  docs: {
    defaultName: "Documentation",
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
};

export default config;
