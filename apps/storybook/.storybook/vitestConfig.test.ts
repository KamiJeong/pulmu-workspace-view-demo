import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../vitest.config.ts", import.meta.url), "utf8");

describe("Storybook browser test scheduling", () => {
  it("serializes files on the single Chromium instance without masking regressions with a longer timeout", () => {
    const browserConfig = source.match(/browser:\s*\{([\s\S]*?)\n\s*\},\n\s*name: "storybook"/)?.[1] ?? "";

    expect(browserConfig).toContain("fileParallelism: false");
    expect(browserConfig).toContain('instances: [{ browser: "chromium" }]');
    expect(source).toContain("testTimeout: 30_000");
  });
});
