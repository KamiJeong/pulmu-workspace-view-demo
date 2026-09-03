import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PULMU_UI_MATURITY, componentMaturity } from ".";

const css = readFileSync(new URL("./global.css", import.meta.url), "utf8");
const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const tokenCss = readFileSync(new URL("../../tokens/src/global.css", import.meta.url), "utf8");
const rule = (selector: string) => css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]+)\\}`))?.[1] ?? "";

describe("core UI public contract", () => {
  it("publishes every issue #7 primitive at beta maturity", () => {
    expect(PULMU_UI_MATURITY).toBe("beta");
    expect(Object.keys(componentMaturity)).toHaveLength(39);
    expect(new Set(Object.values(componentMaturity))).toEqual(new Set(["beta"]));
  });

  it("exports every coherent component module", () => {
    for (const module of ["a11y", "actions", "charts", "content", "data", "feedback", "fields", "formatters", "navigation", "overlays", "tabs"]) {
      expect(source).toContain(`export * from "./${module}"`);
    }
  });

  it("publishes the issue #8 data and visualization surface", () => {
    for (const component of ["BarChart", "ChartSummary", "DataState", "DataTable", "DonutChart", "FilterSummary", "Legend", "LineChart", "MetricCard", "SortableHeader", "TrendIndicator"]) {
      expect(componentMaturity[component as keyof typeof componentMaturity]).toBe("beta");
    }
  });

  it("keeps target, focus, narrow-content, and reduced-motion contracts token driven", () => {
    expect(css).toContain("min-block-size: var(--pulmu-target-size-min)");
    expect(css).toContain("var(--pulmu-focus-ring-width)");
    expect(css).toContain("max-inline-size: min(20rem, calc(100vw");
    expect(css).toContain("var(--pulmu-motion-duration-fast)");
    expect(css).toContain("@media (forced-colors: active)");
  });

  it("uses only current semantic and component color roles", () => {
    expect(css).not.toMatch(/--pulmu-color-surface-elevated|--pulmu-color-status-(?:running|completed|failed|interrupted)/);
    expect(css).not.toMatch(/color-mix\(|(?:background|color|border(?:-color)?):\s*(?:#|rgb\()/);
    for (const [, token] of css.matchAll(/var\((--pulmu-[\w-]+)\)/g)) {
      expect(tokenCss, `missing token declaration for ${token}`).toContain(`${token}:`);
    }
  });

  it("keeps primary, secondary, quiet, and danger interaction states isolated", () => {
    expect(rule(".pulmu-button--primary:hover:not(:disabled)")).toContain("var(--pulmu-color-action-hover)");
    expect(rule(".pulmu-button--primary:active:not(:disabled)")).toContain("var(--pulmu-color-action-pressed)");
    expect(rule(".pulmu-button--secondary")).toContain("var(--pulmu-color-surface-default)");
    expect(rule(".pulmu-button--secondary:hover:not(:disabled)")).toContain("var(--pulmu-color-surface-hover)");
    expect(rule(".pulmu-button--secondary:active:not(:disabled)")).toContain("var(--pulmu-color-surface-subtle)");
    expect(rule(".pulmu-button--quiet:hover:not(:disabled)")).toContain("var(--pulmu-color-surface-hover)");
    expect(rule(".pulmu-button--quiet:active:not(:disabled)")).toContain("var(--pulmu-color-surface-subtle)");
    expect(rule(".pulmu-button--danger")).toContain("var(--pulmu-color-status-danger-foreground)");
    expect(rule(".pulmu-button--danger:hover:not(:disabled)")).toContain("var(--pulmu-color-danger-action-text)");
    expect(rule(".pulmu-button--danger:active:not(:disabled)")).toContain("var(--pulmu-color-danger-action-text)");
    expect(css).not.toMatch(/\.pulmu-button:(?:hover|active):not\(:disabled\)/);
  });

  it("covers field, selection, focus, invalid, and disabled states", () => {
    expect(rule(".pulmu-input:hover:not(:disabled), .pulmu-select:hover:not(:disabled)")).toContain("var(--pulmu-color-border-strong)");
    expect(rule(".pulmu-input:focus-visible, .pulmu-select:focus-visible")).toContain("var(--pulmu-color-border-interactive)");
    expect(rule(".pulmu-input:disabled, .pulmu-select:disabled")).toContain("var(--pulmu-color-surface-subtle)");
    expect(rule(".pulmu-field--invalid .pulmu-input, .pulmu-field--invalid .pulmu-select")).toContain("var(--pulmu-color-status-danger-foreground)");
    expect(rule(".pulmu-check:checked + .pulmu-check__visual, .pulmu-check-field__label:hover .pulmu-check:checked:not(:disabled) + .pulmu-check__visual")).toContain("var(--pulmu-color-brand-soft)");
    expect(rule(".pulmu-check:focus-visible + .pulmu-check__visual")).toContain("var(--pulmu-focus-ring-width)");
  });

  it("uses subtle status fills and restrained surface hierarchy", () => {
    for (const tone of ["info", "success", "warning", "danger"]) {
      expect(rule(`.pulmu-tone--${tone}`)).toContain(`var(--pulmu-color-status-${tone}-subtle)`);
      expect(rule(`.pulmu-tone--${tone}`)).toContain(`var(--pulmu-color-status-${tone}-foreground)`);
    }
    expect(rule(".pulmu-card")).toContain("var(--pulmu-panel-background)");
    expect(rule(".pulmu-card")).toContain("var(--pulmu-shadow-raised)");
    expect(rule(".pulmu-tooltip__content, .pulmu-popover__content, .pulmu-menu__content")).toContain("var(--pulmu-color-surface-default)");
    expect(rule(".pulmu-tooltip__content, .pulmu-popover__content, .pulmu-menu__content")).toContain("var(--pulmu-shadow-overlay)");
    expect(css).toMatch(/(?:^|\n)\.pulmu-tabs__tab\[aria-selected="true"\]\s*\{[^}]+var\(--pulmu-color-brand-soft\)/);
  });
});
