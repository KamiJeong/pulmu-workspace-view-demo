import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  BadgeCheck,
  DraftingCompass,
  Flame,
  Hammer,
  PackageCheck,
  Palette,
  Search,
  Waves,
} from "lucide-react";
import {
  PULMU_PATTERN_PASS,
  PULMU_RUN_STATUSES,
  PULMU_STAGES,
  PULMU_STAGE_STATUSES,
} from "@pulmu/model";
import { describe, expect, it } from "vitest";

import {
  BRAND_ICONS,
  ICON_SIZES,
  ICON_STROKE_WIDTH,
  LoadingIcon,
  PULMU_PATTERN_ICON,
  PULMU_RUN_STATUS_ICONS,
  PULMU_STAGE_ICONS,
  PULMU_STAGE_STATUS_ICONS,
  PulmuIcon,
  UI_ICONS,
} from ".";

describe("icon contract", () => {
  it("uses the canonical token sizes and two-pixel stroke", () => {
    expect(ICON_SIZES).toEqual({
      sm: "var(--pulmu-size-icon-sm)",
      md: "var(--pulmu-size-icon-md)",
    });
    expect(ICON_STROKE_WIDTH).toBe(2);
  });

  it("covers every run and stage lifecycle status", () => {
    expect(Object.keys(PULMU_RUN_STATUS_ICONS)).toEqual([...PULMU_RUN_STATUSES]);
    expect(Object.keys(PULMU_STAGE_STATUS_ICONS)).toEqual([...PULMU_STAGE_STATUSES]);
  });

  it("derives the exact canonical stage mapping in order", () => {
    expect(PULMU_STAGE_ICONS.map(({ id, icon, name, step }) => ({ id, icon, name, step }))).toEqual(
      PULMU_STAGES,
    );
    expect(PULMU_STAGE_ICONS.map(({ glyph }) => glyph)).toEqual([
      Flame,
      Search,
      DraftingCompass,
      Hammer,
      Waves,
      BadgeCheck,
      PackageCheck,
    ]);
  });

  it("keeps Pattern nested below Shape", () => {
    expect(PULMU_PATTERN_ICON).toMatchObject(PULMU_PATTERN_PASS);
    expect(PULMU_PATTERN_ICON.glyph).toBe(Palette);
    expect(PULMU_PATTERN_ICON.parentStageId).toBe("shape");
    expect(PULMU_PATTERN_ICON.topLevel).toBe(false);
    expect(PULMU_STAGE_ICONS.map(({ id }) => id)).not.toContain("pattern");
  });

  it("keeps general, lifecycle, stage, and brand registries distinct", () => {
    expect(UI_ICONS).not.toBe(PULMU_RUN_STATUS_ICONS);
    expect(PULMU_RUN_STATUS_ICONS).not.toBe(PULMU_STAGE_STATUS_ICONS);
    expect(BRAND_ICONS).not.toBe(UI_ICONS);
    expect(Object.keys(BRAND_ICONS)).toEqual(["pulmu"]);
    expect(Object.keys(UI_ICONS)).not.toContain("pulmu");
  });
});

describe("PulmuIcon accessibility", () => {
  it("hides decorative icons and keeps them unfocusable", () => {
    const markup = renderToStaticMarkup(
      createElement(PulmuIcon, { decorative: true, icon: UI_ICONS.search, size: "sm" }),
    );

    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('focusable="false"');
    expect(markup).not.toContain('role="img"');
    expect(markup).not.toContain("aria-label");
  });

  it("labels meaningful icons and renders visible loading text", () => {
    const iconMarkup = renderToStaticMarkup(
      createElement(PulmuIcon, {
        decorative: false,
        icon: UI_ICONS.info,
        label: "Icon guidance",
      }),
    );
    const loadingMarkup = renderToStaticMarkup(
      createElement(LoadingIcon, { label: "Loading workspace" }),
    );

    expect(iconMarkup).toContain('role="img"');
    expect(iconMarkup).toContain('aria-label="Icon guidance"');
    expect(iconMarkup).toContain('stroke-width="2"');
    expect(loadingMarkup).toContain('role="status"');
    expect(loadingMarkup).toContain("Loading workspace");
    expect(loadingMarkup).toContain("pulmu-loading-icon__glyph");
  });
});
