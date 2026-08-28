import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const docsCss = readFileSync(new URL("./PulmuDocsContainer.css", import.meta.url), "utf8");
const tokenCss = readFileSync(new URL("../../../packages/tokens/src/global.css", import.meta.url), "utf8");
const rootTokens = tokenCss.match(/^:root\s*\{([\s\S]*?)^\}/m)?.[1] ?? "";
const declarations = new Map(
  [...rootTokens.matchAll(/(--pulmu-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);
const resolveToken = (name: string): string => {
  const value = declarations.get(name);
  if (!value) throw new Error(`Missing token ${name}`);
  const reference = value.match(/^var\((--pulmu-[^)]+)\)$/)?.[1];
  return reference ? resolveToken(reference) : value;
};
const channels = (hex: string) => [0, 2, 4].map((offset) => Number.parseInt(hex.slice(1 + offset, 3 + offset), 16));
const luminance = (hex: string) => channels(hex)
  .map((channel) => channel / 255)
  .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (first: string, second: string) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

describe("Pulmu docs ArgTypes contrast", () => {
  it("scopes readable metadata tokens to dark ArgTypes tables", () => {
    const override = docsCss.match(/:root\[data-theme="dark"\][\s\S]+?\.docblock-argstable-body[\s\S]+?\{([^}]+)\}/)?.[1] ?? "";
    expect(override).toContain("color: var(--pulmu-color-text-muted) !important");
    expect(contrast(
      resolveToken("--pulmu-color-text-muted"),
      resolveToken("--pulmu-color-surface-default"),
    )).toBeGreaterThanOrEqual(4.5);
    expect(docsCss).not.toContain(':root[data-theme="light"] .sbdocs-content .docblock-argstable');
  });
});
