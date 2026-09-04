import { readFileSync } from "node:fs";

import { PULMU_RUN_STATUSES, PULMU_STAGES, PULMU_STAGE_STATUSES } from "@pulmu/model";
import { describe, expect, it } from "vitest";

import {
  chartPalette,
  componentTokens,
  ironAndEmberPalettes,
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

const readSelectorDeclarations = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? "";
  return readDeclarations(block);
};

const darkDeclarations = readSelectorDeclarations(':root[data-theme="dark"]');
const lightDeclarations = readSelectorDeclarations(':root[data-theme="light"]');

const resolveCssVariable = (
  name: string,
  declarations = rootDeclarations,
  seen = new Set<string>(),
): string => {
  if (seen.has(name)) throw new Error(`Circular CSS variable reference: ${name}`);
  const value = declarations.get(name) ?? rootDeclarations.get(name);
  if (!value) throw new Error(`Missing CSS variable: ${name}`);
  const nextSeen = new Set(seen).add(name);
  return value.replace(/var\((--pulmu-[^)]+)\)/g, (_, reference: string) =>
    resolveCssVariable(reference, declarations, nextSeen),
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

const mixWithBlack = (hex: string, share: number) => `#${hexToRgb(hex)
  .map((channel) => Math.round(channel * share).toString(16).padStart(2, "0"))
  .join("")}`;

describe("token registries", () => {
  it("exposes the exact Iron & Ember source palettes", () => {
    expect(ironAndEmberPalettes).toEqual({
      light: {
        canvas: "#F7F7F5", surface: "#FFFFFF", surfaceSubtle: "#F1F1EE", surfaceHover: "#ECEDEA",
        border: "#DADCD8", borderStrong: "#BEC2BE", textPrimary: "#1B1D1F", textSecondary: "#62676C",
        textMuted: "#8D9297", brand: "#D85B26", brandHover: "#BF491B", brandSoft: "#FFF0E8",
        success: "#3F8F62", warning: "#C28A2E", danger: "#C65353", info: "#4D78A8",
      },
      dark: {
        canvas: "#111315", surface: "#171A1D", surfaceSubtle: "#1D2125", surfaceHover: "#24292E",
        border: "#2D3338", borderStrong: "#3A4147", textPrimary: "#F3F4F2", textSecondary: "#A8AFB5",
        textMuted: "#747C83", brand: "#E66A32", brandHover: "#F0783D", brandSoft: "#342018",
        success: "#54A875", warning: "#D5A043", danger: "#D66565", info: "#6590BE",
      },
    });
  });

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

  it("keeps explicit Light and Dark overrides symmetric and below the dark fallback", () => {
    expect([...darkDeclarations.keys()].sort()).toEqual([...lightDeclarations.keys()].sort());
    expect(darkDeclarations.size).toBeGreaterThan(40);
    expect(css.indexOf(':root[data-theme="dark"]')).toBeGreaterThan(css.indexOf("Component tokens"));
    expect(css.indexOf(':root[data-theme="light"]')).toBeGreaterThan(css.indexOf(':root[data-theme="dark"]'));
    expect(css.indexOf("@media (forced-colors: active)")).toBeGreaterThan(css.indexOf(':root[data-theme="light"]'));
    expect(css).toContain(":root[data-theme]");
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
    expect(stageStatusTokens.in_progress.value).toBe("var(--pulmu-color-brand-default)");
    expect(semanticTokens.color.textInverse.value).toBe("var(--pulmu-color-neutral-950)");
    for (const stage of Object.values(stageTokens)) {
      expect(stage.value).toBe("var(--pulmu-color-text-secondary)");
    }
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

  it("defines the Soft Forge depth and radius contract without breaking legacy aliases", () => {
    expect(semanticTokens.color).toMatchObject({
      canvas: { cssVar: "--pulmu-color-surface-canvas" },
      surface: { cssVar: "--pulmu-color-surface-default" },
      surfaceSubtle: { cssVar: "--pulmu-color-surface-subtle" },
      surfaceRaised: { cssVar: "--pulmu-color-surface-raised" },
      surfaceInset: { cssVar: "--pulmu-color-surface-inset" },
      surfaceOverlay: { cssVar: "--pulmu-color-surface-overlay" },
      surfaceElevated: { value: "var(--pulmu-color-surface-subtle)" },
    });
    expect(semanticTokens.shadow).toMatchObject({
      raised: { cssVar: "--pulmu-shadow-raised" },
      inset: { cssVar: "--pulmu-shadow-inset" },
      overlay: { cssVar: "--pulmu-shadow-overlay" },
    });
    expect(semanticTokens.radius).toMatchObject({
      control: { value: "var(--pulmu-radius-sm)" },
      panel: { value: "var(--pulmu-radius-md)" },
      pill: { value: "var(--pulmu-radius-full)" },
    });
    expect(primitiveTokens.shadow.sm.cssVar).toBe("--pulmu-shadow-sm");
    expect(primitiveTokens.shadow.md.cssVar).toBe("--pulmu-shadow-md");
  });

  it("keeps semantic depth values governed by primitive references", () => {
    for (const definition of [
      semanticTokens.color.surfaceRaised,
      semanticTokens.color.surfaceInset,
      semanticTokens.color.surfaceOverlay,
      semanticTokens.shadow.raised,
      semanticTokens.shadow.inset,
      semanticTokens.shadow.overlay,
      semanticTokens.radius.control,
      semanticTokens.radius.panel,
      semanticTokens.radius.pill,
    ]) {
      expect(definition.value).toMatch(/^var\(--pulmu-[\w-]+\)$/);
      expect(definition.value).not.toMatch(/#|rgb\(|\d+px/);
    }
  });
});

describe.each([
  ["light", lightDeclarations],
  ["dark", darkDeclarations],
] as const)("%s theme accessibility contracts", (theme, declarations) => {
  const resolve = ({ cssVar }: { cssVar: string }) => resolveCssVariable(cssVar, declarations);
  const canvas = resolve(semanticTokens.color.canvas);
  const surfaces = [
    canvas,
    resolve(semanticTokens.color.surface),
    resolve(semanticTokens.color.surfaceSubtle),
    resolve(semanticTokens.color.surfaceHover),
    resolve(semanticTokens.color.surfaceRaised),
    resolve(semanticTokens.color.surfaceInset),
    resolve(semanticTokens.color.surfaceOverlay),
  ];

  it("resolves the theme hierarchy and readable text", () => {
    expect(canvas).toBe(ironAndEmberPalettes[theme].canvas);
    expect(resolve(semanticTokens.color.surface)).toBe(ironAndEmberPalettes[theme].surface);
    expect(resolve(semanticTokens.color.surfaceSubtle)).toBe(ironAndEmberPalettes[theme].surfaceSubtle);
    expect(resolve(semanticTokens.color.surfaceHover)).toBe(ironAndEmberPalettes[theme].surfaceHover);
    expect(resolve(semanticTokens.color.surfaceElevated)).toBe(resolve(semanticTokens.color.surfaceSubtle));
    expect(resolve(semanticTokens.color.brand)).toBe(ironAndEmberPalettes[theme].brand);
    expect(resolve(semanticTokens.color.statusSuccess)).toBe(ironAndEmberPalettes[theme].success);
    expect(resolve(semanticTokens.color.statusWarning)).toBe(ironAndEmberPalettes[theme].warning);
    expect(resolve(semanticTokens.color.statusDanger)).toBe(ironAndEmberPalettes[theme].danger);
    expect(resolve(semanticTokens.color.statusInfo)).toBe(ironAndEmberPalettes[theme].info);
    for (const background of surfaces) {
      expect(contrast(resolve(semanticTokens.color.text), background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(resolve(semanticTokens.color.textSecondary), background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(resolve(semanticTokens.color.textMuted), background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(resolve(semanticTokens.color.borderInteractive), background)).toBeGreaterThanOrEqual(3);
      expect(contrast(resolve(semanticTokens.color.focus), background)).toBeGreaterThanOrEqual(3);
    }
  });

  it("resolves each depth shadow from the matching theme source", () => {
    const sourcePrefix = theme === "light" ? "light" : "dark";
    for (const role of ["Raised", "Inset", "Overlay"] as const) {
      const source = primitiveTokens.shadow[`${sourcePrefix}${role}`];
      const semantic = semanticTokens.shadow[role.toLowerCase() as "raised" | "inset" | "overlay"];
      expect(resolve(semantic)).toBe(source.value);
    }
    expect(resolve(semanticTokens.shadow.inset)).toContain("inset");
  });

  it("keeps primary actions and status badge pairs readable", () => {
    const actionForeground = resolve(semanticTokens.color.actionText);
    for (const action of [
      semanticTokens.color.action,
      semanticTokens.color.actionHover,
      semanticTokens.color.actionPressed,
    ]) {
      expect(contrast(actionForeground, resolve(action))).toBeGreaterThanOrEqual(4.5);
    }
    for (const status of ["Success", "Warning", "Danger", "Info"] as const) {
      const foreground = semanticTokens.color[`status${status}Foreground`];
      const subtle = semanticTokens.color[`status${status}Subtle`];
      expect(contrast(resolve(foreground), resolve(subtle))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps legacy danger buttons readable across their mixed interaction fills", () => {
    const dangerFill = resolve(runStatusTokens.failed);
    const dangerForeground = resolve(semanticTokens.color.dangerActionText);
    for (const share of [1, 0.82, 0.76]) {
      expect(contrast(dangerForeground, mixWithBlack(dangerFill, share))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("maps Forge lifecycle state without rainbow stage identities", () => {
    expect(resolve(stageStatusTokens.in_progress)).toBe(ironAndEmberPalettes[theme].brand);
    expect(resolve(stageStatusTokens.completed)).toBe(resolve(semanticTokens.color.statusSuccessForeground));
    expect(resolve(stageStatusTokens.failed)).toBe(resolve(semanticTokens.color.statusDangerForeground));
    expect(resolve(stageStatusTokens.interrupted)).toBe(resolve(semanticTokens.color.statusWarningForeground));
    for (const stage of Object.values(stageTokens)) {
      expect(resolve(stage)).toBe(resolve(semanticTokens.color.textSecondary));
    }
  });

  it("provides theme-aware chart contrast and redundant adjacent differentiation", () => {
    expect(chartPalette).toHaveLength(7);
    for (const series of chartPalette) {
      expect(contrast(series.literals[theme], canvas)).toBeGreaterThanOrEqual(3);
      expect(resolve(series)).toBe(series.literals[theme]);
      expect(series.label).toMatch(/^Series \d$/);
      expect(series.pointShape).not.toBe("");
    }
    for (let index = 1; index < chartPalette.length; index += 1) {
      expect(chartPalette[index].literals[theme]).not.toBe(chartPalette[index - 1].literals[theme]);
      expect(chartPalette[index].dash).not.toBe(chartPalette[index - 1].dash);
      expect(chartPalette[index].pointShape).not.toBe(chartPalette[index - 1].pointShape);
    }
  });
});

describe("theme fallbacks and accessibility overrides", () => {
  it("keeps :root as the dark fallback", () => {
    for (const name of darkDeclarations.keys()) {
      expect(resolveCssVariable(name)).toBe(resolveCssVariable(name, darkDeclarations));
    }
  });

  it("exposes both media-query and explicit reduced-motion overrides", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(':root[data-motion="reduced"]');
    expect(css).toContain("--pulmu-motion-duration-fast: var(--pulmu-duration-instant)");
    expect(semanticTokens.motion.elevationDuration.value).toBe("var(--pulmu-motion-duration-fast)");
    expect(semanticTokens.motion.elevationEasing.value).toBe("var(--pulmu-motion-easing-standard)");
  });

  it("preserves visible forced-color links and native button colors", () => {
    const forcedColors = css.slice(css.lastIndexOf("@media (forced-colors: active)"));
    expect(css).toContain("--pulmu-color-action-default: LinkText");
    expect(css).toContain("--pulmu-color-border-interactive: CanvasText");
    expect(css).toContain("--pulmu-button-background: ButtonFace");
    expect(css).toContain("--pulmu-button-foreground: ButtonText");
    expect(forcedColors).toContain("--pulmu-color-action-text: Canvas;");
    expect(forcedColors).toContain("--pulmu-color-danger-action-text: Canvas;");
    expect(forcedColors).toContain("--pulmu-color-status-danger-foreground: LinkText;");
    for (const name of rootDeclarations.keys()) {
      if (name.includes("shadow")) expect(forcedColors).toContain(`${name}: none;`);
    }
    for (const role of ["raised", "inset", "overlay", "elevated"]) {
      expect(forcedColors).toContain(`--pulmu-color-surface-${role}: Canvas;`);
    }
  });
});
