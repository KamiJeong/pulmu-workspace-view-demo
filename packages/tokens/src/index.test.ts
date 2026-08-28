import { readFileSync } from "node:fs";

import { PULMU_RUN_STATUSES, PULMU_STAGES, PULMU_STAGE_STATUSES } from "@pulmu/model";
import { describe, expect, it } from "vitest";

import {
  chartPalette,
  componentTokens,
  primitiveTokens,
  runStatusTokens,
  semanticTokens,
  stageStatusTokens,
  stageTokens,
  tokenCatalog,
} from ".";

const css = readFileSync(new URL("./global.css", import.meta.url), "utf8");

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
};

const luminance = (hex: string) => {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (foreground: string, background: string) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

describe("token registries", () => {
  it("keeps every TypeScript token synchronized with the CSS contract", () => {
    const cssValues = new Map<string, string>();
    for (const [, , name, value] of css.matchAll(/(^|\s)(--pulmu-[\w-]+):\s*([^;]+);/gm)) {
      if (!cssValues.has(name)) cssValues.set(name, value.trim());
    }

    expect(new Set(tokenCatalog.map(({ cssVar }) => cssVar)).size).toBe(tokenCatalog.length);
    for (const definition of tokenCatalog) {
      expect(cssValues.get(definition.cssVar)?.replaceAll('"', "'")).toBe(
        definition.value.replaceAll('"', "'"),
      );
    }
    expect(css.indexOf("Primitive tokens")).toBeLessThan(css.indexOf("Semantic tokens"));
    expect(css.indexOf("Semantic tokens")).toBeLessThan(css.indexOf("Component tokens"));
  });

  it("enforces primitive to semantic to component dependency direction", () => {
    const primitiveNames = new Set<string>(tokenCatalog.filter(({ layer }) => layer === "primitive").map(({ cssVar }) => cssVar));
    const semanticNames = new Set<string>(tokenCatalog.filter(({ layer }) => layer === "semantic").map(({ cssVar }) => cssVar));

    expect(Object.keys(primitiveTokens)).not.toHaveLength(0);
    expect(Object.keys(semanticTokens)).not.toHaveLength(0);
    expect(Object.keys(componentTokens)).not.toHaveLength(0);

    for (const definition of tokenCatalog) {
      const references = [...definition.value.matchAll(/var\((--pulmu-[^)]+)\)/g)].map((match) => match[1]);
      if (definition.layer === "primitive") expect(references).toHaveLength(0);
      if (definition.layer === "semantic") {
        expect(references.every((name) => primitiveNames.has(name) || semanticNames.has(name))).toBe(true);
      }
      if (definition.layer === "component") {
        expect(references.every((name) => semanticNames.has(name))).toBe(true);
      }
    }
  });

  it("derives exact lifecycle and stage coverage from the canonical model", () => {
    expect(Object.keys(runStatusTokens)).toEqual([...PULMU_RUN_STATUSES]);
    expect(Object.keys(stageStatusTokens)).toEqual([...PULMU_STAGE_STATUSES]);
    expect(Object.keys(stageTokens)).toEqual(PULMU_STAGES.map(({ id }) => id));
  });
});

describe("dark theme accessibility contracts", () => {
  const canvas = primitiveTokens.color.neutral950.value;
  const surface = primitiveTokens.color.neutral900.value;
  const elevated = primitiveTokens.color.neutral850.value;

  it("meets documented text and UI-boundary contrast thresholds", () => {
    expect(contrast(primitiveTokens.color.neutral100.value, canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(primitiveTokens.color.neutral400.value, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(primitiveTokens.color.neutral700.value, elevated)).toBeGreaterThanOrEqual(3);
    expect(contrast(primitiveTokens.color.orange400.value, primitiveTokens.color.neutral950.value)).toBeGreaterThanOrEqual(3);
  });

  it("keeps the focus ring identifiable on every dark surface", () => {
    const focus = primitiveTokens.color.orange300.value;
    for (const background of [canvas, surface, elevated]) {
      expect(contrast(focus, background)).toBeGreaterThanOrEqual(3);
    }
    expect(semanticTokens.focusRing.width.value).toBe("3px");
    expect(semanticTokens.target.minimum.value).toBe("var(--pulmu-size-control)");
  });

  it("provides contrast and redundant adjacent differentiation for chart series", () => {
    expect(chartPalette).toHaveLength(7);
    for (const series of chartPalette) {
      expect(contrast(series.literal, canvas)).toBeGreaterThanOrEqual(3);
      expect(series.label).toMatch(/^Series \d$/);
      expect(series.pointShape).not.toBe("");
    }
    for (let index = 1; index < chartPalette.length; index += 1) {
      expect(chartPalette[index].value).not.toBe(chartPalette[index - 1].value);
      expect(chartPalette[index].literal).not.toBe(chartPalette[index - 1].literal);
      expect(chartPalette[index].dash).not.toBe(chartPalette[index - 1].dash);
      expect(chartPalette[index].pointShape).not.toBe(chartPalette[index - 1].pointShape);
    }
  });

  it("exposes both media-query and explicit reduced-motion overrides", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(':root[data-motion="reduced"]');
    expect(css).toContain("--pulmu-motion-duration-fast: var(--pulmu-duration-instant)");
  });
});
