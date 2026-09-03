import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { adaptPulmuRunContext, RUNNING_RUN_CONTEXT_FIXTURE } from "@pulmu/model";
import {
  FailureInterruptedNotice,
  ForgeStageRail,
  PULMU_UI_MATURITY,
  RetryLoop,
  RunLifecycleStatus,
  componentMaturity,
} from ".";

const css = readFileSync(new URL("./global.css", import.meta.url), "utf8");
const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const tokenCss = readFileSync(new URL("../../tokens/src/global.css", import.meta.url), "utf8");
const rule = (selector: string) => css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]+)\\}`))?.[1] ?? "";

describe("core UI public contract", () => {
  it("publishes every public component at beta maturity", () => {
    expect(PULMU_UI_MATURITY).toBe("beta");
    expect(Object.keys(componentMaturity)).toHaveLength(61);
    expect(new Set(Object.values(componentMaturity))).toEqual(new Set(["beta"]));
  });

  it("exports every coherent component module", () => {
    for (const module of ["a11y", "actions", "charts", "content", "data", "feedback", "fields", "forge", "formatters", "layout", "navigation", "overlays", "tabs"]) {
      expect(source).toContain(`export * from "./${module}"`);
    }
  });

  it("publishes the DS09 semantic layout primitives at beta maturity", () => {
    for (const component of [
      "AppShell", "CollapsibleSidebar", "PageHeader", "MetricGrid", "MasterDetail",
      "ContentWithRail", "FilterDataRegion", "OverflowRegion", "StateLayout", "EmbeddedView",
    ]) {
      expect(componentMaturity[component as keyof typeof componentMaturity]).toBe("beta");
    }
  });

  it("publishes the issue #8 data and visualization surface", () => {
    for (const component of ["BarChart", "ChartSummary", "DataState", "DataTable", "DonutChart", "FilterSummary", "Legend", "LineChart", "MetricCard", "SortableHeader", "TrendIndicator"]) {
      expect(componentMaturity[component as keyof typeof componentMaturity]).toBe("beta");
    }
  });

  it("keeps responsive layouts in logical DOM order with local overflow only", () => {
    expect(css).toContain("@media (min-width: 48rem)");
    expect(css).toContain("@media (min-width: 90rem)");
    expect(rule(".pulmu-overflow-region")).toContain("overflow: auto");
    expect(css).not.toMatch(/\.pulmu-app-shell[^{]*\{[^}]*overflow(?:-[xy])?\s*:/);
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:order|flex-direction:\s*(?:row|column)-reverse)\s*:/m);
  });

  it("renders exactly seven canonical stages with Pattern nested inside Shape", () => {
    const run = adaptPulmuRunContext(RUNNING_RUN_CONTEXT_FIXTURE);
    const markup = renderToStaticMarkup(createElement(ForgeStageRail, { run }));
    const stageItems = [...markup.matchAll(/<li[^>]+data-stage-status="([^"]+)"[\s\S]*?<\/li>/g)];

    expect(markup.match(/data-stage-id=/g)).toHaveLength(7);
    expect([...markup.matchAll(/data-stage-id="([^"]+)"/g)].map((match) => match[1])).toEqual([
      "ignite", "inspect", "shape", "hammer", "quench", "hone", "ship",
    ]);
    expect(markup.indexOf("Pattern")).toBeGreaterThan(markup.indexOf("data-stage-id=\"shape\""));
    expect(markup.indexOf("Pattern")).toBeLessThan(markup.indexOf("data-stage-id=\"hammer\""));
    expect(markup).not.toContain("data-stage-id=\"pattern\"");
    expect(markup.match(/aria-current="step"/g)).toHaveLength(1);
    expect(stageItems.map((item) => item[1])).toEqual([
      "completed", "completed", "completed", "in_progress", "pending", "pending", "pending",
    ]);
    expect(stageItems.map((item) => item[0].match(/<span>(Completed|In progress|Pending)<\/span>/)?.[1])).toEqual([
      "Completed", "Completed", "Completed", "In progress", "Pending", "Pending", "Pending",
    ]);
    expect(markup).toContain("Full forge flow: Ignite: Completed; Inspect: Completed; Shape: Completed; Hammer: In progress; Quench: Pending; Hone: Pending; Ship: Pending.");
  });

  it("switches the seven-column rail to one column before cramped tablet widths", () => {
    expect(css).toContain("@media (max-width: 64rem)");
  });

  it("keeps lifecycle, retry, failed, and interrupted semantics explicit", () => {
    const lifecycle = renderToStaticMarkup(createElement(RunLifecycleStatus, { status: "running" }));
    const retry = renderToStaticMarkup(createElement(RetryLoop, { count: 1, kind: "hone" }));
    const failed = renderToStaticMarkup(createElement(FailureInterruptedNotice, { failureCode: "VERIFY_FAILED", stageId: "quench", status: "failed" }));
    const interrupted = renderToStaticMarkup(createElement(FailureInterruptedNotice, { stageId: "hammer", status: "interrupted" }));

    expect(lifecycle).toContain("Run status");
    expect(retry).toContain("Hone refinement");
    expect(retry).toContain("Hone → Hammer → Quench → Hone");
    expect(retry).not.toContain("data-stage-id");
    expect(failed).toContain('role="alert"');
    expect(interrupted).toContain('role="status"');
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
