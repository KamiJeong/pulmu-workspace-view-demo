import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PULMU_UI_MATURITY, componentMaturity } from ".";

const css = readFileSync(new URL("./global.css", import.meta.url), "utf8");
const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const tokenCss = readFileSync(new URL("../../tokens/src/global.css", import.meta.url), "utf8");
const tokenDeclarations = new Map(
  [...tokenCss.matchAll(/(--pulmu-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);
const resolveToken = (name: string): string => {
  const value = tokenDeclarations.get(name);
  if (!value) throw new Error(`Missing token ${name}`);
  const reference = value.match(/^var\((--pulmu-[^)]+)\)$/)?.[1];
  return reference ? resolveToken(reference) : value;
};
const rgb = (hex: string) => [0, 2, 4].map((offset) => Number.parseInt(hex.slice(1 + offset, 3 + offset), 16));
const luminance = (channels: number[]) => channels
  .map((channel) => channel / 255)
  .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (first: number[], second: number[]) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

describe("core UI public contract", () => {
  it("publishes every issue #7 primitive at beta maturity", () => {
    expect(PULMU_UI_MATURITY).toBe("beta");
    expect(Object.keys(componentMaturity)).toHaveLength(28);
    expect(new Set(Object.values(componentMaturity))).toEqual(new Set(["beta"]));
  });

  it("exports every coherent component module", () => {
    for (const module of ["a11y", "actions", "content", "feedback", "fields", "navigation", "overlays", "tabs"]) {
      expect(source).toContain(`export * from "./${module}"`);
    }
  });

  it("keeps target, focus, narrow-content, and reduced-motion contracts token driven", () => {
    expect(css).toContain("min-block-size: var(--pulmu-target-size-min)");
    expect(css).toContain("var(--pulmu-focus-ring-width)");
    expect(css).toContain("max-inline-size: min(20rem, calc(100vw");
    expect(css).toContain("var(--pulmu-motion-duration-fast)");
    expect(css).toContain("@media (forced-colors: active)");
  });

  it("keeps destructive hover and active states on the failed-status color family", () => {
    expect(css).toContain(".pulmu-button--danger:hover:not(:disabled)");
    expect(css).toContain(".pulmu-button--danger:active:not(:disabled)");
    expect(css.match(/\.pulmu-button--danger:(?:hover|active)[^{]+\{[^}]+\}/g)?.every((rule) =>
      rule.includes("var(--pulmu-color-status-failed)"),
    )).toBe(true);
    const activeShare = Number(css.match(/\.pulmu-button--danger:active[^}]+status-failed\)\s+(\d+)%/)?.[1]) / 100;
    const activeBackground = rgb(resolveToken("--pulmu-color-status-failed")).map((channel) => channel * activeShare);
    const label = rgb(resolveToken("--pulmu-color-text-inverse"));
    expect(activeShare).toBeGreaterThanOrEqual(0.76);
    expect(contrast(activeBackground, label)).toBeGreaterThanOrEqual(4.5);
  });
});
