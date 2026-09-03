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
    expect(capture.indexOf("await stabilizeScreenVisual(target)")).toBeLessThan(capture.indexOf("toMatchScreenshot(name)"));
    expect(capture.match(/target\.isConnected/g)).toHaveLength(2);
  });
});
