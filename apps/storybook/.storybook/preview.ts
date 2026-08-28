import "@pulmu/tokens/global.css";

import type { Preview } from "@storybook/react-vite";

import { PulmuDocsContainer } from "./PulmuDocsContainer";
import { applyPreviewGlobals } from "./previewGlobals";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      applyPreviewGlobals(context.globals);

      return Story();
    },
  ],
  globalTypes: {
    theme: {
      description: "Provisional preview theme",
      toolbar: {
        items: [
          { title: "Dark", value: "dark" },
          { title: "Light", value: "light" },
        ],
      },
    },
    locale: {
      description: "Preview language",
      toolbar: {
        items: [
          { title: "한국어", value: "ko" },
          { title: "English", value: "en" },
        ],
      },
    },
    motion: {
      description: "Preview motion preference",
      toolbar: {
        items: [
          { title: "System", value: "system" },
          { title: "Reduced", value: "reduced" },
        ],
      },
    },
  },
  initialGlobals: {
    locale: "ko",
    motion: "system",
    theme: "dark",
    viewport: { value: "desktop", isRotated: false },
  },
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      expanded: true,
    },
    docs: {
      container: PulmuDocsContainer,
    },
    options: {
      storySort: {
        order: [
          "01 Foundations",
          "02 Tokens",
          "03 Typography",
          "04 Icons",
          "05 Core Components",
          "06 Data Components",
          "07 Forge Components",
          "08 Agent Components",
          "09 Layout Patterns",
          "10 Example Screens",
        ],
      },
    },
    viewport: {
      options: {
        narrow: {
          name: "Narrow (320px)",
          styles: { height: "720px", width: "320px" },
          type: "mobile",
        },
        mobile: {
          name: "Mobile (390px)",
          styles: { height: "844px", width: "390px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet (768px)",
          styles: { height: "1024px", width: "768px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop (1440px)",
          styles: { height: "900px", width: "1440px" },
          type: "desktop",
        },
      },
    },
  },
};

export default preview;
