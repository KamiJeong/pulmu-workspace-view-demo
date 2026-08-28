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

const rootBlock = css.match(/^:root\s*\{([\s\S]*?)^\}/m)?.[1] ?? "";
const readDeclarations = (source: string) =>
  new Map(
    [...source.matchAll(/(^|\s)(--pulmu-[\w-]+):\s*([^;]+);/gm)]
      .map(([, , name, value]) => [name, value.trim()] as const),
  );
const rootDeclarations = readDeclarations(rootBlock);

const resolveCssVariable = (name: string, seen = new Set<string>()): string => {
  if (seen.has(name)) throw new Error(`Circular CSS variable reference: ${name}`);
  const value = rootDeclarations.get(name);
  if (!value) throw new Error(`Missing CSS variable: ${name}`);
  const nextSeen = new Set(seen).add(name);
  return value.replace(/var\((--pulmu-[^)]+)\)/g, (_, reference: string) =>
    resolveCssVariable(reference, nextSeen),
  );
};

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
    const catalogNames = tokenCatalog.map(({ cssVar }) => cssVar);
    expect(new Set(catalogNames).size).toBe(tokenCatalog.length);
    expect([...rootDeclarations.keys()].sort()).toEqual([...catalogNames].sort());
    for (const definition of tokenCatalog) {
      expect(rootDeclarations.get(definition.cssVar)?.replaceAll('"', "'")).toBe(
        definition.value.replaceAll('"', "'"),
      );
    }

    for (const name of readDeclarations(css).keys()) {
      expect(rootDeclarations.has(name), `Scoped override must redeclare a base token: ${name}`).toBe(true);
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

  it("maps each typography role to the shared primitive scale", () => {
    expect(semanticTokens.typography).toMatchObject({
      headingFamily: { value: "var(--pulmu-font-family-sans)" },
      headingPageSize: { value: "var(--pulmu-font-size-xl)" },
      headingSectionSize: { value: "var(--pulmu-font-size-lg)" },
      headingLineHeight: { value: "var(--pulmu-line-height-tight)" },
      headingWeight: { value: "var(--pulmu-font-weight-bold)" },
      bodyFamily: { value: "var(--pulmu-font-family-sans)" },
      bodySize: { value: "var(--pulmu-font-size-md)" },
      bodyLineHeight: { value: "var(--pulmu-line-height-normal)" },
      bodyWeight: { value: "var(--pulmu-font-weight-regular)" },
      labelFamily: { value: "var(--pulmu-font-family-sans)" },
      labelSize: { value: "var(--pulmu-font-size-sm)" },
      labelLineHeight: { value: "var(--pulmu-line-height-normal)" },
      labelWeight: { value: "var(--pulmu-font-weight-medium)" },
      captionFamily: { value: "var(--pulmu-font-family-sans)" },
      captionSize: { value: "var(--pulmu-font-size-xs)" },
      captionLineHeight: { value: "var(--pulmu-line-height-normal)" },
      captionWeight: { value: "var(--pulmu-font-weight-regular)" },
      metricFamily: { value: "var(--pulmu-font-family-sans)" },
      metricSize: { value: "var(--pulmu-font-size-xl)" },
      metricLineHeight: { value: "var(--pulmu-line-height-tight)" },
      metricWeight: { value: "var(--pulmu-font-weight-bold)" },
      metricVariantNumeric: { value: "tabular-nums" },
      codeFamily: { value: "var(--pulmu-font-family-mono)" },
      codeSize: { value: "var(--pulmu-font-size-sm)" },
      codeLineHeight: { value: "var(--pulmu-line-height-normal)" },
      codeWeight: { value: "var(--pulmu-font-weight-regular)" },
    });
    expect(primitiveTokens.fontFamily.sans.value).toMatch(/^Inter, .*system-ui.*sans-serif$/);
  });
});

describe("dark theme accessibility contracts", () => {
  const resolve = ({ cssVar }: { cssVar: string }) => resolveCssVariable(cssVar);
  const canvas = resolve(semanticTokens.color.canvas);
  const surface = resolve(semanticTokens.color.surface);
  const elevated = resolve(semanticTokens.color.surfaceElevated);

  it("meets documented text and UI-boundary contrast thresholds", () => {
    expect(contrast(resolve(semanticTokens.color.text), canvas)).toBeGreaterThanOrEqual(4.5);
    for (const background of [canvas, surface, elevated]) {
      expect(contrast(resolve(semanticTokens.color.textMuted), background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(resolve(semanticTokens.color.border), elevated)).toBeGreaterThanOrEqual(3);
    expect(contrast(resolve(semanticTokens.color.action), canvas)).toBeGreaterThanOrEqual(3);
  });

  it("keeps the focus ring identifiable on every dark surface", () => {
    const focus = resolve(semanticTokens.color.focus);
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

  it("preserves visible forced-color links and native button colors", () => {
    expect(css).toContain("--pulmu-color-action-default: LinkText");
    expect(css).toContain("--pulmu-button-background: ButtonFace");
    expect(css).toContain("--pulmu-button-foreground: ButtonText");
  });
});
