import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const helperSource = readFileSync(new URL("../src/screens/screenTestUtils.ts", import.meta.url), "utf8");
const componentMapStorySource = readFileSync(new URL("../src/screens/ComponentMap.stories.tsx", import.meta.url), "utf8");

describe("Storybook visual stabilization contract", () => {
  it("settles focus, location, scroll, and two animation frames before each Component Map capture", () => {
    const helper = helperSource.slice(
      helperSource.indexOf("export async function stabilizeScreenVisual"),
      helperSource.indexOf("export async function matchScreenScreenshot"),
    );
    const capture = componentMapStorySource.match(/async function matchComponentMapScreenshot[\s\S]*?\n\}/)?.[0] ?? "";

    expect(helper).toContain("await document.fonts.ready");
    expect(helper).toContain("document.activeElement.blur()");
    expect(helper).toContain("view.history.replaceState");
    expect(helper).toContain("view.scrollTo(0, 0)");
    expect(helper).toContain("document.documentElement.scrollTop = 0");
    expect(helper).toContain("document.body.scrollTop = 0");
    expect(helper.match(/requestAnimationFrame/g)).toHaveLength(2);
    expect(capture.indexOf('previewFrame.style.setProperty("height"')).toBeLessThan(capture.indexOf("await stabilizeScreenVisual(target)"));
    expect(capture).toContain('previewFrame.style.setProperty("transform", "none", "important")');
    expect(capture.indexOf("await stabilizeScreenVisual(target)")).toBeLessThan(capture.indexOf("toMatchScreenshot(name)"));
    expect(capture.match(/stabilizeScreenVisual/g)).toHaveLength(1);
    expect(capture.match(/target\.isConnected/g)).toHaveLength(2);
    expect(capture.indexOf("try {")).toBeLessThan(capture.indexOf("toMatchScreenshot(name)"));
    expect(capture.indexOf("toMatchScreenshot(name)")).toBeLessThan(capture.indexOf("finally {"));
    expect(capture).toContain('previewFrame.removeAttribute("style")');
    expect(capture).toContain('previewFrame.setAttribute("style", originalStyle)');
  });

  it("captures the connected Component Map once per viewport instead of looping over sections", () => {
    const visualStory = componentMapStorySource.match(/const visualStory[\s\S]*?\n\}\);/)?.[0] ?? "";

    expect(componentMapStorySource).not.toContain("matchComponentMapSections");
    expect(visualStory.match(/matchComponentMapScreenshot/g)).toHaveLength(1);
    expect(visualStory).toContain('within(canvasElement).getByRole("main")');
    expect(visualStory).toContain('`component-map-${viewport}.png`');
    expect(visualStory).not.toContain("document.documentElement");
    expect(componentMapStorySource.match(/= visualStory\("(?:desktop|tablet|mobile|narrow)"\);/g)).toHaveLength(4);
  });
});
